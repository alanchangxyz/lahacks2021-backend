const { default: axios } = require('axios');
const express = require('express');

const profileRouter = express();
const pool = require('../../postgres/config');

profileRouter.use(express.json());

profileRouter.post('/', async (req, res) => {
    try {
        const profile = await pool.query(`SELECT users.user_id, users.disp_name, users.pfp, checkins.song_id, songs.song_name, songs.song_artist, songs.img_url FROM
        checkins INNER JOIN users ON users.user_id = checkins.user_id 
        INNER JOIN songs ON checkins.song_id = songs.song_id
        AND checkins.checkin_token = '${req.body.token}'`);
        res.send(profile.rows);
        
    } catch (err) {
        res.status(400).send(err.message);
    }
});

profileRouter.post('/friends', async (req, res) => {
    try {
        const friends = await pool.query(`SELECT users.user_id, users.disp_name, users.pfp, last_song.song_name, last_song.song_artist, last_song.img_url, last_song.song_id FROM 
        friends INNER JOIN users ON friends.user_id2 = users.user_id
        INNER JOIN (SELECT * FROM (SELECT user_id, Min(song_id) song
        FROM (SELECT * FROM checkins ORDER BY checkin_time DESC) recent
        GROUP BY user_id) user_song
        INNER JOIN songs ON user_song.song = songs.song_id) AS last_song ON friends.user_id2 = last_song.user_id
        WHERE user_id1 = '${req.body.user_id}'`);
        res.send(friends.rows);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = profileRouter;