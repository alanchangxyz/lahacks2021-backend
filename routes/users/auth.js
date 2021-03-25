// need to make an auth route to check that spotify token is valid;
//  on first login, store user id in users table and check in
// also do the standard check-in routes:
//  log check in in table
//  store song info in table if new (check song id or something??)

const { default: axios } = require('axios');
const express = require('express');


const accountsRouter = express();
const pool = require('../../postgres/config');

accountsRouter.use(express.json());

accountsRouter.post('/checkin', async (req, res) => {
    try {
        // get the user profile from spotify api;
        // check if the spotify user id is in our database users table;
        //  if it is, then set last_checked_in timestamp to now
        //  if it isn't then add a row with spotify userid, display name, profile picture url, last_checked_in timestamp = now
        //  add a row to the checkin table corresponding to that user and their last played

        // example of querying db
        const allUsers = await pool.query('SELECT * FROM users');
        res.send(allUsers.rows);

        // const user = {
        //     "user_id": req.body.id,
        //     "disp_name": req.body.display_name,
        //     "img_url": req.body.img,
        //     "last_checked_in": Date.now()
        // }

        // const userId = await pool.query();

        
    } catch (err) {
        res.status(400).send(err.message);
    }
  });

module.exports = accountsRouter;