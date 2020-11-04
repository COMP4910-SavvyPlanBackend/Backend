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
    res.status(500).send('Server Error');
  }
});

//Get All Stores
exports.getAllStores = catchAsync(async ({ params: { user_id } }, res) => {
  try {
    const store = await Store.findOne({
      user: user_id,
    }).populate('user', ['name']);

    if (!store) return res.status(400).json({ msg: 'Profile not found' });

    return res.json(store);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

exports.getStore = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.updateStore = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
    res.status(500).send('Server Error');
  }
});

// Delete Store
exports.deleteStore = catchAsync(async (req, res, next) => {
  try {
    const store = await Post.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }

    // Check user
    if (store.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await store.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});
