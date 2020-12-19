/**
 * Public
 * @param {function} fn a function to call wrapped in a error handler
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(err);
    });
  };
};
