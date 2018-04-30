//server/routes/routes.js
var express = require('express');
var request = require("request");
var twitterApi = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
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
          user.tweets = body;
          user.save(function (err) {
            if (err)
              res.send(err);
            res.send(body);
          });
        }
        else {
          res.status(500).json({ error: error });
        }
      });
    // If data is found in cache, return it
    } else {
      res.send(response.tweets);
    }
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

      res.redirect('/');
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

module.exports = router;
