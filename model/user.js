// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    email: {
      type:String,
      required: false
    },
    name: {
        type:String,
        required: false
    },
    username: {
        type:String,
        required: false
    },
    signUpDate: { type: String },
    lastTimeLogin: { type: String },
    onboarded: {type: Boolean, default: false},
    local: {
        password: String,
        salt: String,
        verCode:String,
        isVerified: {type: Boolean, default: false}
    },
    facebook: {
        id: String,
        token: String,
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    }
});

// utility methods
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);