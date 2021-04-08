require('../config.js');
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URL);

let Users;
initModel();

async function initModel(){
    Users = sequelize.define('Users', {
        // Model attributes are defined here
        userName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        passport: {
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