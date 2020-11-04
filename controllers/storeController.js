const Store = require('../models/storeModel');
const Stream = require('../models/schemaTypes/streamSchemaType');
const UserVariables = require('../models/schemaTypes/userSchemaType');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Post Stores
exports.postStore = catchAsync(async (req, res, next) => {
  const {
    colorIndex,
    dualSelectValue,
    newStream,
    progress,
    scenarios,
    selectedAccount,
    selectedId,
    selectedPage,
    selectedScenario,
    selectedUser,

    desiredRetirementIncome,
    hasChildrenStatus,
    inflationRate,
    maritalStatus,
    MER,
    numberOfChildren,
    province,
    rate1,
    rate2,
  } = req.body;

  const newUiReducer = {
    colorIndex,
    dualSelectValue,
    newStream,
    progress,
    scenarios,
    selectedAccount,
    selectedId,
    selectedPage,
    selectedScenario,
    selectedUser,
  };

  const newUserReducer = {
    desiredRetirementIncome,
    hasChildrenStatus,
    inflationRate,
    maritalStatus,
    MER,
    numberOfChildren,
    province,
    rate1,
    rate2,
  };

  /*birthYear1,
        firstName1,
        hasChildren,
        isMarried,
        gender1,

        birthYear2,
        firstName2,
        gender2*/

  try {
    const store = await Store.findOne({ user: req.user.id });

    store.ui_reducer.unshift(newUiReducer);
    store.user_reducer.unshift(newUserReducer);

    await store.save();

    res.json(store);
  } catch (err) {
    console.error(err.message);
    return new AppError(err.message, 500);
  }
});

//Get All Stores
exports.getAllStores = catchAsync(async (userId, res) => {
  try {
    const store = await Store.findOne({
      user: userId,
    }).populate('user', ['name']);

    if (!store) return new AppError('No Stores Available', 400);

    return res.json(store);
  } catch (err) {
    console.error(err.message);
    return new AppError(err.message, 500);
  }
});

exports.updateStore = catchAsync(async (req, res, next) => {
  const {
    colorIndex,
    dualSelectValue,
    newStream,
    progress,
    scenarios,
    selectedAccount,
    selectedId,
    selectedPage,
    selectedScenario,
    selectedUser,

    desiredRetirementIncome,
    hasChildrenStatus,
    inflationRate,
    maritalStatus,
    MER,
    numberOfChildren,
    province,
    rate1,
    rate2,
  } = req.body;

  const newUiReducer = {
    colorIndex,
    dualSelectValue,
    newStream,
    progress,
    scenarios,
    selectedAccount,
    selectedId,
    selectedPage,
    selectedScenario,
    selectedUser,
  };

  const newUserReducer = {
    desiredRetirementIncome,
    hasChildrenStatus,
    inflationRate,
    maritalStatus,
    MER,
    numberOfChildren,
    province,
    rate1,
    rate2,
  };

  try {
    const store = await Store.findOne({ user: req.user.id });

    store.ui_reducer.unshift(newUiReducer);
    store.user_reducer.unshift(newUserReducer);

    await store.save();

    res.json(store);
  } catch (err) {
    console.error(err.message);
    return new AppError(err.message, 500);
  }
});

// Delete Store
exports.deleteStore = catchAsync(async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return new AppError('Store not found', 404);
    }

    // Check user
    if (store.user.toString() !== req.user.id) {
      return new AppError('Store not found', 401);
    }

    await store.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    return new AppError(err.message, 500);
  }
});
