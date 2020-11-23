const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const Email = require('../utils/email');

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for password updates', 400));
  }
  const user = await User.findById(req.user._id);
  if (String(req.user._id) === String(user._id)) {
    //keep only name,email
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );
    if (req.body.email) {
      try {
        await new Email(user, URL).sendEmailChangeConfirmation();
        /* const message = `You have updated your email address to ${updatedUser.email}`;
        await sendEmail({
          email: updatedUser.email,
          subject: 'SavvyPlan Email changed',
          message: message,
        }); */
      } catch (err) {
        // TODO: make this part better as if error just doesn't email you
      }
    }
    // send response back
    res.status(200).json({
      status: 'success',
      data: { updatedUser },
    });
  } else {
    res.status(403).json({
      status: 'fail',
      message: 'User is not authorized to update this user',
    });
  }
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (String(req.user._id) === String(user._id)) {
    await User.findByIdAndUpdate(req.user._id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } else {
    res.status(403).json({
      status: 'fail',
      message: 'User is not authorized to delete this user',
    });
  }
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findOne(req.params.id);
  if (user) {
    res.status(200).json({ status: 'success', data: { user } });
  } else {
    res.status(404).json({ status: 'fail', message: 'User not found' });
  }
});
