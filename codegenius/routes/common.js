express = require('express');
creds   = require('../credentials');
nodemailer = require('nodemailer');

// Basic Render Function
renderUserGeneric = function(page, vars, res) {
  express().render('users/' + page + '.ejs', vars, function(err, html) {
    if(err) {
      console.log(err);
    } else {
      vars.content = html;
      res.render('users/genericDash', vars);
    }
  });
};

renderExpertGeneric = function(page, vars, res) {
  express().render('experts/' + page + '.ejs', vars, function(err, html) {
    if(err) {
      console.log(err);
    } else {
      vars.content = html;
      res.render('experts/genericDash', vars);
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
  time: String,
  language: String
});

expertSchema = new Schema({
  email: String,
  hash: String,
  fname: String,
  lname: String,
  expertise: String,
  rate: String,
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
  time: Number,
  language: String
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

// if req.cookies.hash matches a session, populates req.user
logIn = function(req, res, next) {
  logInLogic(req, res, next, function() {
    next();
  });
};

var logInLogic = function(req, res, next, cb) {
  Sessions.findOne({hash: req.cookies.hash}, function(err, session) {
    if(err) {
      next(err);
    } else if(session) {
      req.user = {id: session.userId};
      Users.findById(session.userId, function(err, userr) {
        if(err) {
          next(err);
        } else if(userr) {
          req.user = userr;
          cb();
        } else {
          // Not User must be expert
          Experts.findById(session.userId, function(err, expert) {
            if(err) {
              next(err);
            } else {
              req.user = expert;
              cb();
            }
          });
        }
      });
    } else {
      // don't populate anything
      cb();
    }
  });
};

// wrapper for logIn that redirects user to '/' on authentication failure
forceLogIn = function(req, res, next) {
  logInLogic(req, res, next, function() {
    if(req.user) {
      next();
    } else {
      res.redirect('/');
    }
  });
};
