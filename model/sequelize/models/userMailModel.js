const {  DataTypes } = require('sequelize');
let model;
const name = 'UserMails';
module.exports = {
  create,
  init,
  find,
  model,
  name
};


function init( sequelize){
  
    model = sequelize.define('UserMails', {
        // Model attributes are defined here
        //id and foreign key userId will be created automatically in extraSetup.js
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        keyword: {
          type: DataTypes.STRING
        },
        // the time the message was originally accepted by Google
        intetnal_date: {
            type: "bigint",
            allowNull: false
          // allowNull defaults to true
        }
      }, {
        // Other model options go here
    
        //let table name will be equal to the model name.
        freezeTableName: true
    });
    console.log('table "UserMails" is defined.');
    //This creates the table if it doesn't exist (and does nothing if it already exists).
    //User.sync({ force: true }) : creates the table, dropping it first if it already existed.
    
    return model;
}

/**
 * Insert mail records in db.
 *
 * @param {Array} messages array of messages.
 */
async function create(messages){
  model.bulkCreate(messages, {validate: true, fields: ["text", "keyword", "intetnal_date", "userId"]});
}


async function find(userId){
    return model.findOne({ where: { UserId: userId } })
    .catch(function (error) {
        console.log('UserMails.findOne() occurs error：' + error.message);
    });
}