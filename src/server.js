require('../config.js');
const express = require('express');
const cors = require('cors');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('../routes/index');
var usersRouter = require('../routes/users');
var gmailRouter = require('../routes/gmail');
var testRouter = require('../routes/test');
var mailRouter = require('../routes/mail');

const corsOptions = {
    origin: [
        'http://localhost:3003',
      'http://localhost:3002',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  

const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/gmail', gmailRouter);
app.use('/mail', mailRouter);
app.use('/test', testRouter);


app.use(cors(corsOptions));

const port = 3002;
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}...`);
});


