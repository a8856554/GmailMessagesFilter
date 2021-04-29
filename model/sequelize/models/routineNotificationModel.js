const { Sequelize, DataTypes, Model } = require('sequelize');
let model;
const name = 'RoutineNotifications';
const FILTERING_WORDS_NUM = 5;
module.exports = {
  create,
  init,
  find,
  update,
  model,
  name,
  FILTERING_WORDS_NUM
};


function init( sequelize){
  
    model = sequelize.define( name, {
        // Model attributes are defined here
        time_interval : {
            type: "bigint",
        },
        time_last_search : {
            type: "bigint",
        },
        filtering_word0 : {
            type: DataTypes.STRING,
        },
        filtering_word1 : {
            type: DataTypes.STRING,
        },
        filtering_word2 : {
            type: DataTypes.STRING,
        },
        filtering_word3 : {
            type: DataTypes.STRING,
        },
        filtering_word4 : {
            type: DataTypes.STRING,
        },
      }, {
        // Other model options go here
    
        //let table name will be equal to the model name.
        freezeTableName: true
    });
    console.log(`table "${name}" is defined.`);
    //This creates the table if it doesn't exist (and does nothing if it already exists).
    //User.sync({ force: true }) : creates the table, dropping it first if it already existed.
    
    return model;
}

/**
 * Create a user's routine record into database.
 * 
 * @param {number} userId User's id in "Users" table.
 * @param {number} time_interval The time interval between 2 routines, in ms, default : 15 mins.
 * @param {number} time_last_search Time the last routine completed, in ms, default : 2000/01/01 0:00.
 * @param {array} filtering_words A filtering word array, number of elements is limited to 5.
 */
async function create(userId, time_interval = 900000, time_last_search = 946656000,filtering_words = []){
  let record = 
  {  time_interval: time_interval, 
     time_last_search: time_last_search,
     UserId: userId
  };
  
  if( filtering_words.length > FILTERING_WORDS_NUM ){
      let pop_num = filtering_words.length - FILTERING_WORDS_NUM;
      for(let i = 0; i < pop_num; i = i+1)
        filtering_words.pop();
  }
    
  for(let i = 0; i < filtering_words.length; i = i+1)
    record[`filtering_word${i}`] = filtering_words[i];

  return model.create(record)
        .catch(function (error) {
            console.log('routineNotificationModel.create() occurs error：' + error.message);
        });
}

/**
 * Find a record whose attribute "UserId" is equal to userId.
 *"routine_data": {
        "id": 2,
        "time_interval": "900000",
        "time_last_search": "1619568475438",
        "filtering_word0": "蝴蝶",
        "filtering_word1": "宮廷",
        "filtering_word2": "穀精",
        "filtering_word3": "石龍尾",
        "filtering_word4": null,
        "createdAt": "2021-04-28T13:56:34.800Z",
        "updatedAt": "2021-04-28T13:56:34.800Z",
        "UserId": 1
    }
 * @param {number} userId User's id in "Users" table.
 */
async function find(userId){
    let routine_data = await model.findOne({ where: { UserId: userId } })
    .catch(function (error) {
        console.log('routineNotificationModel.findOne() occurs error：' + error.message);
    });


    
    return routine_data;
}

/**
 * Create a user's routine record into database.
 * 
 * @param {number} userId User's id in "Users" table.
 * @param {number} time_interval The time interval between 2 routines, in ms.
 * @param {number} time_last_search Time the last routine completed, in ms.
 * @param {array} filtering_words A filtering word array, number of element is limited to 5.
 */
async function update(userId, time_interval = 900000, time_last_search = (Date.now() - 900000),filtering_words = []){
    let routineRecord = await find(userId);

    routineRecord.time_interval = time_interval;
    routineRecord.time_last_search = time_last_search;

    if( filtering_words.length > FILTERING_WORDS_NUM ){
        let pop_num = filtering_words.length - FILTERING_WORDS_NUM;
        for(let i = 0; i < pop_num; i = i+1)
          filtering_words.pop();
    }

    for(let i = 0; i < filtering_words.length; i = i+1)
      routineRecord[`filtering_word${i}`] = filtering_words[i];

    await routineRecord.save()
            .catch(function (error) {
                console.log('routineNotificationModel.update() occurs error：' + error.message);
            });

    return routineRecord;
}