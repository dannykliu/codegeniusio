var express = require('express');
var router = express.Router();

var render = function(page, options, res) {
  switch(page) {
    case 'dashboard':
      break;
  }
  renderGeneric(page, options, res);
}

/* GET users listing. */
router.get('/', function(req, res) {
  render('dashboard', {}, res);
});

module.exports = router;
