//require('../config.js');
const pgp = require('pg-promise')();
if (!global.db) {
    db = pgp(process.env.DB_URL);
    console.log('get db url again...');
}
module.exports = {
    create,
    list
};

/**
 * Insert mail records in db.
 *
 * @param {Array} messages array of messages.
 */
function create(messages) {
    
    //console.log(messages);
    let s = pgp.helpers.insert(messages, ['accountName', 'text', 'keyWords' ,'ts'], 'mails');
    s = s.replace(/"/g, '');
    const sql =  s +  ` RETURNING *;`;
    
    /*
    INSERT INTO mails (accountName, text, keyWords ,ts)
    SELECT
        'test1',
        'hello, this is an email.',
        'peko',
        round(extract(epoch from now()) + (i - 10) * 3600.0)
    */
    return db.many(sql);
}
/**
 * Insert mail records in db.
 *
 * @param {string} searchWords //the word we want to search in db
 */
function list(searchWords){
    const where = [];
    if (searchWords)
        where.push(`text ILIKE '%$1:value%'`);
    const sql = `
        SELECT *
        FROM mails
        ${where.length ? 'WHERE ' + where : ''}
    ;`;
    //console.log(sql);
    return db.any(sql, searchWords);
}