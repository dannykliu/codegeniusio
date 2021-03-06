var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var exec = require('child_process').exec;

creds = require('../credentials');
require('./common');

/* GET home page. */
router.get('/', function(req, res, next) {
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
  // TODO: Check for duplicates
  if(req.body.fname && req.body.lname && req.body.email && req.body.password) {
    checkIfExists(req.body.email, req, function(err) {
      if(err) {
        res.render('userRegister', {error: 'Email already taken'});
      } else {
        bcrypt.hash(req.body.password.toString(), 10, function(err, hashpass) {
          Users.create({
            email: req.body.email,
            hash: hashpass,
            fname: req.body.fname,
            lname: req.body.lname,
            problem: req.body.problem,
            time: req.body.time,
            language: req.body.language
          }, function(err, user){
            checkUser(user.email, req.body.password, req, res, function(err) {
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
      }
    });
  } else {
    res.render('userRegister', {error: 'All forms must be filled'});
  }
});

router.post('/expertRegistration', function(req, res) {
  console.log(req.body.expertise);
  if(req.body.fname && req.body.lname && req.body.email && req.body.password && req.body.rate && req.body.expertise && req.body.language) {
    checkIfExists(req.body.email, req, function(err) {
      if(err) {
        res.render('expertRegister', {error: 'Email already taken'});
      } else {
        console.log(req.body.expertise);
        bcrypt.hash(req.body.password.toString(), 10, function(err, hashpass) {
          Experts.create({
            email: req.body.email,
            hash: hashpass,
            fname: req.body.fname,
            lname: req.body.lname,
            expertise: req.body.expertise,
            rate: req.body.rate,
            language: req.body.language
          }, function(err, expert){
            checkExpert(expert.email, req.body.password, req, res, function(err){
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
      }
    });
  } else {
    res.render('expertRegister', {error: 'All forms must be filled'});
  }
});

router.get('/signin', function(req, res, next) {
  res.render('sign-in', {});
});

router.post('/signin', function(req, res, next) {
  if(req.body.email && req.body.pass) {
    checkUser(req.body.email, req.body.pass, req, res, function(err) {
      checkExpert(req.body.email, req.body.pass, req, res, function(err) {
        res.render('sign-in', { error: 'Incorrect email or password.' });
      });
    });
  } else {
     res.render('sign-in', { error: 'All fields are required.' });
  }
});

router.get('/signout', function(req, res, next) {
  Sessions.findOneAndRemove({hash: req.cookies.hash}, function(err) {
    if(err) {
      next(err);
    } else {
      res.clearCookie('hash');
      res.redirect('/');
    }
  });
});

var checkUser = function(email, pass, req, res, next) {
  Users.findOne({email: req.body.email}, function(err, user) {
    if(err) {
      next(err);
    } else if(user) {
      bcrypt.compare(pass.toString(), user.hash, function(err, result) {
        if(err) {
          next(err);
        } else if(result) {
          bcrypt.genSalt(10, function(err, salt) {
            if(err) {
              next(err);
            } else {
              Sessions.create({userId: user.id, hash: salt.toString()}, function(err, session) {
                if(err) {
                  next(err);
                } else {
                  res.cookie('hash', salt);
                  res.redirect('/user');
                }
              });
            }
          });
        } else {
          next(); // Incorrect pass
        }
      });
    } else {
      next(); // Incorrect email
    }
  });
};

var checkExpert = function(email, pass, req, res, next) {
  Experts.findOne({email: req.body.email}, function(err, user) {
    if(err) {
      next(err);
    } else if(user) {
      bcrypt.compare(pass.toString(), user.hash, function(err, result) {
        if(err) {
          next(err);
        } else if(result) {
          bcrypt.genSalt(10, function(err, salt) {
            if(err) {
              next(err);
            } else {
              Sessions.create({userId: user.id, hash: salt.toString()}, function(err, session) {
                if(err) {
                  next(err);
                } else {
                  res.cookie('hash', salt);
                  res.redirect('/expert');
                }
              });
            }
          });
        } else {
          next(); // Incorrect pass
        }
      });
    } else {
      next(); // Incorrect email
    }
  });
};

// Checks if the email is already registered
var checkIfExists = function(email, req, cb) {
  Users.findOne({ email: email }, function(err, user) {
    Experts.findOne({ email: email }, function(err, expert) {
      if(expert || user) {
        var err = 'Email already exists';
        cb(err);
      } else {
        cb();
      }
    });
  });
};

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
