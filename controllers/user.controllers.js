const { User } = require('../dbInit');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');

module.exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.findAll();
    res.status(200).json({ users });
});

module.exports.register = catchAsync(async (req, res) => {
    const { email, name, password } = req.body;
    const salt = crypto.randomBytes(16);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    crypto.pbkdf2(password, salt, 1000, 32, 'sha512', catchAsync(async (err, hashedPassword) => {
        if (err) return next(err);
        const user = await User.create({ email, name, password: hashedPassword, salt });
        req.login(user, (err) => {
            if (err) return next(err);
            res.status(200).json(user);
        });
    }));
});