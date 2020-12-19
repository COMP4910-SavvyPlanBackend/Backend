const AppError = require('../utils/appError');

/** handleCastErrorDB
 * Handles casting errors
 * @param err
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
/** handleDuplicateFieldsDB
 * Handles and makes pretty duplicate field errors
 * @param err
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. please use a different value`;
  return new AppError(message, 400);
};
/** handleValidationErrorDB
 * Handles errors from mongoose related to Validating fields
 * @param  err
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
/** handleValidJWTError
 * if token is invalid, thi should be invoked
 */
const handleValidJWTError = () => {
  return new AppError('Invalid token. Please login again', 401);
};

/** handleJWTExpiredError
 *  Handles expired tokens
 */
const handleJWTExpiredError = () => {
  return new AppError('Your Token has expired! Please login again', 401);
};
/** handleMongoError
 * Handles and prints and error if MongoDB is having issues
 */
const handleMongoError = () => {
  return new AppError('MongoDB is having difficulties', 500);
};
/** sendErrorDev
 * Handles sending of Development mode errors
 * @param  err the Error in Question
 * @param  res Express Response object
 */
const sendErrorDev = (err, res) => {
  // full error for debug
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
/** sendErrorProd
 * Handles sending of Production mode errors, does not return stack etc
 * @param  err the Error in Question
 * @param  res Express Response object
 */
const sendErrorProd = (err, res) => {
  // we sent this error to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // programming or unknown error
  else {
    //console.error('ERROR: ', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong :(',
    });
  }
};
/**
 * is the function called for error controller, handles which function above to fire
 * @param  err Error object
 * @param  req Express Request
 * @param  res Express Response
 * @param  next  next middleware function
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV !== 'production') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleValidJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    if (error.name === 'MongoError') {
      error = handleMongoError();
    }
    sendErrorProd(error, res);
  }
};
