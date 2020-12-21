/** AppError
 * @class AppError @extends Error
 * @exports appError
 */
class appError extends Error {
  /**
   * @constructor
   * @param message error message to send
   * @param statusCode HTTP status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = appError;
