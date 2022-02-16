const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
// setup multer middlware and cloudinary to upload images
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });  // direct multer to save images on cloudinary

const catchAsync = require('../utils/catchAsync');

router.get('/ticketmaster', catchAsync(async (req, res) => {
    const TM_API_URL = 'https://app.ticketmaster.com/discovery/v2';
    const location = req.query.keyword;
    const url = `${TM_API_URL}/events.json?apikey=${process.env.REACT_APP_TICKETMASTER_API_KEY}&keyword=${location}`;
    await fetch(url)
        .then(response => response.json())
        .then(result => res.json(result));
}));

router.post('/imageupload', upload.single('profilePicture'), catchAsync(async (req, res) => {
    const imgURL = req.file ? req.file.path : null;
    res.json(imgURL);
}))

module.exports = router;