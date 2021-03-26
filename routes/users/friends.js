const { default: axios } = require('axios');
const express = require('express');

const friendsRouter = express();
const pool = require('../../postgres/config');

friendsRouter.use(express.json());



module.exports = friendsRouter;