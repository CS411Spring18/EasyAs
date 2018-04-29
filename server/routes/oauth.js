var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var oauth = require('oauth');
var app = express();
var config = require('../../config.js');

// Get the twitter consumer key and secret
var twitterConsumerKey = config.consumer_key;
var twitterConsumerSecret = config.consumer_secret;

// Create the OAuth
var consumer = new oauth.OAuth(
  "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", 
  twitterConsumerKey, twitterConsumerSecret, "1.0A", null, "HMAC-SHA1"
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Create the secret for the session
app.use(session({ secret: "top secret", resave: false, saveUninitialized: true }));

// Store the session data into local session
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

// Generate the Oauth request token
app.get('/sessions/connect', function (req, res) {
  consumer.getOAuthRequestToken(function (err, oauthToken, oauthTokenSecret, results) {
    if (error) {
      res.send(err);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authorize?oauth_token=" + req.session.oauthRequestToken);
    }
  });
});

// Get the Oauth access token
app.get('/session/callback', function (req, res) {
  consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function (err, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (err) {
      res.send(err);
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
      res.redirect('/home');
    }
  });
});

// Set up the login page route
app.get('/home', function (req, res) {
  consumer.get("http://twitter.com/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
    if (err) {
      res.redirect('/session/connect');
    } else {
      var parsedData = JSON.parse(data);
      res.send('You are signed in!');
    }
  });
});

module.exports = app;
