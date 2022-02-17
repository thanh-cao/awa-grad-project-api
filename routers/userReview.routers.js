const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams = true to get access to user's id in params when base routes contain /:id

const reviews = require('../controllers/userReview.controllers');


router.post('/', reviews.createReview);


module.exports = router;