//server/routes/routes.js
var express = require('express');
var axios = require('axios');
var router = express.Router();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var User = require('../../models/User');
var oauth = require('oauth');
var bearerToken = require('../../config.js').bearerToken;

// Get the twitter consumer key and secret
var twitterConsumerKey = "nM9Ti3fALEAFUsZaqKpkFGmoG";
var twitterConsumerSecret = "ecEiAeVVbmJwGFkeiek1SprGcRswaNkKaswuTfSOo4zQ1JjiXY";

// Create the OAuth
var consumer = new oauth.OAuth(
  "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
  twitterConsumerKey, twitterConsumerSecret, "1.0A", 'http://127.0.0.1:3000/sessions/callback', "HMAC-SHA1");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cookieParser());
// Create the secret for the session
router.use(session({ secret: "top secret", resave: false, saveUninitialized: true }));

// Store the session data into local session
router.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

router.get('/', function(req, res){
  res.render('index');
});

router.route('/fetchUser')
.post(function(req,res) {
  let myUser = [];
  const user = new Promise(function(resolve, reject) {
    User.findOne({ name: req.body.name }, function (err, response) {
      if (err) {
        reject(err);
      // If there's no data in the database create a user
      } else if (response == null) {
        let userPromise = createUser(req.body.name)
        userPromise.then((newUser) => {
          resolve(newUser);
        })
        .catch((error) => res.status(500).json({ error: error }));
      } else {
        resolve(response);
      }
    });
  });
  const usernamesPromise = new Promise(function(resolve, reject) {
    user.then(user => {
      myUser = user;
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
  });
  usernamesPromise.then(usernames => {
    Promise.all(usernames.map((username) => createUser(username)))
    .then(users => {
      users.map(user => user.save());
      return users;
    })
    .then(responses => euclideanDistance(myUser.personality, responses))
    .then(matches => {
      myUser.matches = matches;
      myUser.save();
      console.log(myUser);
      res.send(myUser);
    });
  });
});

// Generate the Oauth request token
router.get('/sessions/connect', function (req, res) {
  consumer.getOAuthRequestToken(function (error, oauthToken, oauthTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth request token : " + error, 500);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.send(req.session.oauthRequestToken);
      // res.redirect("https://twitter.com/oauth/authorize?oauth_token=" + req.session.oauthRequestToken);
    }
  });
});

// Get the Oauth access token
router.get('/sessions/callback', function (req, res) {
  consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth access token : " + error + "[" + oauthAccessToken + "]" + "[" + oauthAccessTokenSecret + "]" + "[" + result + "]", 500);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

      res.redirect('/results');
    }
  });
});

// Set up the login page route
router.get('/home', function (req, res) {
  consumer.get("http://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
    if (error) {
      // console.log(error);
      res.redirect('/sessions/connect');
    } else {
      var parsedData = JSON.parse(data);
      res.send('You are signed in: ' + parsedData.screen_name);
    }
  });
});

const euclideanDistance = (userPersonality, otherUsers) => {
  let matches = [];
  otherUsers.forEach(otherUser => {
    let sum = 0;
    for(var i = 0; i < 5; i += 1) {
      sum += userPersonality[i].raw_score - otherUser.personality[i].raw_score;
    }
    const result = Math.sqrt(Math.abs(sum));
    const userObject = {
      'username': otherUser.name,
      'personality': otherUser.personality,
      'similarity': result,
    };
    if (matches.length < 5) {
      matches.push(userObject)
    } else {
      for(var i = 0; i < 5; i += 1) {
        if (result < matches[i].similarity) {
          matches[i] = userObject;
          return;
        }
      }
    }
  });
  return matches;
}


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
