let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken')
let usersModel = require('../model/usersModel.js');
const bcrypt = require('bcrypt');

router.post('/', async function(req, res, next) {
    const {userName, password} = req.body;
    if (!userName || !password) {
        const err = new Error('userName and password are required');
        err.status = 400;
        throw err;
    }
    usersModel.find(userName)
    .then(async function (user){
        let bcryptBool = await bcrypt.compare(password, user.password);
        return { bcryptBool , user };
    })
    .then(({bcryptBool, user})=> {
        if(!bcryptBool){
            res.json({ success: false, message: 'Authenticate failed. Wrong password'});
            return;
        }

        let jwt_data = {
            id: user.id,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
        }
        let token = jwt.sign(jwt_data, process.env.SECRET, {
            expiresIn: 60*60*1
        });
        res.json({
            success: true,
            message: 'Get Authentication and JWT , pekopeko.',
            token: token
        });
        
    })
    .catch(function (error) {
        console.log(error);
        res.json({ success: false, message: 'Authenticate failed. User not found.'})
    });
    
});

module.exports = router;