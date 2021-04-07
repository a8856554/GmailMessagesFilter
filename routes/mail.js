let express = require('express');
let router = express.Router();
let mailModel = require('../model/mailModel.js');


/* http://host/mail?searchWords=蝴蝶 */
router.get('/', function(req, res, next) {
    const {searchWords} = req.query;
    mailModel.list([searchWords]).then(mails => {
        res.json(mails);
    }).catch(next);
  
});

module.exports = router;