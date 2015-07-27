express = require('express');
creds   = require('../credentials');
nodemailer = require('nodemailer');

// Basic Render Function
renderGeneric = function(page, vars, res) {
  express().render(page + '.ejs', vars, function(err, html) {
    if(err) {
      console.log(err);
    } else {
      vars.content = html;
      res.render('genericDash', vars);
    }
  });
};

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

ticketSchema = new Schema({
  userID: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  problem: String,
  time: Number
});

Users = mongoose.model('users', userSchema);
Experts = mongoose.model('experts', expertSchema);
Sessions = mongoose.model('sessions', sessionSchema);
Tickets = mongoose.model('tickets', ticketSchema);

transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: creds.email_user,
        pass: creds.email_pass
    }
});
