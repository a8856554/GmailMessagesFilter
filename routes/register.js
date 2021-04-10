let express = require('express');
let router = express.Router();
let registerModel = require('../model/registerModel.js');



router.post('/', function(req, res, next) {
    const {userName, password} = req.body;
    if (!userName || !password) {
        const err = new Error('userName and password are required');
        err.status = 400;
        throw err;
    }
    registerModel.create(userName, password)
    .then(post => {
        //res.json(post);
        res.send('register successfully.');
    }).catch(next);
    
});

module.exports = router;