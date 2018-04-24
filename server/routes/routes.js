//server/routes/routes.js
var express = require('express');
var request = require("request");
var twitterApi = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../../models/User');
var bearerToken = require('../../config.js').bearerToken;
var profile = require('../../profileJacob.json');

router.get('/', function(req, res){
  res.render('index');
});

router.route('/fetchUser')
.post(function(req,res) {
  var user = new User();
  var options = {
    method: 'GET',
    url: twitterApi,
    qs: {
      "screen_name": req.body.name,
      "count": 200,
    },
    json: true,
    headers: {
      "Authorization": "Bearer " + bearerToken
    }
  };

  user.name = req.body.name;

  User.findOne({ name: user.name }, function (err, response) {
    if (err) {
      res.send(err);
    // If there's no data in the database, make the API call to twitter
    } else if (response == null) {
      request(options, function (error, response, body) {
        if (!error) {
          const formattedTweets = formatTwitterResponse(body);
          var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
          var personality_insights = new PersonalityInsightsV3({
            username: '34442ff0-5fd6-4772-ba9e-9e7a1fe3dad5',
            password: 'heBS6eLUnyDQ',
            version_date: '2017-10-13'
          });

          var params = {
            content: formattedTweets,
            content_type: 'application/json',
            raw_scores: true
          };

          personality_insights.profile(params, function(error, response) {
            if (error)
              console.log('Error:', error);
            else {
              var personality = formatWatsonResponse(response);
              user.tweets = body;
              user.personality = personality;
              user.save(function (err) {
                if (err)
                  res.send(err);
                res.send(user.personality);
              });
            }
          });
          // user.tweets = body;
          // user.personality = personality;
          // user.save(function (err) {
          //   if (err)
          //     res.send(err);
          //   res.send(user);
          // });
        }
        else {
          res.status(500).json({ error: error });
        }
      });
    // If data is found in cache, return it
    } else {
      res.send(response.personality);
    }
  });
});

function fetchPersonality(body) {
  var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
  var personality_insights = new PersonalityInsightsV3({
    username: '34442ff0-5fd6-4772-ba9e-9e7a1fe3dad5',
    password: 'heBS6eLUnyDQ',
    version_date: '2017-10-13'
  });

  var params = {
    content: body,
    content_type: 'application/json',
    raw_scores: true
  };

  personality_insights.profile(params, function(error, response) {
    if (error)
      console.log('Error:', error);
    else {
      formatWatsonResponse(response);
    }
  });
}

function formatTwitterResponse(twitterResponse) {
  var formattedTweets = {
    "contentItems": [],
  };
  for (var i=0; i < twitterResponse.length; i++) {
    var tweet = {
      "content": twitterResponse[i].text,
      "contenttype": "text/plain",
      "id": twitterResponse[i].id_str,
      "language": twitterResponse[i].lang
    };
    formattedTweets.contentItems.push(tweet);
  }

  return(formattedTweets);
}

function formatWatsonResponse(watsonResponse) {
  var formattedPersonality = [];
  for (var i=0; i < watsonResponse.personality.length; i++) {
    var trait = {
      "name": watsonResponse.personality[i].name,
      "percentile": watsonResponse.personality[i].percentile,
      "raw_score": watsonResponse.personality[i].raw_score,
    };
    formattedPersonality.push(trait);
  }
  return(formattedPersonality);
}

module.exports = router;
