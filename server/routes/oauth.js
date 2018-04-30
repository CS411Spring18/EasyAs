var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var oauth = require('oauth');
var twitterConfig = require("../../config.js");

var app = express();

// Get the twitter consumer key and secret
var twitterConsumerKey = "nM9Ti3fALEAFUsZaqKpkFGmoG";
var twitterConsumerSecret = "ecEiAeVVbmJwGFkeiek1SprGcRswaNkKaswuTfSOo4zQ1JjiXY";

// Create the OAuth
var consumer = new oauth.OAuth(
  "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
  twitterConsumerKey, twitterConsumerSecret, "1.0A", 'http://127.0.0.1:3000/sessions/callback', "HMAC-SHA1");

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
  consumer.getOAuthRequestToken(function (error, oauthToken, oauthTokenSecret, results) {
    if (error) {
      res.send("Error getting OAuth request token : " + error, 500);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://twitter.com/oauth/authorize?oauth_token=" + req.session.oauthRequestToken);
    }
  });
});

// Get the Oauth access token
app.get('/sessions/callback', function (req, res) {
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
app.get('/home', function (req, res) {
  consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
    if (error) {
      //console.log(error)
      res.redirect('/sessions/connect');
    } else {
      var parsedData = JSON.parse(data);
      res.send('You are signed in: ' + parsedData.screen_name);
    }
  });
});

