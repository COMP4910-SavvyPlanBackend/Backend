const Store = require('../models/storeModel');
const User = require('../models/userModel');
const Stream = require('../models/schemaTypes/streamSchemaType');
const UserVariables = require('../models/schemaTypes/userSchemaType');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Post Stores
exports.postStore = catchAsync(async (req, res, next) => {

    req.body.user = req.user.id;
    const doc = await Store.create(req.body);
    const user = await User.findByIdAndUpdate(req.user.id,
        { ...req.body.user, storeID: doc.id });
    res.status(201).json({ status: "success", data: doc, user });
});

//Get All Stores by USer
exports.getAllStores = catchAsync(async (req, res, next) => {
    const store = await (await Store.find());

    if (!store) { return next(new AppError('No Stores Available', 400)); }

  return res.status(200).json(store);
});

//GET a Specific Store by Store ID
exports.getStore = catchAsync(async (req, res, next) => {
    const store = await Store.findById(req.params.id);

    if (!store) { return next(new AppError('No Stores Available', 400)); }

    return res.status(200).json(store);
});

//Update a Store
exports.updateStore = catchAsync(async (req, res, next) => {

    const doc = await Store.findByIdAndUpdate(req.user.storeID, { ...req.body });
    if (!doc) {
        return next(new AppError("No document found with that ID", 404));
    }
    doc.save();
    res.status(200).json({ status: "success", data: { data: doc, }, });

});

// Delete Store
exports.deleteStore = catchAsync(async (req, res, next) => {
  const store = await Store.findById(req.params.id);
  if (!store) {
    return new AppError('Store not found', 404);
  }

    await store.remove();

    res.status(200).json({ msg: 'Store Removed' });
});
