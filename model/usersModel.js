require('../config.js');
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URL);
module.exports = {
  create,
  init,
  find
};
let Users;
init().then((fulfilled)=>{ console.log('table "Users" is connected.');});

async function init(){
    Users = sequelize.define('Users', {
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
        }
      }, {
        // Other model options go here
    
        //let table name will be equal to the model name.
        freezeTableName: true
    });
    
    //This creates the table if it doesn't exist (and does nothing if it already exists).
    //User.sync({ force: true }) : creates the table, dropping it first if it already existed.
    await Users.sync();
}

/**
 * Create a user with his userName and password 
 *
 * @param {string} userName User's name of the new user
 * @param {string} password User's password of the new user
 */
async function create(userName, password){
    Users.create({ userName: userName, password: password });
}

/**
 * Create a user with his userName and password 
 *
 * @param {string} userName User's name of the user
 */
 async function find(userName){
  return Users.findOne({ where: { userName: userName } })
          .catch(function (error) {
              console.log('Users.findOne() occurs error：' + error.message);
          });
}