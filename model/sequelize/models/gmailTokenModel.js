const { Sequelize, DataTypes, Model, Deferrable } = require('sequelize');
let model;
const name = 'GmailTokens';
module.exports = {
  create,
  init,
  find,
  model,
  name
};


function init(sequelize){
    model = sequelize.define('GmailTokens', {
        
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
            type: "bigint",
            allowNull: false
        }
      }, {
        // Other model options go here
    
        //let table name will be equal to the model name.
        freezeTableName: true
    });
    console.log('table "GmailTokens" is defined.');
    //This creates the table if it doesn't exist (and does nothing if it already exists).
    //User.sync({ force: true }) : creates the table, dropping it first if it already existed.
    
    return model;
}

/**
 * Create a gmail Auth2 token record 
 *
 * @param {string} access_token
 * @param {string} refresh_token
 * @param {string} scope
 * @param {string} token_type
 * @param {number} expiry_date
 * @param {number} UserId
 */
async function create(access_token, refresh_token, scope, token_type, expiry_date, UserId){
    model.create({ 
        access_token: access_token, 
        refresh_token: refresh_token,
        scope : scope,
        token_type : token_type,
        expiry_date : expiry_date,
        UserId : UserId
    });
}

/**
 * 
 *
 * @param {string} userName User's name of the user
 */
async function find(userName){
  
}