const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {promisify} = require('util');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
let filtering_word = ['石龍尾','穀精'];
let Messages_array = [];
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), listLabels);
  
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
// TODO : function authorize needs to be promisified.
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    //callback(oAuth2Client);

    listMessages(oAuth2Client, 'label:INBOX subject:水草 newer_than:1d ', filtering_word)
    .then(
        function (fulfilled) {
            /*
            let ts = Date.now();
            // timestamp in milliseconds
            console.log('then ' + ts);
            */
           //console.log(Messages_array);
            if(Messages_array.length > 0)
                sendEmail(oAuth2Client, 'Gmail Filter notifications', 'hsnuwindband52@gmail.com','hsnuwindband52@gmail.com',Messages_array);
            else
                console.log('No mail you needs.');
        }
    ).catch(function (error) {
        console.log( error.message);
    });
    
    
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

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
/**
 * Lists the emails which contain keywords we search, and store emails in Messages_array.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} query Gmail Search Query.
 */
function listMessages(auth, query) {  
    let init_ts = Date.now();
    return new Promise((resolve, reject) => {    
        const gmail = google.gmail({version: 'v1', auth});    

        let keywords_query = `{ ${filtering_word.join(' ')} }`;
        console.log(`${keywords_query} ${query}`);
        gmail.users.messages.list(      
            {        
                userId: 'me',        
                q: `${keywords_query} ${query}`,      
            },  
            (err, res) => {        
                if (err) {                    
                    reject(err);          
                    return;        
                }        
                if (!res.data.messages) { 
                    resolve([]);          
                    return;        
                 }                
                resolve(res.data.messages);     
            }    
        );  

    })
    .then(
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
            return fulfilled;
        }
        
    )
    .catch(function (error) {
        console.log('listMessages() returned an error: ' + error.message);
    });
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

        // The Body of the message is in Encrypted format. So, we have to decode it. 
        let data = fulfilled.data.payload.parts[0]['body']['data'] 
        let decode_data = new Buffer.from(data, 'base64')
        decode_data = decode_data.toString('utf8');
        
        //check if the message contains the word we searching.
        let searching_position = -1;
        let word_label = '';
        for(let j = 0; j < filtering_word.length ; j++){
            if(decode_data.search(filtering_word[j]) > searching_position){
                searching_position = decode_data.search(filtering_word[j]);
                word_label = filtering_word[j];
            }
                
        }
        if(searching_position > -1){
            let massage = 
                {
                    'word': word_label,
                    'context':decode_data
                };
            //Store the message we need .
            Messages_array.push(massage);
            /*
            fs.appendFile('mailsWeNeed.txt', decode_data, function (err) {
                if (err)
                    console.log(err);
                else
                    console.log('Append operation complete.');
            });
            */
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
 * @param {context} context Context of the email. 
 */
// TODO : function sendEmail needs to be promisified.
async function sendEmail(auth, subject, from, to, context){
    const gmail = google.gmail({version: 'v1', auth});

    let utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    let notifications = [];

    for(let i = 0; i < context.length; i++){
        notifications.push(`<font color="blue"> Key word : ${context[i].word.replace(/\r\n/g,'<br>')}</font><br>`);
        notifications.push(context[i].context.replace(/\r\n/g,'<br>') + '<br>');
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

    res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
    });
    console.log(res.data);
    return res.data;
}