//server/routes/routes.js
var express = require('express');
var axios = require('axios');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../../models/User');
var bearerToken = require('../../config.js').bearerToken;

router.get('/', function(req, res){
  res.render('index');
});

router.route('/fetchUser')
.post(function(req,res) {
  var user = new User();
  user.name = req.body.name;
  User.findOne({ name: req.body.name }, function (err, response) {
    if (err) {
      res.send(err);
    // If there's no data in the database create a user
    } else if (response == null) {
      axios.get('https://api.twitter.com/1.1/statuses/user_timeline.json', {
        params: {
          "screen_name": req.body.name,
          "count": 200,
        },
        headers: {
          "Authorization": "Bearer " + bearerToken
        }
      })
      .then(response => response.data)
      .then(twitterData => formatTwitterResponse(twitterData))
      .then(tweets => {
        user.tweets = tweets;
        return getProfile(tweets)
      })
      .then(personalityProfile => formatWatsonResponse(personalityProfile))
      .then(personalityTraits => {
        user.personality = personalityTraits;
        user.save();
        res.send(user.personality);
      })
      .catch((error) => {
        res.status(500).json({ error: error });
      });
    // If data is found in cache, return it
    } else {
      res.send(response.personality);
    }
  })
  .then(() => {
    return new Promise(function(resolve, reject) {
      axios.all([
        axios.get('https://api.twitter.com/1.1/followers/list.json', {
          params: {
            "screen_name": user.name,
            "count": 200,
          },
          headers: {
            "Authorization": "Bearer " + bearerToken
          }
        }),
        axios.get('https://api.twitter.com/1.1/friends/list.json', {
          params: {
            "screen_name": user.name,
            "count": 200,
          },
          headers: {
            "Authorization": "Bearer " + bearerToken
          }
        })
      ])
      .then(axios.spread((followers,friends) => {
        const friendsUserNames = friends.data.users.map((user) => user.screen_name);
        const followersUserNames = followers.data.users.map((user) => user.screen_name);
        resolve(friendsUserNames.concat(followersUserNames));
      }))
      .catch((error) => {
        res.status(500).json({ error: error });
        reject(error);
      });
    });
  })
  .then(usernames => usernames.map(username => createUser(username)))
  .catch((error) => {
    res.status(500).json({ error: error });
  });
});

const createUser = (username) =>
  new Promise(function(resolve, reject) {
    var user = new User();
    user.name = username;
    axios.get('https://api.twitter.com/1.1/statuses/user_timeline.json', {
      params: {
        "screen_name": username,
        "count": 200,
      },
      headers: {
        "Authorization": "Bearer " + bearerToken
      }
    })
    .then(response => response.data)
    .then(twitterData => formatTwitterResponse(twitterData))
    .then(tweets => {
      user.tweets = tweets;
      return getProfile(tweets)
    })
    .then(personalityProfile => formatWatsonResponse(personalityProfile))
    .then(personalityTraits => {
      user.personality = personalityTraits;
      user.save();
      return user;
    })
    .then(user => resolve(user))
    .catch((error) => {
      reject(error);
    });
  });

const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
const personalityInsights = new PersonalityInsightsV3({
  username: '34442ff0-5fd6-4772-ba9e-9e7a1fe3dad5',
  password: 'heBS6eLUnyDQ',
  version_date: '2017-10-13'
});

const getProfile = (tweets) =>
  new Promise((resolve, reject) => {
    var params = {
      content: tweets,
      content_type: 'application/json',
      raw_scores: true
    };

    return personalityInsights.profile(params, (err, profile) => {
      if (err) {
        reject(err);
      } else {
        resolve(profile);
      }
    });
});

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
