if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
// import packages
const express = require('express');
const cors = require('cors');

/* 
Passport is a popular package used for handling user authentication.
Passport offers many different ways of authenticating users like facebook, twitter, GoogleAuth, username/password.
Each type of authenticating is called a strategy. In this project we use local strategy, which is authenticating with username/password.
*/
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto'); // is used to encrypt password

/* Session is used to assign every user visit with an ID and make further requests with that ID.
We can assign other data in request's session which is stored server-side, not in the cookie itself.
In this project, passport package connects with session in order to create authentication credentials.
Loggedin user's data is also assigned in req.session after a user is succesfully authenticated.
*/
const session = require('express-session');
const path = require('path');

const db = require('./dbInit');
const User = db.User;  // importing User model (User table from postgres)

// import routers
const userRouters = require('./routers/user.routers');
const userReviewRouters = require('./routers/userReview.routers');
const serviceRouters = require('./routers/service.routers');

const app = express();
/* 
CORS origin sets up from which domain our API accept requests (our front end domain for ex).
Credentials set to true since we are using passport and session to authenticate user's loggedin status.
When frontend sends FETCH requests to API, it needs to also set to include credentials in its fetch option.
 */
app.use(cors({ origin: process.env.DOMAIN, credentials: true, methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }));
db.initDB();  // check if db is connected
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// set up session
const sessionConfig = {
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { // cookie needs set a date it will expire
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));

// set up passport-local to authenticate users with username and password
// from here to passport.deserialize are functions based on passport-local's documentation on how to set up.
app.use(passport.initialize());  // initialize passport
app.use(passport.session());  // connect passport with express-session
passport.use(new LocalStrategy({
    // By default local strategy uses username and password for authentication.
    // Since our app uses email instead of username, we need to redefine that.
    usernameField: 'email', 
    passwordField: 'password'
},
    function verify(email, password, done) {
        User.findOne({ where: { email: email } }) //  this is a sequelize function to query our postgres database
            .then(user => {
                if (!user) return done(null, false, { message: 'Incorrect username or password.' });

                // crypto is used to encrypt password and add salt layers on top of hashed password for extra security
                crypto.pbkdf2(password, user.salt, 1000, 32, 'sha512', function (err, hashedPassword) {
                    if (err) return done(err);
                    if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
                        return done(null, false, { message: 'Incorrect username or password.' });
                    };
                    return done(null, user);
                });
            });
    }
));
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.findByPk(id).then(user => done(null, user));
});


app.use('/users', userRouters);
app.use('/users/:id/reviews', userReviewRouters);
app.use('/services', serviceRouters);
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// catch 404 and forward to error handler
app.all('*', (req, res, next) => {
    let err = new Error('Page Not Found');
    err.statusCode = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).json(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));