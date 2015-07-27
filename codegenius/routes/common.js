express = require('express');
creds   = require('../credentials');
nodemailer = require('nodemailer');

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
  time: String,
  language: String
});

expertSchema = new Schema({
  email: String,
  hash: String,
  fname: String,
  lname: String,
  expertise: String,
  phone: String,
  language: String
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

transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: creds.email_user, 
        pass: creds.email_pass 
    }
});

Users = mongoose.model('users', userSchema);
Experts = mongoose.model('experts', expertSchema);
