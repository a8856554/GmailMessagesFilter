const { Sequelize, DataTypes, Model, Deferrable } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URL);
const usersModel = require('../model/usersModel.js');
module.exports = {
  create,
  init,
  find,
};
let GmailTokens;
init().then((fulfilled)=>{ console.log('table "GmailTokens" is connected.');});

async function init(){
    GmailTokens = sequelize.define('GmailTokens', {
        
        access_token: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        refresh_token: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        scope: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        token_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expiry_date: {
            type: 'TIMESTAMP',
            allowNull: false
        }
      }, {
        // Other model options go here
    
        //let table name will be equal to the model name.
        freezeTableName: true
    });
    
    //This creates the table if it doesn't exist (and does nothing if it already exists).
    //User.sync({ force: true }) : creates the table, dropping it first if it already existed.
    await GmailTokens.sync();
}

/**
 * Create a user with his userName and password 
 *
 * @param {string} userName User's name of the new user
 * @param {string} password User's password of the new user
 */
 async function create(userName, password){
    
}

/**
 * Create a user with his userName and password 
 *
 * @param {string} userName User's name of the user
 */
 async function find(userName){
  
}