/**
 * This model is web api with googleapi Auth2 version.
 */
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {promisify} = require('util');
const { resolve } = require('path');
const readFileAsync = promisify(fs.readFile);
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './resources/web_token.json';
if (!global.sequelizeDB) {
  sequelizeDB  = require('../model/sequelize');
}
module.exports = {
    authorize,
    getNewToken,
    getToken,
    useRefreshToken
};


/*  TODO : 
    1.readFileAsync() should be modified to directly access token stored in db.
    2.  if(tokens.findOne){ 
          oAuth2Client.setCredentials(JSON.parse(token));
          return oAuth2Client;
        }
        else{
          getNewToken(oAuth2Client);
          --->  User do google Authorization
          --->  Google send a GET request with Authorization code to the redirected URI.
                redirected URI we set is http://localhost:3002/gmailAuthorized
          --->  in /gmailAuthorized router, we should get Token and store it into db.
                oAuth2Client.getToken(code)
                .then(function (token){
                  store token into db;
                  inform user to send http://localhost:3002/gmail again.
                });
        }
*/
/**
 * Create an OAuth2 client with the given credentials.
 * if token exists , than return a OAuth2Client which has been setCredentials(token).
 * Else if token does not exist, return a OAuth2 URL.
 * @param {Object} credentials The authorization client credentials.
 * @param {number} userId the user's id in database.
 * @param {Object} token option: a json oAuth2 token object
 */
async function authorize(credentials, userId, token = null) {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    if(token !== null){
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    }
    return sequelizeDB["GmailTokens"].find(userId)
      .then(
        async function (GmailTokens){
          console.log("GmailTokens is " + GmailTokens);
          if(GmailTokens === null || GmailTokens === undefined){
            //if token doesn't exist, return a AuthUrl string.
            let authUrl = oAuth2Client.generateAuthUrl({
              access_type: 'offline',
              scope: SCOPES,
              //prompt: 'consent select_account'
            });
            return authUrl;
          }
          else{
            
            let token = {
              access_token: GmailTokens.access_token,
              refresh_token: GmailTokens.refresh_token,
              scope: GmailTokens.scope,
              token_type: GmailTokens.token_type,
              expiry_date: parseInt(GmailTokens.expiry_date, 10)
            };
            oAuth2Client.setCredentials(token);
            /*
            let token = await readFileAsync(TOKEN_PATH);
            
            oAuth2Client.setCredentials(JSON.parse(token));*/
            
            console.log("toooooooooooooken is " + JSON.stringify(token));
  
            
            return oAuth2Client;
          }
      })
      .catch(function (error) {
          console.log('Does not find gamil token error: ' + error);
          throw error;
      });
}
  
/**
* generate a new AuthUrl and return it.
* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
*
*/
function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      //prompt: 'consent select_account'
    });
    //console.log('Authorize this app by visiting this url:', authUrl);
    return  authUrl;
}

/**
* Get a new token after prompting for user authorization.
* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
* @param {string} code The code google oAuth2 redirected to user.
*/
async function getToken(oAuth2Client, code) {
  return  oAuth2Client.getToken(code);
}

/**
* Use refresh token to get a new google oAuth2 access token.
* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
* @param {string} refreshToken The google oAuth2 refresh token.
*/
async function useRefreshToken(oAuth2Client, refreshToken) {
  //console.log(`before: ${JSON.stringify(oAuth2Client)}`);
  oAuth2Client.setCredentials({
    refresh_token: refreshToken
  });
  await oAuth2Client.getAccessToken();
  //console.log(`after: ${JSON.stringify(oAuth2Client)}`);
  return  oAuth2Client.credentials.access_token;
}
  