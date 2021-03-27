const { default: axios } = require('axios');
const express = require('express');

const friendRequestsRouter = express();
const pool = require('../../postgres/config');

friendRequestsRouter.use(express.json());

friendRequestsRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const friendRequests = await pool.query(`SELECT * FROM friend_reqs WHERE user_id2 = '${id}'`);
        const getUserInfo = async (f) => {
            let friendInfo = await pool.query(`SELECT * from users WHERE user_id = '${f.user_id1}'`);
            return friendInfo.rows[0];
        }
        const friends = await Promise.all(friendRequests.rows.map(async (f) => await getUserInfo(f)));
        res.send(friends);        
    } catch(err) {
        res.status(400).send(err.message);
    }
});

friendRequestsRouter.post('/', async (req, res) => {
    try {
        const { user1, user2 } = req.body;
        // make sure both user ids are valid in the db
        const usersFound = await pool.query(`SELECT * FROM users WHERE user_id = '${user1}' OR user_id = '${user2}'`);
        if (usersFound.rows.length !== 2) {
            res.send('The user ID you entered is not valid!');
        } else {
            // check if friend relationship exists and no friend request is already pending; create a new one if not exists
            const relationshipExists = await pool.query(`SELECT * from friends WHERE (user_id1 = '${user1}' AND user_id2 = '${user2}') OR (user_id1 = '${user2}' AND user_id2 = '${user1}')`);
            if (relationshipExists.rows.length > 0) {
                res.send('You are already friends with that user!');
            } else {
                const friendReqExists = await pool.query(`SELECT * from friend_reqs WHERE (user_id1 = '${user1}' AND user_id2 = '${user2}') OR (user_id1 = '${user2}' AND user_id2 = '${user1}')`);
                if (friendReqExists.rows.length > 0) {
                    res.send('There is already an existing friend request between you and that user!');
                } else {
                    await pool.query(`INSERT INTO friend_reqs VALUES ('${user1}', '${user2}')`);
                    res.send('Sent successfully!');
                }
            }
        }
    } catch(err) {
        res.status(400).send(err.message);
    }
});

friendRequestsRouter.post('/handle', async (req, res) => {
    try {
        const { user1, user2, action } = req.body;
        // make sure friend req exists
        // accept or reject based on action
        if (action === 'accept') {
            const reqFound = await pool.query(`SELECT * FROM friend_reqs WHERE user_id1 = '${user1}' AND user_id2 = '${user2}'`);
            if (reqFound.rows.length > 0) {
                await pool.query(`DELETE FROM friend_reqs WHERE user_id1 = '${user1}' AND user_id2 = '${user2}'`);
                await pool.query(`INSERT INTO friends VALUES ('${user1}', '${user2}')`);
                res.send('Friend added!');
            }
        } else if (action === 'reject') {
            const reqFound = await pool.query(`SELECT * FROM friend_reqs WHERE user_id1 = '${user1}' AND user_id2 = '${user2}'`);
            if (reqFound.rows.length > 0) {
                await pool.query(`DELETE FROM friend_reqs WHERE user_id1 = '${user1}' AND user_id2 = '${user2}'`);
                res.send('Friend request rejected!');
            }
        }
    } catch(err) {
        res.status(400).send(err.message);
    }
});


module.exports = friendRequestsRouter;