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
        const data = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/me`,
            headers: { 
                'Authorization': `Bearer ${token}`
            },
        })
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            return null;
          });
        
        if (data) {
          let userExists = await pool.query(`SELECT * from users WHERE user_id = '${data.id}'`);
          userExists = userExists.rows.length !== 0;
          if (userExists) {
            await pool.query(`UPDATE users SET last_checked_in = NOW() WHERE user_id = '${data.id}';`)
          } else {
            await pool.query(`INSERT INTO users VALUES ('${data.id}', '${data.display_name}', '${data.images[0].url}', NOW());`)
          }

          //  TODO: add a row to the checkin table corresponding to that user and their last played 
          
          const recentlyPlayed = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/me/player/recently-played?limit=10`,
            headers: { 
                'Authorization': `Bearer ${token}`
            },
          })
            .then((response) => {
              return response.data.items.filter(track => track.type !== "ad");
            })
            .catch((err) => {
              return null;
            });
          const lastPlayed = recentlyPlayed[0];
          const recentCheckins = await pool.query(`SELECT * from checkins WHERE user_id = '${data.id}' and NOW() - interval '15 minutes' < checkin_time`);
          if (recentCheckins.rows.length == 0 && recentlyPlayed) {
            await pool.query(`INSERT INTO checkins(user_id, song_id, context_type, context_href, checkin_time, checkin_token) VALUES ('${data.id}', '${lastPlayed.track.id}', ${lastPlayed.context ? "'" + lastPlayed.context.type + "'" : 'null'}, ${lastPlayed.context ? "'" + lastPlayed.context.href + "'" : 'null'}, NOW(), '${token}')`);
          }
          recentlyPlayed.forEach(async (song) => {
            let songExists = await pool.query(`SELECT * from songs WHERE song_id = '${song.track.id}'`);
            if (songExists.rows.length === 0) {
              await pool.query(`INSERT INTO songs VALUES ('${song.track.id}', '${song.track.name}', '${song.track.artists[0].name}', '${song.track.href}', '${song.track.album.images[0].url}')`);
            }
            let historyExists = await pool.query(`SELECT * from history WHERE song_id = '${song.track.id}' AND TIMESTAMP '${song.played_at.replace('T', ' ').replace('Z', '')}' - interval '10 minutes' > time_stamp`);
            if (historyExists.rows.length === 0) {
              // console.log(song.track.name);
              // console.log(`INSERT INTO history VALUES ('${data.id}', '${song.track.id}', TIMESTAMP '${song.played_at.replace('T', ' ').replace('Z', '')}'`);
              await pool.query(`INSERT INTO history VALUES ('${data.id}', '${song.track.id}', TIMESTAMP '${song.played_at.replace('T', ' ').replace('Z', '')}')`);
              console.log(song.track.name);
            }
          });
          res.send(true);
        } else {
          res.send(false);
        }        
    } catch (err) {
        res.status(400).send(false);
    }
  });

module.exports = accountsRouter;