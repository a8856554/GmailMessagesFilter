var express = require('express');
var router = express.Router();

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
const TOKEN_PATH = './resources/token.json';
const LAST_SEARCH_TIME_PATH = './resources/last_search_time.json';
let filtering_word = ['石龍尾','穀精','蝴蝶'];
let Messages_array = [];