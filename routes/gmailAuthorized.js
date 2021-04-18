var express = require('express');
var router = express.Router();

const fs = require('fs');
const {google} = require('googleapis');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);


const gmailAuthModel = require('../model/gmailAuthModel.js');
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './resources/token.json';
const LAST_SEARCH_TIME_PATH = './resources/last_search_time.json';


/* GET authorization of user's gmail. */
router.get('/', async function(req, res, next) {
    
    res.send('Save gmail token successfully.');
});

module.exports = router;
