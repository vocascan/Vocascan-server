const jwt = require('jsonwebtoken');

/**
 * Generate JSON Web Token
 * param needs user id for payload
 * @param {*} input jwt payload
 * @returns {String} signed jwt token
 */
function generateJWT(input) {
  return jwt.sign(input, process.env.JWT_SECRET);
}

/**
 * get JWT Token from request
 * @param {Express.Request} req request object
 * @returns {String} Bearer token
 */
function parseTokenUserId(req) {
  // Get token from Authorization header
  const token = req.header('Authorization').split(' ')[1];

  // Read userId from token
  const userId = new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) reject();
      resolve(decoded.id);
    });
  });

  return userId;
}

/**
 * Filter a object
 * @param {Object} object object to filter
 * @param {Function} predicate filter function
 * @returns {Object} filtered object
 */
const filterObject = (object, predicate) => Object.fromEntries(Object.entries(object).filter(predicate));

/**
 * Delete specific keys from object
 * @param {Array} keys Array of keys to delete
 * @param {Object} object object to delete specific keys
 * @returns {Object} new object
 */
const deleteKeysFromObject = (keys, object) => {
  return filterObject(object, ([key]) => !keys.includes(key));
};

/**
 * Round a number to a specific amount of digit points
 * @param {Number} x number to round
 * @param {Number} dp the amount of digit points to round
 * @returns {Number} rounded number
 */
const round = (x, dp = 2) => Math.round(x * 10 ** dp) / 10 ** dp;

/**
 * Zip arrays
 * See: https://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
 * @example
 *    zip([[1,2],[11,22],[111,222]])
 *    // returns [[1,11,111],[2,22,222]]]
 *
 * @param  {...Array} arrays arrays to zip
 * @returns {Array} zipped array
 */
const zip = (...arrays) => arrays[0].map((_, i) => arrays.map((array) => array[i]));

/**
 * Resolve all Promises in keys in an object
 * See: https://stackoverflow.com/questions/29292921/how-to-use-promise-all-with-an-object-as-input
 * @param {Object} obj object
 * @returns {Promise<Object>} promise with object
 */
const promiseAllValues = async (obj) =>
  Object.fromEntries(zip(Object.keys(obj), await Promise.all(Object.values(obj))));

/**
 * Shift date
 * @param {Date} date input date
 * @param {Number} numDays amount of days
 * @returns {Date} new date object
 */
const shiftDate = (date, numDays) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
};

/**
 * Calculate day difference between two dates
 * See: https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
 * @param {Date} date1 first date
 * @param {Date} date2 second date
 * @returns {Number}
 */
const dayDateDiff = (date1, date2) => {
  const timeDiff = date2.getTime() - date1.getTime();

  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Check if given date is today
 * @param {Date} date date to check
 * @returns {Boolean}
 */
const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

module.exports = {
  generateJWT,
  parseTokenUserId,
  filterObject,
  deleteKeysFromObject,
  round,
  zip,
  promiseAllValues,
  shiftDate,
  dayDateDiff,
  isToday,
};
