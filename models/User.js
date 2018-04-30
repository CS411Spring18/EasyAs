var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  tweets: Array,
  personality: Array,
});

module.exports = mongoose.model('User', userSchema);
