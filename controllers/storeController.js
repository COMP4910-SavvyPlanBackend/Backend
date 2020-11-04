const Store = require('./../models/storeModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.postStore = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        colorIndex,
        dualSelectValue,
        progress,
        selectedAccount,
        selectedUser,
        selectedId,
        selectedPage,
        selectedScenario,
        scenarios,

        hasUnsecuredDebt,
        hasChildrenStatus,
        inflationRate,
        ownHome,
        numberOfChildren,
        province,

        birthYear1,
        firstName1,
        hasChildren,
        isMarried,
        gender1,

        birthYear2,
        firstName2,
        gender2
    } = req.body;

    const newStore = {
        colorIndex,
        dualSelectValue,
        progress,
        selectedAccount,
        selectedUser,
        selectedId,
        selectedPage,
        selectedScenario,
        scenarios,

        hasUnsecuredDebt,
        hasChildrenStatus,
        inflationRate,
        ownHome,
        numberOfChildren,
        province,

        birthYear1,
        firstName1,
        hasChildren,
        isMarried,
        gender1,

        birthYear2,
        firstName2,
        gender2
    };

    try {
        let store = await Store.findOne(
            { _id: req.user._id },
            { $set: newStore },
            { new: true, upset: true, setDefaultOnInsert: true });

        res.json(store);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

exports.getAllStores = catchAsync(async (req, res, next) => {
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
            tours
        }
    });
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
            tours
        }
    });
});

exports.updateStore = catchAsync(async (req, res, next) => {
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
            tours
        }
    });
});

exports.deleteStore = catchAsync(async (req, res, next) => {
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
            tours
        }
    });
});


