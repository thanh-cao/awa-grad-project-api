// utility to wrap async functions in try/catch blocks to handle errors in express
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};