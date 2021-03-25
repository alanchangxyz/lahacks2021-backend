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
        const { token } = req.body;
        let validToken = false;
        let data;
        data = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/me`,
            headers: { 
                'Authorization': `Bearer ${token}`
            },
        })
          .then((response) => {
            // console.log(response.data);
            return response.data;
          })
          .catch((err) => {
            return null;
          });
        if (data) {
          console.log(data);
          let userExists = await pool.query(`SELECT * from users WHERE user_id = '${data.id}'`);
          userExists = userExists.rows.length !== 0;
          if (userExists) {
            await pool.query(`UPDATE users SET last_checked_in = NOW() WHERE user_id = '${data.id}'`)
          } else {
            await pool.query(`INSERT INTO users VALUES ('${data.id}', '${data.display_name}', '${data.images[0].url}', NOW())`)
          }
          //  TODO: add a row to the checkin table corresponding to that user and their last played 
          res.send(data);
        } else {
          res.status(400).send(false);
        }
        
        

        // example of querying db
        // const allUsers = await pool.query('SELECT * FROM users');
        // res.send(allUsers.rows);
        
    } catch (err) {
        res.status(400).send(err.message);
    }
  });

module.exports = accountsRouter;