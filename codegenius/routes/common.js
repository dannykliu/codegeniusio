express = require('express');
creds   = require('../credentials');

// Sets up mongoose
mongoose = require('mongoose');
Schema = mongoose.Schema;
mongoose.connect(creds.mongo_url);

userSchema = new Schema({
  email: String,
  hash: String,
  fname: String,
  lname: String,
  problem: String,
  language: String
});

expertSchema = new Schema({
  email: String,
  hash: String,
  fname: String,
  lname: String,
  language: String,
  aoi: String
});

sessionSchema = new Schema({
  userId: String,
  hash: String
});

renderGeneric = function(page, vars, res) {
  express().render(page + '.ejs', vars, function(err, html) {
    if(err) {
      console.log(err);
    } else {
      vars.content = html;
      res.render('common', vars);
    }
  });
};

Users = mongoose.model('users', userSchema);
