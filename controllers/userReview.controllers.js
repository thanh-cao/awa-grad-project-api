const { User, Review } = require('../dbInit');
const catchAsync = require('../utils/catchAsync');

module.exports.getUserReviews = catchAsync(async (req, res) => {
    const userId = parseInt(req.params.id);
    // findAndCountAll is a sequelize method to find all data rows and count how many there are
    const reviews = await Review.findAndCountAll({
        where: {
            receiverId: userId,
        },
        include: [
            {
                model: User,
                as: 'reviewer',
                attributes: ['id', 'name', 'location', 'profilePicture'],
            }
        ]
    });
    res.status(200).json(reviews);
})

module.exports.createReview = catchAsync(async (req, res) => {
    const receiverId = req.params.id;
    const reviewerId = req.user.id;
    const { content } = req.body;
    const review = await Review.create({ content, receiverId, reviewerId });
    res.status(200).json(review);
})

module.exports.editReview = catchAsync(async (req, res) => {
    const { content } = req.body;
    const review = await Review.findByPk(req.params.reviewid);
    review.content = content;
    await review.save();
    res.status(200).json(review);
})

module.exports.deleteReview = catchAsync(async (req, res) => {
    const review = await Review.findByPk(req.params.reviewid);
    await review.destroy();
    res.status(200).json({ message: 'Review deleted successfully' });
})