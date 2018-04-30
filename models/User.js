var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  personality: Array,
  matches: Array,
  tweets: Array,
});

module.exports = mongoose.model('User', userSchema);
