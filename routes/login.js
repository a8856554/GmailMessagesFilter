let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken')
let loginModel = require('../model/loginModel.js');

router.post('/', function(req, res, next) {
    const {userName, password} = req.body;
    if (!userName || !password) {
        const err = new Error('userName and password are required');
        err.status = 400;
        throw err;
    }
    loginModel.find(userName)
    .then(user => {
        if(user.password != req.body.password){
            res.json({ success: false, message: 'Authenticate failed. Wrong password'})
        }
        else{
            let token = jwt.sign(user.toJSON(), process.env.SECRET, {
                expiresIn: 60*60*1
            });
            res.json({
                success: true,
                message: 'Get Authentication and JWT , pekopeko.',
                token: token
            });
        }
    })
    .catch(function (error) {
        console.log(error);
        res.json({ success: false, message: 'Authenticate failed. User not found.'})
    });
    
});

module.exports = router;