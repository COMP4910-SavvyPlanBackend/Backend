const Advisor = require('../models/advisorModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
// could move this function as well too a util

// name dont need to change as seperate files and routes
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for password updates', 400));
  }
  //keep only name,email
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedAdvisor = await Advisor.findByIdAndUpdate(
    req.body.user, // fine as there are a user really, look in protectAdvisor in auth for value setting
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  // send response back
  res.status(200).json({
    status: 'success',
    data: { updatedAdvisor },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Advisor.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
