// ideas for routes:
// get single audio track features and return a "sadness score" or something 
// get multiple audio track features, compile scores and return stats like average, median, etc.
// get latest checkin from a user by uid;
// get song info from db by song id to pass to frontend card components

const { default: axios } = require('axios');
const express = require('express');


const audioRouter = express();
const pool = require('../../postgres/config');

audioRouter.use(express.json());

// this route is currently configured to get the spotify stats for multiple songs from spotify, need to calc sadness score
// and handle case where only one song id is passed in
audioRouter.post('/features', async (req, res) => {
    try {
        const { songs, token } = req.body;      
        axios({
            method: 'get',
            url: `https://api.spotify.com/v1/audio-features?ids=${songs.join(",")}`,
            headers: { 
                'Authorization': `Bearer ${token}`
            },
        })
          .then((response) => {
            res.send(response.data);
          })
          .catch((err) => {
            res.status(400).send(err.message);
          });

        // example of querying db
        // const allSongs = await pool.query('SELECT * FROM songs');
        // res.send(allSongs.rows);
        
    } catch (err) {
        res.status(400).send(err.message);
    }
  });

module.exports = audioRouter;