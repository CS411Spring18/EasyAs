//server/routes/routes.js
var express = require('express');
var request = require("request");
var twitterApi = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
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
  request(options, function(error, response, body) {
    if (!error) {
      user.tweets = body;
      user.save(function(err) {
        if (err)
          res.send(err);
        res.send(body);
      });
    }
    else {
      res.status(500).json({ error: error });
    }
  });
});

module.exports = router;
