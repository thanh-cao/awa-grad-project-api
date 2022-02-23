const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams = true to get access to user's id in params when base routes contain /:id
const { isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/userReview.controllers');


router.route('/')
    .get(reviews.getUserReviews)
    .post(reviews.createReview);

router.route('/:reviewid')
    .put(isReviewAuthor, reviews.editReview)
    .delete(isReviewAuthor, reviews.deleteReview);

module.exports = router;