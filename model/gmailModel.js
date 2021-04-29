const fs = require('fs');
const {google} = require('googleapis');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const LAST_SEARCH_TIME_PATH = './resources/last_search_time.json';

let Messages_array = [];
let filtering_words = [];
module.exports = {
    listMessages,
    getMessages,
    sendEmail,
    getProfile
};


/**
 * Lists the emails which contain keywords we search, and store emails in Messages_array.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} query Gmail Search Query.
 */
 async function listMessages(auth, query, filtering_word = []) {  
    let init_ts = Date.now();
    Messages_array = [];
    filtering_words = filtering_word;
    return new Promise((resolve, reject) => {    

        resolve(readLastSearchTime());

    })//call gmail.users.messages.list() to get array of mail ids.
    .then(function (the_last_search_time) {
        const gmail = google.gmail({version: 'v1', auth});    
        let keywords_query = `{ ${filtering_word.join(' ')} }`;


        //turn ms to s.
        the_last_search_time = Math.round(the_last_search_time/ 1000);
        console.log(`after:${the_last_search_time } ${keywords_query} ${query}`);

        return gmail.users.messages.list(      
            {        
                userId: 'me',        
                q: `after:${the_last_search_time} ${keywords_query} ${query}`,      
            })
            .then(function (response){
                if (!response.data.messages) {           
                    return[];        
                }                
                return response.data.messages; 
            })
            .catch(function (error) {
                console.log('gmail.users.messages.list() returned an error: ' + error.message)
            });
     })
    .then(//print array of mail ids.
        function (fulfilled) {
        console.log(`listMessages() lists ${fulfilled.length} mails.`);
        console.log(fulfilled);
        let id_array = fulfilled.map(item => item.id);

        // Iterate each fulfilled[i], and use getMessages() to get the mail according message id.
        let promise_array = [];
        for(let i = 0; i < id_array.length; i++){
            promise_array.push(getMessages(auth, id_array[i]))
        }
        return Promise.all(promise_array);
    })
    .then(//this then will be executed after all promises in Promise.all(promise_array) being resolved.
        function (fulfilled) {
            //console.log(Messages_array);
            let completed_ts = new Date(Date.now());
            // timestamp in milliseconds
            console.log('listMessages() is Completed at '
                + `${completed_ts.getFullYear()}-`
                + `${(completed_ts.getMonth() + 1 ).toString().padStart(2, '0')}-`
                + `${completed_ts.getDate().toString().padStart(2, '0')} `
                + `${completed_ts.getHours().toString().padStart(2, '0')}:`
                + `${completed_ts.getMinutes().toString().padStart(2, '0')}:`
                + `${completed_ts.getSeconds().toString().padStart(2, '0')}:`
                +`${completed_ts % 1000}`
            );
            console.log('listMessages() used ' + Math.abs(completed_ts - init_ts) + ' ms.');
            storeSearchTime(Date.now() - 86400000/2);//- 86400000
            return Messages_array ;
        }
        
    ).catch(function (error) {
        console.log('listMessages returned an error: ' + error.message)
    });
    
}

function ts2date(ts){
    let t = new Date(parseInt(ts, 10));
    return `${t.getFullYear()}-`
            + `${(t.getMonth() + 1 ).toString().padStart(2, '0')}-`
            + `${t.getDate().toString().padStart(2, '0')} `
            + `${t.getHours().toString().padStart(2, '0')}:`
            + `${t.getMinutes().toString().padStart(2, '0')}:`
            + `${t.getSeconds().toString().padStart(2, '0')}:`
            +`${t % 1000}`;
}
/**
 * Get the emails which has specific id, and store emails in Messages_array.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} messageId Email id. 
 */
function getMessages(auth, messageId){
    const gmail = google.gmail({version: 'v1', auth});
    //gmail.users.messages.get is a promise.
    return gmail.users.messages.get({
        auth: auth,
        userId: "me",
        id:  messageId,  
    })
    .then(function (fulfilled) {
        //console.log(fulfilled.data.payload.parts[0]);
        // The Body of the message is in Encrypted format. So, we have to decode it. 
        let data = fulfilled.data.payload.parts[0]['body']['data'] 
        let decode_data = new Buffer.from(data, 'base64')
        decode_data = decode_data.toString('utf8');
        
        //check if the message contains the word we searching.
        let searching_position = -1;
        let word_label = '';
        for(let j = 0; j < filtering_words.length ; j++){
            if(decode_data.search(filtering_words[j]) > searching_position){
                searching_position = decode_data.search(filtering_words[j]);
                word_label = filtering_words[j];
                break;
            }
        }
        if(searching_position > -1){
            let massage = 
                {
                    'text':decode_data,
                    'keyword': word_label,
                    'intetnal_date': fulfilled.data.internalDate // the time the message was originally accepted by Google
                };
                //console.log(ts2date(massage.internalDate));
            //Store the message we need .
            Messages_array.push(massage);
        }
    })
    .catch(function (error) {
        console.log('getMessages() returned an error: ' + error.message)
    });
}
/**
 * Send a emails which contains messages in Messages_array to inform receiver.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} subject Title of the email . 
 * @param {string} from Sender's email address.
 * @param {string} to Receiver's email address. 
 * @param {string} context Context of the email. 
 */
// TODO : function sendEmail needs to be promisified.
async function sendEmail(auth, subject, from, to, context){
    const gmail = google.gmail({version: 'v1', auth});

    let utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    let notifications = [];

    for(let i = 0; i < context.length; i++){
        notifications.push(`<font color="blue"> Key word : ${context[i].keyword.replace(/\r\n/g,'<br>')}</font><br>`);
        notifications.push(`<font color="blue"> ${ts2date(context[i].intetnal_date)} </font><br>`);
        notifications.push(context[i].text.replace(/\r\n/g,'<br>') + '<br>');
    }
    

    let messageParts = [
        `From: ${from}`,
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        ...notifications
    ];
    let message = messageParts.join('\n');
    // The body needs to be base64url encoded.
    let encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
        ;

    res = await gmail.users.messages.send(
                {
                    userId: 'me',
                    requestBody: {
                        raw: encodedMessage,
                    },
                })
                .catch(function (error) {
                    console.log('gmailModel.sendEmail() returned an error: ' + error.message)
                });;
    console.log(res.data);
    return res.data;
}

/**
 * Gets the current user's Gmail profile.
 * If successful, the response body contains data with the following structure:
 * 
 * {
 * config: {
 *   url: 'https://www.googleapis.com/gmail/v1/users/me/profile',
 *   method: 'GET',
 *   paramsSerializer: [Function],
 *   headers: {
 *     'Accept-Encoding': 'gzip',
 *     'User-Agent': 'google-api-nodejs-client/0.7.2 (gzip)',
 *     Authorization: 'Bearer ya29.a0AfH6SMAPncOXAndARTiM3YrLi8XdySMp9FE...',
 *     Accept: 'application/json'
 *   },
 *   params: [Object: null prototype] {},
 *   validateStatus: [Function],
 *   responseType: 'json'
 * },
 * data: {
 *   emailAddress: 'hsnuwindband52@gmail.com',
 *   messagesTotal: 25561,
 *   threadsTotal: 24225,
 *   historyId: '1804102'
 * },
 * headers: {
 *   'alt-svc': 'h3-29=":443"; ma=2592000,h3-T051=":443"; ma=2592000,h3-Q050=":443"; ma=2592000,h3-Q046=":443"; ma=2592000,h3-Q043=":443"; ma=2592000,quic=":443"; ma=2592000; v="46,43"',
 *   'cache-control': 'private',
 *   connection: 'close',
 *   'content-encoding': 'gzip',
 *   'content-type': 'application/json; charset=UTF-8',
 *   date: 'Sun, 25 Apr 2021 13:35:17 GMT',
 *   server: 'ESF',
 *   'transfer-encoding': 'chunked',
 *   vary: 'Origin, X-Origin, Referer',
 *   'x-content-type-options': 'nosniff',
 *   'x-frame-options': 'SAMEORIGIN',
 *   'x-xss-protection': '0'
 * },
 * status: 200,
 * statusText: 'OK'
 *} 
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function getProfile(auth){
    const gmail = google.gmail({version: 'v1', auth});
    return gmail.users.getProfile({
                auth: auth,
                userId: 'me'
            });
}

/**
 * Store the time that we search keywords.
 *
 * @param {number} time //The time we search keywords in ms. 
 */
function storeSearchTime(time){
    fs.writeFile(LAST_SEARCH_TIME_PATH, JSON.stringify({last_search_time : time}), (err) => {
        if (err) return console.error(err);
        console.log('time is stored to', LAST_SEARCH_TIME_PATH);
    });
}
/**
 * Read the time that we search keywords last time.
 */
async function readLastSearchTime(){
    return readFileAsync(LAST_SEARCH_TIME_PATH)
    .then(function (fulfilled){
        let time = JSON.parse(fulfilled).last_search_time;
        return time;
    })
    .catch(function (error) {
        console.log('readLastSearchTime() returned an error: ' + error.message)
    });
   
    
}