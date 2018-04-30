var axios = require('axios');
var User = require('../../models/User');
var bearerToken = require('../../config.js').bearerToken;

// Using the euclidean distance to find the closest match
const euclideanDistance = (userPersonality, otherUsers) => {
  // initilize match array
  let matches = [];
  // for each follower/following find their personality distance
  otherUsers.forEach(otherUser => {
    let sum = 0;
    // getting the distance squared
    for(var i = 0; i < 5; i += 1) {
      sum += userPersonality[i].raw_score - otherUser.personality[i].raw_score;
    }
    // getting the distance
    const result = Math.sqrt(Math.abs(sum));
    // creating a user object to store in matches
    const userObject = {
      'username': otherUser.name,
      'personality': otherUser.personality,
      'similarity': result,
    };
    // if there aren't enough matches yet add this user
    if (matches.length < 5) {
      matches.push(userObject)
    } else {
      // check the matches array to see if this user is closer than any other
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

// create a new user, fetch tweets, and get personality
const createUser = (username) =>
  new Promise(function(resolve, reject) {
    var user = new User();
    user.name = username;
    // getting the user_timeline
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
    // formats data to be watson compliant
    .then(twitterData => formatTwitterResponse(twitterData))
    .then(tweets => {
      user.tweets = tweets;
      // gets the users personality profile
      return getProfile(tweets);
    })
    // Format the personalityProfile
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

// Watson login requirements
const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
const personalityInsights = new PersonalityInsightsV3({
  username: '44c8ab6a-b6ae-427f-a1a2-9f9cd27074e9',
  password: 'Bjt6QFVRkUKj',
  version_date: '2017-10-13'
});

// get the watson's personality profile
const getProfile = (tweets) =>
  new Promise((resolve, reject) => {
    var params = {
      content: tweets,
      content_type: 'application/json',
      raw_scores: true
    };

    // call watson with the users formatted tweets
    return personalityInsights.profile(params, (err, profile) => {
      if (err) {
        reject(err);
      } else {
        resolve(profile);
      }
    });
});

// formats tweets to match the format watson wants
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

// parsing watson's personality response
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

module.exports = { createUser, euclideanDistance };
