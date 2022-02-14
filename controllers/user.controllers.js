const { User } = require('../dbInit');
const catchAsync = require('../utils/catchAsync');

module.exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.findAll();
    res.status(200).json({ users });
});
