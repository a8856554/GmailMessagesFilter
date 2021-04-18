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
const TOKEN_PATH = './resources/token_web.json';

module.exports = {
    authorize,
    getNewToken,
    getToken
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
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

async function authorize(credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    return readFileAsync(TOKEN_PATH)
        .then(
          function (token){
            oAuth2Client.setCredentials(JSON.parse(token));
            return oAuth2Client;
          },
          function(reason) {
            //the oAuth2Client has not excuted setCredentials();
            return oAuth2Client;
          }

        )
        .catch(function (error) {
            console.log('Does not find gamil token error: ' + error);
            throw error;
        });
}
  
/**
* generate a new AuthUrl and return it.
* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
*/
// TODO : function authorize needs to be promisified.
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
// TODO : function authorize needs to be promisified.
async function getToken(oAuth2Client, code) {
  return  oAuth2Client.getToken(code);
}
  