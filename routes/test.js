var express = require('express');
var router = express.Router();
let gmailFilterService = require('../controller/gmailFilterService.js');
let googleOauth2RefreshController = require('../controller/googleOauth2RefreshController.js');
/* GET home page. */
router.get('/', function(req, res, next) {
  gmailFilterService();
  //googleOauth2RefreshController();
  res.send('test successfully');;
});

module.exports = router;