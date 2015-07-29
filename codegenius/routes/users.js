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
  render('dashboard', {}, res);
});

module.exports = router;
