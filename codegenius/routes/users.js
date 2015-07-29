var express = require('express');
var router = express.Router();

var render = function(page, options, res) {
  switch(page) {
    case 'dashboard':
      break;
  }
  renderUserGeneric(page, options, res);
}

router.use('/', forceLogIn);
/* GET users listing. */
router.get('/', function(req, res) {
  render('dashboard', {alert: req.query.alert}, res);
});

router.post('/ticket', function(req, res) {
  var language = req.body.language;
  var time = req.body.time;
  var problem = req.body.problem;
  if(language && time && problem) {
    console.log(req.user._id);
    Tickets.create({
      userID: req.user._id,
      problem: problem,
      time: time,
      language: language
    }, function(err, ticket) {
      res.redirect('/user?alert=1');
      var otherMail = {
        from: 'Code Genius', // sender address
        to: 'info@codegenius.io', // list of receivers
        subject: 'Ticket Submitted Name: ' + req.user.fname + ' ' + req.user.lname, // Subject line
        text: 'Problem: ' + problem + ' Languages: ' + language + ' Hours: ' + time
      };
      transporter.sendMail(otherMail, function(error, info){
        if(error){
          return console.log(error);
        }
      });
    });
  } else {
    res.redirect('/user?alert=2');
  }
});

module.exports = router;
