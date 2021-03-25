const { default: axios } = require('axios');
const express = require('express');

const songsRouter = express();
const pool = require('../../postgres/config');

songsRouter.use(express.json());

songsRouter.post('/addsong', async (req, res) => {
    try {
        const { song_id, song_name, song_artist, song_href, img_url } = req.body;
        const song = await pool.query(`INSERT INTO songs VALUES ('${song_id}', '${song_name}', '${song_artist}', '${song_href}', '${img_url}');`);
        res.send("song added");
        
    } catch(err) {
        res.status(400).send(err.message);
    }
});

songsRouter.get('/getsong', async (req, res) => {
    try {
        const song = await pool.query(`SELECT * FROM songs WHERE song_id = '${req.body.song_id}'`);
        res.send(song.rows);
        
    } catch (err) {
        res.status(400).send(err.message);
    }
});

songsRouter.get('/allsongs', async (req, res) => {
    try {
        const allSongs = await pool.query('SELECT * FROM songs');
        res.send(allSongs.rows);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

songsRouter.post('/deletesong', async (req, res) => {
    try {
        const song = await pool.query(`DELETE FROM songs WHERE song_id = '${req.body.song_id}'`);
        res.send("song deleted");
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = songsRouter;