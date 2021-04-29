const fs = require('fs');
const {google} = require('googleapis');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const gmailAuthModel = require('../model/gmailAuthModel.js');
const gmailModel = require('../model/gmailModel.js');
if (!global.sequelizeDB) {
    sequelizeDB  = require('../model/sequelize');
}

module.exports = {
    gmailAuth
}

async function gmailAuth(req, res, next){
    const userId = req.decoded.id;
    const user_routine = await sequelizeDB["RoutineNotifications"].find(userId)

    //construct array filtering_words
    const filtering_num = sequelizeDB["RoutineNotifications"].FILTERING_WORDS_NUM;
    let filtering_words = [] ;
    for(let i = 0; i < filtering_num; i = i+1){
        if(user_routine[`filtering_word${i}`] === null) break;
        filtering_words.push(user_routine[`filtering_word${i}`]);
    }

    let oAuth2Client = 
    await readFileAsync('./resources/web_credentials.json')
    .then(
      //get gmail credentials and token successfully.
      function (content){
        return gmailAuthModel.authorize(JSON.parse(content), userId);  
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
        if(typeof(client) === 'string'){
          res.send(client);
        }

        //if client is not a string, then we get a setup oAuth2Client
        return client;
        
      }
    )
    .catch(function (error) {
        
        console.log(error);
        return res.status(500).send({
          success: false,
          message: error
        })
    });
    

    
}

