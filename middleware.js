const { Review } = require('./dbInit');

module.exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // req.isAuthenticate() is a built-in function from passport to check if a user is logged in or not
        return next();
    }
    res.status(401).json({ error: 'User is not logged in.' });
};

// check if a loggedin user is also author of a user review in order to allow them edit/delete user review permission
module.exports.isReviewAuthor = (req, res, next) => {
    const { reviewid } = req.params;
    const { id } = req.user; // req.user is created by passport and is available if a user is authenticated and loggedin
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