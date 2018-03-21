//server/routes/routes.js
var Twitter = require('twitter');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../../models/User');
var config = require('../../config.js')

var client = new Twitter(config);


router.get('/', function(req, res){
  res.render('index')
});


router.route('/fetchUser')
.post(function(req,res) {
  var user = new User();
  user.name = req.body.name;
  client.get('statuses/user_timeline', { screen_name: req.body.name, count: 200 }, function(error, tweets, response) {
    if (!error) {
      user.tweets = tweets;
      user.save(function(err) {
        if (err)
          res.send(err);
        res.send(tweets);
      });
    }
    else {
      res.status(500).json({ error: error });
    }
  });
});

module.exports = router;
