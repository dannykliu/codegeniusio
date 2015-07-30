var express = require('express');
var router = express.Router();

require('./common');

var render = function(page, options, res) {
  switch(page) {
    case 'home':
      break;
  }
  renderExpertGeneric(page, options, res);
}

router.use('/', forceLogIn);
/* GET users listing. */
router.get('/', function(req, res) {
  Tickets.find({}, function(err, tickets) {
    console.log(tickets);
    render('home', {tickets: tickets}, res);
  });
});

router.get('/ticket/:id', function(req, res) {
  Tickets.findById(req.params.id, function(err, ticket) {
    var mailOptions = {
      from: 'Code Genius', // sender address
      to: 'info@codegenius.io', // list of receivers
      subject: 'Ticket claimed', // Subject line
      text: 'Problem: ' + ticket.problem
    };
    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        return console.log(error);
      }
    });
  });
});
module.exports = router;
