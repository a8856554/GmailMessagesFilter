const { Sequelize, DataTypes, Model } = require('sequelize');
let model;
const name = 'Users';
module.exports = {
  create,
  init,
  find,
  model,
  name
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
 * 
 *
 * @param {string} userName User's name of the user
 */
 async function find(userName){
  return model.findOne({ where: { userName: userName } })
          .catch(function (error) {
              console.log('Users.findOne() occurs error：' + error.message);
          });
}