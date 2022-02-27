const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
// setup multer middlware and cloudinary to upload images
const multer = require('multer');
const { cloudinary, storage } = require('../cloudinary');
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

// upload.single() method is from multer to upload a single file to cloudinary. The name needs to match the name attribute on the form input.
// If uploading multiple photos, use upload.array('insertNameOfFormInput')
router.post('/imageupload', upload.single('profilePicture'), catchAsync(async (req, res) => {
    // check if user's current profile picture already exists in cloudinary database. If yes, delete it.
    let oldPicture = req.body.oldPicture
    if (oldPicture) {
        oldPicture = `${oldPicture.split('/')[7]}/${oldPicture.split('/')[8]}`;
        let oldPictureId = oldPicture.split('.')[0];
        cloudinary.uploader.destroy(oldPictureId, (err) => {if (err) next(err)});
        // cloudinary.uploader.destroy is a cloudinary method to delete a photo from its database
    }
    const imgURL = req.file ? req.file.path : null;
    res.json(imgURL);
}))

module.exports = router;