const router = require('express').Router()
const bcrypt = require('bcrypt')
const sqlstring = require('sqlstring')
const pool = require('../utils/pool')()


// GET endpoint
router.route('/:date_range/:aptType/:aptMedium')
    .get((req, res) => {
        // Escape all strings for safe sql
        var today = null
            date_range = null
            aptType = null
            aptMedium = null
        try {
            today = sqlstring.escape(new Date().toISOString())
            date_range = sqlstring.escape(req.params.date_range).split(',')
            aptType = sqlstring.escape(req.params.aptType).toLowerCase()
            aptMedium = sqlstring.escape(req.params.aptMedium).toLowerCase()
        } catch (e) {
            return res.status(400).send(`Invalid input: ${e}`)
        }


        // The smart query that returns names of counsellors and the time they are available
        pool.query(`
        SELECT DISTINCT u.firstName, u.lastName, datetime 
        FROM (
            SELECT a.userid as id, datetime 
            FROM aptEnum a JOIN slots s ON a.userid = s.userid 
            WHERE aptmedium = ${aptMedium} AND apttype = ${aptType}) as times
        JOIN users u ON u.id = times.id 
        WHERE times.datetime > ${today} AND (times.datetime >= ${date_range[0]}' AND times.datetime <= '${date_range[1]});`, (err, result) => {
            if (err) {
                return res.status(400).send(err)
            }
            res.json(result.rows)
        })
    })


// POST endpoint
router.route('/add')
    .post((req, res) => {
        // Check auth headers
        if (!req.headers.authorization) {
            return res.status(400).send('No authorization credentials')
        }
        
        // Init and get the user details from the header
        var authHeader = null
            names = null
            password = null
            firstName = null
            lastName = null
        try {
            authHeader = new Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString().split(':')
            names = authHeader[0].split('-')
            password = authHeader[1]
            firstName = sqlstring.escape(names[0]).toLowerCase()
            lastName = sqlstring.escape(names[1]).toLowerCase()
        } catch (Exeception) {
            return res.status(400).send('Invalid format of authorization header')
        }

        // Query the specific user as (firstname, lastname) is unique
        pool.query(`
        SELECT password, users.id
        FROM users JOIN creds ON users.id = creds.userid 
        WHERE firstName = ${firstName} AND lastName = ${lastName};`, (err, result) => {
            if (err) {
                return res.status(400).send(err)
            }

            // If the user exists then continue
            if (result.rows[0]) {
                // Compare the password to the encrypted stored password
                bcrypt.compare(password, result.rows[0].password)
                    .then(isMatch => {
                        if (isMatch) {
                            if (req.body.length > 0) {

                                // This is the async function which will begin a transaction and commit iff all supplied datetimes are valid
                                // Otherwise it will throw an appropriate error and rollback the transaction
                                (async () => {
                                    try {
                                        await pool.query('BEGIN')
                                        let i = 0
                                        for (i; i < req.body.length; i++) {
                                            let element = req.body[i]

                                            // Check if datetime exists
                                            if (element.datetime) {

                                                // Check the format of datetime
                                                let temp = new Date(element.datetime)
                                                if (isNaN(temp.getTime())) {                                                    
                                                    res.status(400).send('Invalid datetime format')
                                                    throw 'Invalid datetime format'
                                                }

                                                // The insert query into the slots table
                                                await pool.query(`
                                                INSERT INTO slots (userid, datetime)
                                                VALUES ('${result.rows[0].id}', ${sqlstring.escape(element.datetime)});`)

                                            
                                            } else {
                                                res.status(400).send('Cannot find datetime property')
                                                throw 'Cannot find datetime property'
                                            }
                                        }
                                    
                                    // If all went well, commit the transaction and send response to client
                                    await pool.query('COMMIT')
                                    res.send('All availability blocks added')
                                    } 
                                    
                                    // If error occurred then rollback the transaction and log the error
                                    catch(e) {
                                        await pool.query('ROLLBACK')
                                        console.log(e)
                                    }
                                })()

                            // Below are the elses to the respective invalid input  
                            } else {
                                res.status(400).send('No body in post request')
                            }
                        } else {
                            res.status(400).send('Password incorrect')
                        }
                    })
            } else {
                res.status(400).send('User does not exist')
            }
        })
    })

module.exports = router


/*
Tables created manually in ElephantSQL, using:

CREATE TABLE users(
    id VARCHAR(256) PRIMARY KEY,
    firstName VARCHAR(256),
    lastName VARCHAR(256),
    UNIQUE (firstName, lastName)
);

CREATE TABLE creds(
    userid VARCHAR(256) REFERENCES users ON DELETE CASCADE,
    password VARCHAR(256),
    PRIMARY KEY (userid)
);

CREATE TABLE aptEnum(
    userid VARCHAR(256) REFERENCES users ON DELETE CASCADE,
    aptType VARCHAR(256),
    aptMedium VARCHAR(256),
    PRIMARY KEY (userid, aptType, aptMedium)
);

CREATE TABLE slots(
    userid VARCHAR(256) REFERENCES users ON DELETE CASCADE,
    id SERIAL PRIMARY KEY,
    datetime TIMESTAMP
);

*/
