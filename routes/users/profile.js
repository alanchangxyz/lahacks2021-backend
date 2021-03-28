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
        const friends = await pool.query(`SELECT DISTINCT recent.user_id, recent.disp_name, recent.pfp, recent.song_id, songs.song_name, songs.song_artist, songs.img_url
        FROM (SELECT checkins.user_id, users.disp_name, users.pfp, checkins.song_id 
        FROM (SELECT user_id, MAX(checkin_time) FROM checkins
        GROUP BY user_id) time
        JOIN checkins ON time.max = checkins.checkin_time
        JOIN users ON time.user_id = users.user_id) recent
        JOIN friends ON friends.user_id2 = recent.user_id
        JOIN songs ON songs.song_id = recent.song_id
        where friends.user_id1 = '${req.body.user_id}'`);
        res.send(friends.rows);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = profileRouter;