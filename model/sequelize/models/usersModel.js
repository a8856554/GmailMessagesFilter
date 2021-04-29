const { Sequelize, DataTypes, Model } = require('sequelize');
const pgp = require('pg-promise')();
let model;
const name = 'Users';
if (!global.db) {
  db = pgp(process.env.DB_URL);
  console.log('get db url again...');
}
module.exports = {
  model,
  name,
  create,
  init,
  find,
  getAllUserId,
  getAllUserTokenNRoutine
};


function init( sequelize){
  
    model = sequelize.define('Users', {
        // Model attributes are defined here
        userName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
          type: DataTypes.STRING
        },
        lastName: {
          type: DataTypes.STRING
          // allowNull defaults to true
        },
        email: {
          type: DataTypes.STRING
          // allowNull defaults to true
        }
      }, {
        // Other model options go here
    
        //let table name will be equal to the model name.
        freezeTableName: true
    });
    console.log('table "Users" is defined.');
    //This creates the table if it doesn't exist (and does nothing if it already exists).
    //User.sync({ force: true }) : creates the table, dropping it first if it already existed.
    
    return model;
}

/**
 * Create a user with his userName and password 
 *
 * @param {string} userName User's name of the new user
 * @param {string} password User's password of the new user
 */
async function create(userName, password){
  model.create({ userName: userName, password: password });
}

/**
 * find a user whose name is tha same as userName.
 *
 * @param {string} userName User's name of the user
 */
async function find(userName){
  return model.findOne({ where: { userName: userName } })
          .catch(function (error) {
              console.log('Users.findOne() occurs error：' + error.message);
          });
}

/**
 * Get all ids in table "Users".
 * Return a array of number.
 * @param {Sequelize} sequelize a sequelize instance.
 */
 async function getAllUserId(sequelize){
  let object_array = await sequelize.query(`SELECT id from "Users";`);
  object_array = object_array[0];

  let id_array = [];
  let len = object_array.length;
  for(let i = 0; i < len; i = i+1)
    id_array.push(object_array[i].id);

  return id_array;
  /*
  return model.findAll({
    attributes: ['id']
  });*/
  /*
  const sql = `
        SELECT id
        FROM "Users"
    ;`;
  return db.any(sql);*/
}

/**
 * Get gmailtoken and routine data per user.
 * Return a array of User_data.
 * each element in return array is like :
 * {
    UserId: 2,
    time_interval: '900000',
    time_last_search: '1619568475438',
    filtering_word0: '原創',
    filtering_word1: '同人',
    filtering_word2: '練習',
    filtering_word3: '哪裡',
    filtering_word4: null,
    access_token: '',
    refresh_token: '',
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
    token_type: 'Bearer',
    expiry_date: '1619694416056'
  }
 */
 async function getAllUserTokenNRoutine(){
  const sql = `
    SELECT "RoutineNotifications"."UserId",
    "RoutineNotifications".time_interval, "RoutineNotifications".time_last_search,
    "RoutineNotifications".filtering_word0, "RoutineNotifications".filtering_word1, "RoutineNotifications".filtering_word2, "RoutineNotifications".filtering_word3, "RoutineNotifications".filtering_word4,
    "GmailTokens".access_token, "GmailTokens".refresh_token, "GmailTokens".scope,
    "GmailTokens".token_type, "GmailTokens".expiry_date
    FROM "RoutineNotifications" INNER JOIN "GmailTokens"
    ON "RoutineNotifications"."UserId" = "GmailTokens"."UserId"
  ;`;
  return db.any(sql);
}


