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

module.exports = router;
