const express = require('express');
const router = express.Router();

const users = require('../controllers/user.controllers');

router.get('/', users.getAllUsers);

router.post('/register', users.register);

router.post('/login', users.login);

router.get('/logout', users.logout);

router.route('/:id')
    .get(users.getUserProfile);

module.exports = router;