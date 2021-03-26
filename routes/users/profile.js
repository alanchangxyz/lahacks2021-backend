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

module.exports = profileRouter;