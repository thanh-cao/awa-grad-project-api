const { Review } = require('../dbInit');
const catchAsync = require('../utils/catchAsync');

module.exports.createReview = catchAsync(async (req, res) => {
    const receiverId = req.params.id;
    const reviewerId = req.user.id;
    const { content } = req.body;
    const review = await Review.create({ content, receiverId, reviewerId });
    res.status(200).json(review);
})