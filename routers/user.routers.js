const express = require('express');
const router = express.Router();
// setup multer middlware and cloudinary to upload images
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });  // direct multer to save images on cloudinary

const users = require('../controllers/user.controllers');

router.get('/', users.getAllUsers);

router.post('/register', users.register);
router.get('/register', (req, res) => res.render('register'))
router.post('/login', users.login);

router.get('/logout', users.logout);

router.route('/:id')
    .get(users.getUserProfile)
    .post(upload.single('profilePicture'), users.updateUserProfile);

module.exports = router;