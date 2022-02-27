const { User, ContactInfo,Review } = require('../dbInit');
const crypto = require('crypto');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');

// in express v4, we need to wrap async functions in a try/catch block so that express can handle errors properly
// instead of writing try/catch in every function, it is refactored with a catchAsync function wrapper which can reuse
// whenever needed to increase readability
// express v5 will get rid of this whole try/catch block and will be built-in instead
module.exports.getAllUsers = catchAsync(async (req, res) => {
    // User.findAll() method to query "Select * from Users" excluding 'password' 'salt' 'updatedAt' attributes
    const users = await User.findAll({
        attributes: { exclude: ['password', 'salt', 'updatedAt'] }
    });
    res.status(200).json(users);
});

module.exports.register = catchAsync(async (req, res) => {
    const { email, name, password } = req.body;
    // salt is a random data that is used to add additional security to hashed password
    const salt = crypto.randomBytes(16);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // this block code is adapted from passport-local's documentation to encrypt password and then loggin user in
    crypto.pbkdf2(password, salt, 1000, 32, 'sha512', catchAsync(async (err, hashedPassword) => {
        if (err) return next(err);
        // create a new user and a set of social media handle to go with that user
        const user = await User.create({ email, name, password: hashedPassword, salt });
        const contactInfo = await ContactInfo.create({ userId: user.id });

        // when a new user is successfully created, automatically log that user in
        // req.login is a built-in function from passport.js to log user in
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
    req.logOut(); // a built-in method from passport
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports.getUserProfile = catchAsync(async (req, res) => {
    /* User.findOne() block is a sequelize function to query User table to find a user with the exact ID
    and then 'join' ContactInfo table */
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

    // set() method is used to adjust values in certain attributes in the data table.
    // after setting the values, we need to then call the save() method to save data. If not, data will remain unchanged in the database.
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