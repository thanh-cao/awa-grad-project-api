const express = require('express');
/* 
line 93 on server.js:  app.use('/users/:id/reviews', userReviewRouters);
in this user review router, we need to set {mergeParams = true} 
to get access to user's id in params when base routes contain /:id  
*/
const router = express.Router({ mergeParams: true });
const { isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/userReview.controllers');


router.route('/')
    .get(reviews.getUserReviews)
    .post(reviews.createReview);

router.route('/:reviewid')
    .put(isReviewAuthor, reviews.editReview)
    .delete(isReviewAuthor, reviews.deleteReview);

module.exports = router;