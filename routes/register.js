let express = require('express');
let router = express.Router();
let usersModel = require('../model/usersModel.js');

router.post('/', function(req, res, next) {
    const {userName, password} = req.body;
    if (!userName || !password) {
        const err = new Error('userName and password are required');
        err.status = 400;
        throw err;
    }
    usersModel.create(userName, password)
    .then(post => {
        //res.json(post);
        res.send('register successfully.');
    }).catch(next);
    
});

module.exports = router;