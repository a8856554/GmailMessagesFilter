var express = require('express');
var router = express.Router();

const fs = require('fs');
const {google} = require('googleapis');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const gmailAuthModel = require('../model/gmailAuthModel.js');

const usersModel = require('../model/usersModel.js');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './resources/token_test.json';
const LAST_SEARCH_TIME_PATH = './resources/last_search_time.json';

const sequelizeDB  = require('../model/sequelize');


/* GET authorization of user's gmail. */
router.get('/', async function(req, res, next) {

    // Load client secrets from a local file.
    // Use authorizeModel.authorize() to get a token.
    let oAuth2Client = 
    await readFileAsync('./resources/web_credentials.json')
    .then(
      //get gmail credentials and token successfully.
      function (content){
        return gmailAuthModel.authorize(JSON.parse(content));  
      },
      // on rejection
      function(reason) {
        res.send('failed to get gmail credentials.');
        return 'failed';
      }
    )
    .then(
      function (client){
        //if client is a string means that we haven't got token yet
        //sent Auth URL to front-end to let User get a new token.
        let authURL = gmailAuthModel.getNewToken(client);
        res.send(authURL);
      }
    )
    .catch(function (error) {
        
        console.log(error);
        return res.status(500).send({
          success: false,
          message: error
        })
    });
    //get gmail credentials successfully, then get token



    
    
    
});

module.exports = router;

router.get('/callback', async function(req, res, next) {
  const code = req.query.code;
  
  if (code) {
    let oAuth2Client = 
    await readFileAsync('./resources/web_credentials.json')
    .then(
      //get gmail credentials and token successfully.
      function (content){
        return gmailAuthModel.authorize(JSON.parse(content));  
      },
      // on rejection
      function(reason) {
        res.send('failed to get gmail credentials.');
        return 'failed';
      }
    );
    

    console.log('The gmail api auth code is : ' + code);
    // Now that we have the code, use that to acquire tokens.
    const r = await gmailAuthModel.getToken(oAuth2Client , code);
    // Make sure to set the credentials on the OAuth2 client.
    oAuth2Client.setCredentials(r.tokens);
    console.log('The gmail api token is : ' + JSON.stringify(r.tokens));

    let userName = req.decoded.userName;

    sequelizeDB["Users"].find(userName)
    .then(
      function(user){
        return sequelizeDB["GmailTokens"].create(
          r.tokens.access_token, 
          r.tokens.refresh_token, 
          r.tokens.scope, 
          r.tokens.token_type, 
          r.tokens.expiry_date, 
          req.decoded.id
        );
      },
      function(reason) {
        //find no user
        res.send('failed to find the user.');
        return 'failed';
      }
    )
    .then(
      (tokenData) =>{
        res.send('Get & store gmail authorization successfully. token is : ' 
                  + JSON.stringify(r.tokens)
                  + '\n'
                  + JSON.stringify(tokenData)
        );
      }
    )
    .catch(function (error) {
      console.log(error);
      res.json({ success: false, message: 'failed to store the gmail Auth2 token into database.'})
    });
    
    //res.send('Get gmail authorization successfully. token is : ' + JSON.stringify(r.tokens));
    
    
    

    
  }
  else{
    res.status(403).send({
      success: false,
      message: 'need the code google oAuth2 redirected to user'
    })
  }
  
  
  
  
});

