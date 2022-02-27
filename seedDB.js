// this file here is used to seed some data into our database
const crypto = require('crypto');
const { User, Review, ContactInfo } = require('./dbInit');

async function seedDB() {
    await seedUsers();
    await seedReviews();
};

async function seedUsers() {
    const userJson = require('./allUsers.json');
    return Promise.all(userJson.map(user => {
        const salt = crypto.randomBytes(16);
        const { id, email, name, password, about, interests, location, languages, countrycode, profilePicture } = user;
        return crypto.pbkdf2(password, salt, 1000, 32, 'sha512', async (err, hashedPassword) => {
            if (err) return next(err);
            const user = await User.create({ id, email, name, password: hashedPassword, salt, about, interests, location, languages, countrycode, profilePicture });
            const contactInfo = await ContactInfo.create({ userId: user.id });
            console.log('user', user.id);
            console.log('contactInfo', contactInfo.id);
        });
    }));
}

async function seedReviews() {
    const reviewJson = require('./allReviews.json');
    return Promise.all(reviewJson.map(review => {
        const { reviewerId, receiverId, content } = review;
        return Review.create({ reviewerId, receiverId, content });
    }));
}

module.exports = seedDB;