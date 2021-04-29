var express = require('express');
var router = express.Router();

if (!global.sequelizeDB) {
  sequelizeDB  = require('../model/sequelize');
}
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

module.exports = router;
