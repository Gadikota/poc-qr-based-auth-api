var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var moment   = require('moment');
// define the schema for our user model
var userSchema = mongoose.Schema({
  token        : String,
  expires_on   : Number,
  user_id      : String
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validateToken = function(password) {
  var expiry = moment(this.expires_on).utc()
  var currentDate = moment(new Date()).utc();
  var currentDate = currentDate.add(1, "m");
  console.error("currentDate -> "+currentDate._i.getTime());
  console.error("expiry -> "+expiry._i);
  console.error("password -> "+password);
  console.error("Token -> "+this.token);
  console.error("---+"+expiry.diff(currentDate) > 0);
  // helloworld can be a secret.
  return bcrypt.compareSync("helloworld"+expiry._i, this.token) && expiry.diff(currentDate) > 0
};

// create the model for users and expose it to our app
module.exports = mongoose.model('UserSession', userSchema);