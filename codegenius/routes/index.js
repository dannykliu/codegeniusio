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

router.get('/user', function(req, res) {
  res.render('userRegister', {});
});

router.post('/user', function(req, res) {
  // TODO: Check for duplicates
  bcrypt.hash(req.body.password.toString(), 10, function(err, hashpass) {
    Users.create({
      email: req.body.email,
      hash: hashpass,
      fname: req.body.fname,
      lname: req.body.lname,
      problem: req.body.probelm,
      language: req.body.language
    }, function(err, user){
      console.log(user);
      res.render('index', {});
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
