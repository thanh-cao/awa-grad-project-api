const { User, ContactInfo,Review } = require('../dbInit');
const crypto = require('crypto');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');

module.exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.findAll({
        attributes: { exclude: ['password', 'salt', 'updatedAt'] }
    });
    res.status(200).json(users);
});

module.exports.register = catchAsync(async (req, res) => {
    const { email, name, password } = req.body;
    const salt = crypto.randomBytes(16);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    crypto.pbkdf2(password, salt, 1000, 32, 'sha512', catchAsync(async (err, hashedPassword) => {
        if (err) return next(err);
        const user = await User.create({ email, name, password: hashedPassword, salt });
        const contactInfo = await ContactInfo.create({ userId: user.id });
        req.login(user, (err) => {
            if (err) return next(err);
            let cleanUser = user.toJSON();
            delete cleanUser.password;
            delete cleanUser.salt;
            res.status(200).json(cleanUser);
        });
    }));
});

module.exports.login = (req, res) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: 'Something went wrong' });
        }
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        };

        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Something went wrong' });
            };
            let cleanUser = user.toJSON();
            delete cleanUser.password;
            delete cleanUser.salt;
            req.session.user = cleanUser;
            res.status(200).json(cleanUser);
        });
    })(req, res);
};

module.exports.logout = (req, res) => {
    req.logOut();
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports.getUserProfile = catchAsync(async (req, res) => {
    const user = await User.findOne({
        where: { id: req.params.id },
        attributes: { exclude: ['password', 'salt', 'updatedAt'] },
        include: [{
            model: ContactInfo,
            attributes: { exclude: ['updatedAt', 'createdAt'] }
        }]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
});

module.exports.updateUserProfile = catchAsync(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password', 'salt'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const contactInfo = await ContactInfo.findOne({ where: { userId: user.id } });

    const { about, interests, languages, location, profilePicture, countrycode, facebook, twitter, instagram } = req.body;

    user.set({ name: user.name, email: user.email, about, interests, languages, location, profilePicture, countrycode });
    contactInfo.set({ facebook, twitter, instagram });
    const updatedUser = await user.save();
    const updatedContactInfo = await contactInfo.save();

    res.status(200).json({user: updatedUser, contactInfo: updatedContactInfo});
});

module.exports.authenticateUser = (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.session.user);
    } else {
        res.status(401).json({ error: 'User not authenticated' });
    }
}