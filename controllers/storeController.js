const Store = require('../models/storeModel');
const User = require('../models/userModel');
const Stream = require('../models/schemaTypes/streamSchemaType');
const UserVariables = require('../models/schemaTypes/userSchemaType');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Post Stores
exports.postStore = catchAsync(async (req, res, next) => {

    user = await User.findById(req.user.id).select('-password');
    const {
        // num
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
        user: req.user.id,
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

    const store = new Store({
        user: req.user.id,
    });


    /*
           ui_reducer: [{
               colorIndex: req.body.colorIndex,
               dualSelectValue: req.body.dualSelectValue,
               newStream: req.body.newStream,
               progress: req.body.progress,
               scenarios: req.body.scenarios,
               selectedAccount: req.body.selectedAccount,
               selectedId: req.body.selectedId,
               selectedPage: req.body.selectedPage,
               selectedScenario: req.body.selectedScenario,
               selectedUser: req.body.selectedUser,
           }],
   
           user_reducer: [{
               desiredRetirementIncome: req.body.desiredRetirementIncome,
               hasChildrenStatus: req.body.hasChildrenStatus,
               inflationRate: req.body.inflationRate,
               maritalStatus: req.body.maritalStatu,
               MER: req.body.MER,
               numberOfChildren: req.body.numberOfChildren,
               province: req.body.province,
               rate1: req.body.rate1,
               rate2: req.body.rate2,
           }]
      });*/


    /*birthYear1,
          firstName1,
          hasChildren,
          isMarried,
          gender1,
          birthYear2,
          firstName2,
          gender2*/




    //const store = new Store();
    //store.user = req.user.id;
    //const store = await Store.findOne({ user: req.user.id });
    store.ui_reducer.unshift(newUiReducer);
    store.user_reducer.unshift(newUserReducer);

    //const store = 
    await store.save();


    res.status(201).json(store);
});

//Get All Stores
exports.getAllStores = catchAsync(async (userId, res, next) => {
  const store = await Store.findOne({
    user: userId,
  }).populate('user', ['name']);

  if (!store) return new AppError('No Stores Available', 400);

  return res.status(200).json(store);
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

  const store = await Store.findOne({ user: req.user.id });
  if (store) {
    store.ui_reducer.unshift(newUiReducer);
    store.user_reducer.unshift(newUserReducer);

    await store.save();

    res.status(200).json(store);
  } else {
    return next(new AppError("Store doesn't exist for user", 404));
  }
});

// Delete Store
exports.deleteStore = catchAsync(async (req, res, next) => {
  const store = await Store.findById(req.params.id);
  if (!store) {
    return new AppError('Store not found', 404);
  }

  // Check user
  if (store.user.toString() !== req.user.id) {
    return next(new AppError('Store not found', 401));
  }

  await store.remove();

  res.status(200).json({ msg: 'Post removed' });
});
