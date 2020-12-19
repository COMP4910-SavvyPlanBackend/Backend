const Store = require('../models/storeModel');
const User = require('../models/userModel');
const Stream = require('../models/schemaTypes/streamSchemaType');
const UserVariables = require('../models/schemaTypes/userSchemaType');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Post Stores
/** createStore
 * POST
 * Private
 * creates a new store in the stores collection
 * @param req.body contains a redux store
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @returns status, user data
 **/
exports.createStore = catchAsync(async (req, res, next) => {
  req.body.userId = req.user.id;
  const doc = await Store.create(req.body);
  const user = await User.findByIdAndUpdate(req.user.id, {
    ...req.body.userId,
    storeId: doc.id,
  });
  res.status(201).json({ status: 'success', user, data: doc });
});

//Get All Stores by User
/** getAllStores
 * Private
 * GET
 * @param req.user User to get stores of
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @returns status, all Stores of a user
 */
exports.getAllStores = catchAsync(async (req, res, next) => {
  const query = Store.find({ user: req.user.id });
  const doc = await query;
  if (!doc) {
    next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { doc } });
});

/** getStore
 * Private
 * GET
 * gets store by User's ID
 * @param req.user User to get Store of
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @returns status, requested store of a user by UserId
 */
//GET a Specific Store by Store ID
exports.getStore = catchAsync(async (req, res, next) => {
  const query = Store.findOne({ userId: req.user.id });
  const doc = await query;
  if (!doc) {
    next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { doc } });
});

//Update a Store
/** saveStore
 * Private
 * PATCH
 * @param req.user User to get
 * @param req.body redux store contents
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @returns status, new data
 */
exports.saveStore = catchAsync(async (req, res, next) => {
  const doc = await Store.findByIdAndUpdate(req.user.storeID, { ...req.body });
  if (!doc) {
    next(new AppError('No document found with that ID', 404));
  }
  doc.save();
  res.status(200).json({ status: 'success', data: { doc } });
});

// Delete Store
/** deleteStore
 * @param req.user User to delete
 * @param res Express Response object
 * @param next Express next() middleware in stack
 * @returns status, all Stores of a user
 */
exports.deleteStore = catchAsync(async (req, res, next) => {
  const store = await Store.findById(req.params.id);
  if (!store) {
    next(new AppError('Store not found', 404));
  }
  if (String(req.user._id) === String(store.user)) {
    await store.remove();

    res.status(201).json({
      status: 'success',
      data: null,
    });
  } else {
    next(new AppError('User is not authorized to delete this store', 403));
  }
});
