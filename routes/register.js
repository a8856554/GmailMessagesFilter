let express = require('express');
let router = express.Router();
let usersModel = require('../model/usersModel.js');
if (!global.sequelizeDB) {
    sequelizeDB  = require('../model/sequelize');
}

router.post('/', function(req, res, next) {
    const {userName, password} = req.body;
    if (!userName || !password) {
        const err = new Error('userName and password are required');
        err.status = 400;
        throw err;
    }

    if(sequelizeDB["Users"].find(userName)){
        res.send('The user name has already existed.');
        return;
    }


    sequelizeDB["Users"].create(userName, password)
    .then(post => {
        //res.json(post);
        res.send('register successfully.');
    }).catch(next);
    
});

module.exports = router;