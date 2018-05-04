//server/routes/routes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('../../models/User');
const oauth = require('oauth');
const bearerToken = require('../../config.js').bearerToken;
const twitterConfig = require('../../config.js');
const { createUser, euclideanDistance } = require('./userHelpers.js');
// Get the twitter consumer key and secret
var twitterConsumerKey = twitterConfig.consumer_key;
var twitterConsumerSecret = twitterConfig.consumer_secret;

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

router.get('/', function (req, res) {
  var user = req.query.user;
  res.render('index', {user: user});
});

router.route('/fetchUserPersonality')
.post(function(req,res) {
  const user = new Promise(function(resolve, reject) {
    User.findOne({ name: req.body.name }, function (err, response) {
      if (err) {
        reject(err);
      // If there's no data in the database create a user
      } else if (response == null) {
        // calls createUser helper function which returns a promise
        let userPromise = createUser(req.body.name);
        userPromise.then((newUser) => {
          res.send(newUser);
        })
        .catch((error) => res.status(500).json({ error: error }));
        // If we find a user pass it on
      } else {
        res.send(response);
      }
    });
  });
});


// Gets the user's tweets, personality, matches and saves them to the db
router.route('/fetchUser')
.post(function(req,res) {
  // Holds our user object
  let myUser = [];
  // Creates a Promise to search the db for a cached version of the user
  const user = new Promise(function(resolve, reject) {
    User.findOne({ name: req.body.name }, function (err, response) {
      if (err) {
        reject(err);
      // If there's no data in the database create a user
      } else if (response == null) {
        // calls createUser helper function which returns a promise
        let userPromise = createUser(req.body.name);
        userPromise.then((newUser) => {
          resolve(newUser);
        })
        .catch((error) => res.status(500).json({ error: error }));
        // If we find a user pass it on
      } else {
        resolve(response);
      }
    });
  });
  // getting user's friends/folowers usernames in a promise
  const usernamesPromise = new Promise(function(resolve, reject) {
    user.then(user => {
      // uses the user promise to store our user
      myUser = user;
      // calls to get twitter followers and following
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
      // takes both api responses, gets and combines the usernames, and resolves the list
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
  // From the username promise we create users for each username
  usernamesPromise.then(usernames => {
    // Calling createUser on each username
    Promise.all(usernames.map((username) => createUser(username)))
    .then(users => {
      // saving each user
      users.map(user => user.save());
      return users;
    })
    // after creating and saving a users followers/following we get the closest matches
    .then(responses => euclideanDistance(myUser.personality, responses))
    .then(matches => {
      myUser.matches = matches;
      //We save the user and send a reply
      myUser.save();
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
      res.send("Error getting OAuth access token : " + error + "[" + oauthAccessToken + "]" + "[" + oauthAccessTokenSecret + "]" + "[" + results + "]", 500);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

      /*
      var newUser = new User({
        name: results.screen_name,
      });

      newUser.save(function (err) {
        if (err) {
          console.log(err);
        };
        console.log("User saved");
      });
      */

      var user = encodeURIComponent(results.screen_name);
      res.redirect('/?user=' + user);
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
