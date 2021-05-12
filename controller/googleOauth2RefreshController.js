const fs = require('fs');
const {google} = require('googleapis');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const gmailAuthModel = require('../model/gmailAuthModel.js');

if (!global.sequelizeDB) {
  sequelizeDB  = require('../model/sequelize');
}
module.exports = googleOauth2Refresh;

/**
 * Refresh all user's google oAuth2 access token.
 * 
 */
async function googleOauth2Refresh(){
  let token_array = await sequelizeDB["GmailTokens"].findAll();
  let arr_len = token_array.length;
  for(let i = 0; i < arr_len; i = i+1){
    //console.log(token_array[i].refresh_token);
    let oAuth2Client = await getOAuth2ClientWithoutToken();
    let access_token = await gmailAuthModel.useRefreshToken(oAuth2Client, token_array[i].refresh_token);
    sequelizeDB["GmailTokens"].update(token_array[i].UserId, access_token);
  }
  
}

/**
 * Get a oAuth2Client which has been set credentials but no google auth2 token.
 * if there is error during reading credentials , return a error log.
 */
 async function getOAuth2ClientWithoutToken(){
  let oAuth2Client = await readFileAsync('./resources/web_credentials.json')
    .then(
      //get gmail credentials successfully.
      function (content){
        let credentials = JSON.parse(content);
        const {client_secret, client_id, redirect_uris} = credentials.web;
        return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      },
      // on rejection
      function(reason) {
        console.log(reason);
        return reason;
      }
    );
  return oAuth2Client;
}