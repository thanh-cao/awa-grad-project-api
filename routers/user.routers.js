const express = require('express');
const router = express.Router();

const users = require('../controllers/user.controllers');

router.get('/', users.getAllUsers);

router.post('/register', users.register);

module.exports = router;