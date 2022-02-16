if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
// import packages
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const session = require('express-session');
const path = require('path');
const ejsMate = require('ejs-mate');

const db = require('./dbInit');
const User = db.User;

// import routers
const userRouters = require('./routers/user.routers');
// const userReviewRouters = require('./routers/userReview.routers');
const serviceRouters = require('./routers/service.routers');

const app = express();
app.use(cors({ origin: process.env.DOMAIN, credentials: true, methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }));

db.initDB();  // check if db is connected
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// set up session
const sessionConfig = {
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));

// set up passport-local to authenticate users with username and password
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    function verify(email, password, done) {
        User.findOne({ where: { email: email } })
            .then(user => {
                if (!user) return done(null, false, { message: 'Incorrect username or password.' });

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
// app.use('/users/:id/reviews', userReviewRouters);
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