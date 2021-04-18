var express = require('express');
var router = express.Router();

const fs = require('fs');
const {google} = require('googleapis');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);

const mailModel = require('../model/mailModel.js');
const gmailModel = require('../model/gmailModel.js');
const authorizeModel = require('../model/authorizeModel.js');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './resources/token.json';
const LAST_SEARCH_TIME_PATH = './resources/last_search_time.json';
let filtering_word = ['石龍尾','穀精','蝴蝶'];



/* GET mails listing. */
router.get('/', async function(req, res, next) {

    // Load client secrets from a local file.
    // Use authorizeModel.authorize() to get a token.
    let gettingNewToken = false;
    const oAuth2Client = 
    await readFileAsync('./resources/credentials.json')
    .then(function (content){
        return authorizeModel.authorize(JSON.parse(content), listLabels);  
    })
    .catch(function (error) {
        gettingNewToken = true;
        return console.log('mail router is getting a new token.' + error);
    });

    if(!gettingNewToken){
        //list messages we concern then send a email.
        gmailModel.listMessages(oAuth2Client, 'label:INBOX subject:水草 ', filtering_word)
        .then(function (Messages) {
            if(Messages.length > 0){
                gmailModel.sendEmail(oAuth2Client, 
                    'Gmail Filter notifications', 
                    'hsnuwindband52@gmail.com',
                    'hsnuwindband52@gmail.com',
                    Messages);
                mailModel.create(Messages)
                .then(function(response) { console.log(response)});
                
            }
            else
                console.log('No mail you needs.');
        })
        .catch(function (error) {
            return console.log(error);
        });
    }
    
    res.send('gmail');
});

module.exports = router;

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
    maxResults: 100
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}