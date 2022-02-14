if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
// import packages
const express = require('express');
const cors = require('cors');

const db = require('./dbInit');

const app = express();
db.initDB();  // check if db is connected
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: process.env.DOMAIN, credentials: true, methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }));

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