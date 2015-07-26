var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var exec = require('child_process').exec;

creds = require('../credentials');
require('./common');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {});
});

router.post('/contact', function(req, res) {
  var mailOptions = {
    from: creds.email_user, // sender address
    to: 'info@codegenius.io', // list of receivers
    subject: 'Name: ' + req.body.name + ' From: ' + req.body.email, // Subject line
    text: req.body.message // plaintext body
  };
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
    res.redirect('/');
  });
});

router.get('/expertRegistration', function(req, res){
  res.render("expertRegister.ejs", {});
});

router.get('/userRegistration', function(req, res) {
  res.render('userRegister', {});
});

router.post('/userRegistration', function(req, res) {
  bcrypt.hash(req.body.password.toString(), 10, function(err, hashpass) {
    Users.create({
      email: req.body.email,
      hash: hashpass,
      fname: req.body.fname,
      lname: req.body.lname,
      problem: req.body.probelm,
      language: req.body.language
    }, function(err, user){
      res.redirect('/');
      express().render('emails/userRegister.ejs', {user: user}, function(err, htmlRender) {
        var mailOptions = {
          from: 'Code Genius', // sender address
          to: user.email, // list of receivers
          subject: 'Welcome to Code Genius', // Subject line
          html: htmlRender
        };
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
            return console.log(error);
          }
        });
      });
    });
  });
});

router.post('/expertRegistration', function(req, res) {
  bcrypt.hash(req.body.password.toString(), 10, function(err, hashpass) {
    Experts.create({
      email: req.body.email,
      hash: hashpass,
      fname: req.body.fname,
      lname: req.body.lname,
      expertise: req.body.expertise,
      language: req.body.language
    }, function(err, expert){
      res.redirect('/');
      express().render('emails/expertRegister.ejs', {expert: expert}, function(err, htmlRender) {
        var mailOptions = {
          from: 'Code Genius', // sender address
          to: expert.email, // list of receivers
          subject: 'Welcome to Code Genius', // Subject line
          html: htmlRender
        };
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
            return console.log(error);
          }
        });
      });
    });
  });
});

  
router.post('/git-update', function(req, res, next) {
  var hmac = 'sha1=' + crypto.createHmac('sha1', creds.git_secret).update(req.rawBody).digest('hex');
  if(req.headers['x-hub-signature'] == hmac) {
    exec('git pull', {}, function(error, stdout, stderr) {
      if(error) {
        res.json(error);
        error.handled = true;
        next(error);
      } else {
        res.json({stdout: stdout, stderr: stderr});
      }
    });
  } else {
    res.json({stderr: 'Invalid secret.'});
  }
});
module.exports = router;
