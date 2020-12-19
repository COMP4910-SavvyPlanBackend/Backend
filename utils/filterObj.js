/**
 * Public
 * utility function to filter undesirable fields out by whitelist allowedFields
 * @param {Object} obj
 * @param  {...any} allowedFields
 */
module.exports = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
