const { Sequelize, DataTypes, Model, Deferrable } = require('sequelize');
const pgp = require('pg-promise')();
let model;
const name = 'GmailTokens';
if (!global.db) {
    db = pgp(process.env.DB_URL);
    console.log('get db url again...');
}
module.exports = {
  create,
  init,
  find,
  findAll,
  update,
  deleteToken,
  model,
  name
};


function init(sequelize){
    model = sequelize.define('GmailTokens', {
        //foreign key userId will be created automatically in extraSetup.js
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
 * find the token whose UserId === userId
 *
 * @param {number} userId User's id 
 */
 async function find(userId){
    return model.findOne({ where: { UserId: userId } })
    .catch(function (error) {
        console.log('GmailTokens.findOne() occurs error：' + error.message);
    });
}


/**
 * find all tokens in table  "GmailTokens"
 *
 * 
 */
 async function findAll(){
    return model.findAll({
        attributes: ["access_token", "refresh_token", "scope", "token_type", "expiry_date", "UserId"]
    })
    .catch(function (error) {
        console.log('GmailTokens.findAll() occurs error：' + error.message);
    });
}

/**
 * update a token record in table  "GmailTokens"
 *
 * @param {number} userId User's id 
 * @param {string} access_token a new access token 
 */
 async function update(userId, access_token = null){
    let token_record = await find(userId);
    if(access_token !== null)
        token_record.access_token = access_token;
    await token_record.save()
            .catch(function (error) {
                console.log('gmailTokenModel.update() occurs error：' + error.message);
            });
    return token_record;
}

/**
 * delete a token record with UserId in table "GmailTokens".
 *
 * @param {number} userId User's id 
 */
 async function deleteToken(userId){

    const sql = `
        DELETE FROM "GmailTokens" WHERE "UserId" = $1
        RETURNING *;
    `;
  return db.any(sql, userId);
}