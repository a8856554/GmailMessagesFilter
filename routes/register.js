let express = require('express');
let router = express.Router();
let usersModel = require('../model/usersModel.js');
const bcrypt = require('bcrypt');
if (!global.sequelizeDB) {
    sequelizeDB  = require('../model/sequelize');
}

router.post('/', async function(req, res, next) {
    const {userName, password} = req.body;
    if (!userName || !password) {
        const err = new Error('userName and password are required');
        err.status = 400;
        throw err;
    }

    let user = await sequelizeDB["Users"].find(userName);
    if(user){
        console.log(user);
        res.send('The user name has already existed.');
        return;
    }

    let hash;
    try {
        hash = await bcrypt.hash(password, Number(process.env.PG_SALT_ROUNDS));
    } catch (e) {
        console.log("caught error", e); 
        res.status(500).json({ success: false, message: `A error occurs during bcrypt password : ${error}`});
        return;
    }
    
    if(!hash)
        return;
    sequelizeDB["Users"].create(userName, hash)
    .then(post => {
        //res.json(post);
        res.send('register successfully.');
    }).catch(next);
    
});

module.exports = router;