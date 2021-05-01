const fs = require('fs');
const {google} = require('googleapis');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const gmailAuthModel = require('../model/gmailAuthModel.js');
const gmailModel = require('../model/gmailModel.js');
if (!global.sequelizeDB) {
    sequelizeDB  = require('../model/sequelize');
}

module.exports = gmailFilterService;

async function gmailFilterService(){
    //get all user's id and gmail token
    
    let user_array = await sequelizeDB["Users"].getAllUserTokenNRoutine();
    //console.log(user_array);
    
    for(let i = 0; i < user_array.length; i = i+1){
        let user_id = user_array[i].UserId;
        console.log(`This is user ${user_id} part.`);
        let gmailToken = {
            "access_token": user_array[i].access_token,
            "refresh_token": user_array[i].refresh_token,
            "scope": user_array[i].scope,
            "token_type": user_array[i].token_type,
            "expiry_date": parseInt(user_array[i].expiry_date, 10)
        }

        let filtering_words = element2array(user_array[i], 5);
        let oAuth2Client = await getOAuth2Client(user_id, gmailToken);
        /////////////////////////////////////this part can be moved into Promise.all()
        let message_array = await gmailModel.listMessagesSpecificTime(
                                    oAuth2Client, 
                                    'label:INBOX ', 
                                    filtering_words,
                                    user_array[i].time_last_search
                                );  
        sequelizeDB["RoutineNotifications"].update(user_id, 900000, Date.now());
        sendNotification(user_id, oAuth2Client, message_array);
        /////////////////////////////////////
    }
}

/**
 * Get a oAuth2Client which has been set credentials and google auth2 token.
 * if there is error during reading credentials or get auth2 token, return null.
 * @param {number} userId User's id 
 * @param {Object} token option: a json oAuth2 token object
 */
async function getOAuth2Client(userId, token){
    let oAuth2Client = 
    await readFileAsync('./resources/web_credentials.json')
    .then(
      //get gmail credentials and token successfully.
      function (content){
        return gmailAuthModel.authorize(JSON.parse(content), userId, token);  
      },
      // on rejection
      function(reason) {
        console.log('failed to get gmail credentials.');
        return null;
      }
    )
    .catch(function (error) {
        
        console.log(error);
        return res.status(500).send({
          success: false,
          message: error
        })
    });
    return oAuth2Client;
}

/**
 * Send a notification email and store messages into db table "UserMails".
 * @param {number} userId User's id 
 * @param {google.auth.OAuth2} oAuth2Client An authorized OAuth2 client.
 * @param {Array} messages Array of filtering words
 */
async function sendNotification(userId, oAuth2Client, messages){
    
    if(messages.length <= 0 || messages.length === undefined){
        console.log('No mail you need.');
        return;
    }   
    //get the user's gmail address
    let profile = await gmailModel.getProfile(oAuth2Client);
    console.log('response is ' +  JSON.stringify(profile));
  
    gmailModel.sendEmail(oAuth2Client, 
        'Gmail Filter notifications', 
        profile.data.emailAddress,
        profile.data.emailAddress,
        messages
    );
         
    sequelizeDB["UserMails"].create(messages,userId);
    console.log(`Successfully send mails, user ${userId}`);  
}

/**
 * Check if the user id exist in db, then return an array of user's messages.
 * Return an array contains filtering words
 * @param {number} user a object contains attributes "filtering_word0" to "filtering_word${words_num-1}"
 * @param {number} words_num number of filtering words
 */
function element2array(user, words_num){
    let filtering_words = [];
    for(let j = 0; j < words_num; j = j+1){
        if(user[`filtering_word${j}`] === null)
            break;
        filtering_words.push(user[`filtering_word${j}`]);
    }
    return filtering_words;
}
