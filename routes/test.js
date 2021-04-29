var express = require('express');
var router = express.Router();
let gmailFilterService = require('../controller/gmailFilterService.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  gmailFilterService();
  res.send('test successfully');;
});

module.exports = router;