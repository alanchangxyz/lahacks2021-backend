const { default: axios } = require('axios');
const express = require('express');

const songsRouter = express();
const pool = require('../../postgres/config');

songsRouter.use(express.json());

songsRouter.post('/add', async (req, res) => {
    try {
        const { song_id, song_name, song_artist, song_href, img_url } = req.body;
        const song = await pool.query(`INSERT INTO songs VALUES ('${song_id}', '${song_name}', '${song_artist}', '${song_href}', '${img_url}');`);
        res.send("song added");
        
    } catch(err) {
        res.status(400).send(err.message);
    }
});

songsRouter.get('/', async (req, res) => {
    try {
        const song = await pool.query(`SELECT * FROM songs WHERE song_id = '${req.body.song_id}'`);
        res.send(song.rows);
        
    } catch (err) {
        res.status(400).send(err.message);
    }
});

songsRouter.get('/all', async (req, res) => {
    try {
        const allSongs = await pool.query('SELECT * FROM songs');
        res.send(allSongs.rows);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

songsRouter.delete('/', async (req, res) => {
    try {
        const song = await pool.query(`DELETE FROM songs WHERE song_id = '${req.body.song_id}'`);
        res.send("song deleted");
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// this route is currently configured to get the spotify stats for multiple songs from spotify, need to calc sadness score
// and handle case where only one song id is passed in
songsRouter.post('/features', async (req, res) => {
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

module.exports = songsRouter;