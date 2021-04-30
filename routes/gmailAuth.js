var express = require('express');
var router = express.Router();

const fs = require('fs');
const {google} = require('googleapis');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const gmailAuthModel = require('../model/gmailAuthModel.js');
const gmailModel = require('../model/gmailModel.js');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './resources/token_test.json';
const LAST_SEARCH_TIME_PATH = './resources/last_search_time.json';
if (!global.sequelizeDB) {
  sequelizeDB  = require('../model/sequelize');
}



/* GET authorization of user's gmail. */
router.get('/', async function(req, res, next) {
  filtering_word = ['蝴蝶','穀精','宮廷'];
  let userId = req.decoded.id;
    
  let web_credentials;
  try{
    web_credentials = await readFileAsync('./resources/web_credentials.json');
  }
  catch(error) { 
    console.log(error);
    return res.status(500).send({
        success: false,
        message: `Can not find oAuth2 credentials ${error}`
    })
  };

  let oAuth2Client
  try{
    //get gmail credentials and token successfully.
    oAuth2Client = await gmailAuthModel.authorize(JSON.parse(web_credentials), userId)
  }
  catch(error) { 
    console.log(error);
    return res.status(500).send({
        success: false,
        message: `Occurs error during setting oAuth2Client ${error}`
    })
  };

  //if client is a string means that we haven't got token yet
  //sent Auth URL to front-end to let User get a new token.
  if(typeof(oAuth2Client) === 'string'){
    res.send(oAuth2Client);
  }

    
  //Check if the user id exist in db.
  await sequelizeDB["Users"].model.findByPk(userId)
  .then(
    //list mails which contain filtering words.
    function (content){
      return gmailModel.listMessages(oAuth2Client, 'label:INBOX subject:水草 ', filtering_word);  
    },
    // on rejection
    function(reason) {
      res.send('Find no your user data in database.');
      return 'failed';
    }
  )
  .then(async function (Messages) {
    if(Messages.length > 0){
        //get the user's gmail address
      let profile = await gmailModel.getProfile(oAuth2Client);
      console.log('response is ' +  JSON.stringify(profile));

      gmailModel.sendEmail(oAuth2Client, 
        'Gmail Filter notifications', 
        profile.data.emailAddress,
        profile.data.emailAddress,
        Messages
      );
       
      sequelizeDB["UserMails"].create(Messages,userId);
      res.send('Successfully send mails.');  
    }
    else
      res.send('No mail you need.');
  })
    
  .catch(function (error) {
      return console.log(error);
  });



    
    


    
    
    
});

module.exports = router;

router.get('/callback', async function(req, res, next) {
  const code = req.query.code;
  
  if (code) {
    let oAuth2Client = 
    await readFileAsync('./resources/web_credentials.json')
    .then(
      //get gmail credentials successfully.
      function (content){
        let credentials = JSON.parse(content);
        const {client_secret, client_id, redirect_uris} = credentials.web;
        return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
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
    //Check if the user exist in db.
    sequelizeDB["Users"].find(userName)
    .then(//find successfully then store the token to db.
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

