var express = require('express');
var router = express.Router();

if (!global.sequelizeDB) {
  sequelizeDB  = require('../model/sequelize');
}
const bcrypt = require('bcrypt');


/* GET user's profile listing. */
router.get('/', async function(req, res, next) {

  const userId = req.decoded.id;
  const user = await sequelizeDB["Users"].model.findByPk(userId);
  const user_routine = await sequelizeDB["RoutineNotifications"].find(userId);
  //send as a json object
  res.send({ user_profile: user , routine_data: user_routine});

});

/* create user's record in db table "RoutineNotifications". */ 
router.post('/user_routine', async function(req, res, next) {
  
  const userId = req.decoded.id;
  const {time_interval, time_last_search, filtering_words} = req.body;
  console.log(req.body);
  //check if the record has existed.
  const user_routine = await sequelizeDB["RoutineNotifications"].find(userId)
  if(user_routine){ res.send("Your routine record has existed."); return;}

  //if there is no record in database, then create a new record.
  const record = await sequelizeDB["RoutineNotifications"].create(userId, time_interval, time_last_search, filtering_words);
  res.send(record);

});

/* update user's profile*/ 
router.put('/', async function(req, res, next) {
  
});

/* delete user's gmail oAuth2 token*/ 
router.delete('/gmail_token', async function(req, res, next) {
  const userId = req.decoded.id;
  await sequelizeDB["GmailTokens"].deleteToken(userId)
  .then((deletedToken) =>{
      res.send('Sucessfully delete gmail oAuth2 token.');
      console.log('Sucessfully delete gmail oAuth2 token.' + JSON.stringify(deletedToken));
    }
  )
  .catch(function (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'failed to delete the gmail oAuth2 token in database.'});
  });
})

/* update user's password*/ 
router.put('/user_password', async function(req, res, next) {
  const userId = req.decoded.id;
  const {new_password} = req.body;
  if (!new_password) {
    res.status(400).json(
      { 
        success: false, 
        message: 'new_password is required.'
      }
    );
  }
  const user = await sequelizeDB["Users"].model.findByPk(userId);
  
  bcrypt.hash(new_password, Number(process.env.PG_SALT_ROUNDS))
  .then(function(hash) {
    // Store hash in your password DB.
    user.password = hash;
    user.save();
  })
  .then(function(hash) {
    res.send('Sucessfully reset your password.');
  })
  .catch(function (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `A error occurs during bcrypt password : ${error}`});
  });
});
module.exports = router;
