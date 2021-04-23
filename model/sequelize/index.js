const { Sequelize } = require('sequelize');
const { applyExtraSetup } = require('./extraSetup');
const sequelize = new Sequelize(process.env.DB_URL);
const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const db = {};


let models_path = path.join(__dirname, 'models');
fs
  .readdirSync(models_path)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(models_path, file));
    
    let m = model.init(sequelize);
    db[model.name] = model;
    db[model.name].model = m;
  });




applyExtraSetup(sequelize,db);

Object.keys(db).forEach(modelName => {
    //sync() every model
    db[modelName].model.sync();
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;