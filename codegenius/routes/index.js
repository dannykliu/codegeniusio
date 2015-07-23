var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var exec = require('child_process').exec;
creds = require('../credentials');
require('./common');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
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
