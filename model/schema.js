require('../config.js');
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);

const schemaSql = `
    -- Extensions
    

    -- Drop (droppable only when no dependency)
    
    DROP TABLE IF EXISTS mails;

    -- Create
    
    CREATE TABLE mails (
        id              serial PRIMARY KEY NOT NULL,
        accountName     text NOT NULL,
        text            text NOT NULL,
        keyWords        text NOT NULL,
        ts              bigint NOT NULL DEFAULT (extract(epoch from now()))
    )
`;

const dataSql = `
    -- Populate dummy posts
    INSERT INTO mails (accountName, text, keyWords ,ts)
    SELECT
        'test1',
        'hello, this is an email.',
        'peko',
        round(extract(epoch from now()) + (i - 10) * 3600.0)
    FROM generate_series(1, 10) AS s(i);
`;

db.none(schemaSql).then(() => {
    console.log('Schema created');
    db.none(dataSql).then(() => {
        console.log('Data populated');
        pgp.end();
    });
}).catch(err => {
    console.log('Error creating schema', err);
});
