const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');

const users = require('../controllers/user.controllers');

router.get('/', users.getAllUsers);

router.post('/register', users.register);

router.post('/login', users.login);

router.get('/logout', users.logout);

router.get('/authenticate', users.authenticateUser);

router.route('/:id')
    .get( users.getUserProfile)
    .put(isLoggedIn, users.updateUserProfile);

module.exports = router;