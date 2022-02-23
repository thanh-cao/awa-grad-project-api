const { Review } = require('./dbInit');

module.exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'User is not logged in.' });
};

module.exports.isReviewAuthor = (req, res, next) => {
    const { reviewid } = req.params;
    const { id } = req.user;
    Review.findByPk(reviewid)
        .then(review => {
            if (review.reviewerId === id) {
                next();
            } else {
                res.status(401).json({ message: 'You are not authorized to edit this review.' });
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'Error occurred while trying to edit review.' });
        });
}