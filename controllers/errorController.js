const AppError = require('../utils/appError');

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.log('placeholder');
  } else if (process.env.NODE_ENV === 'production') {
    const error = { ...err };
  }
};
