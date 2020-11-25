const Advisor = require('../models/advisorModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const Email = require('../utils/email');
// could move this function as well too a util

// name dont need to change as seperate files and routes
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('this route is not for password updates', 400));
  }
  //keep only name,email
  //console.log(req.user);
  const user = await Advisor.findById(req.user._id);
  if (String(req.user._id) === String(user._id)) {
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedAdvisor = await Advisor.findByIdAndUpdate(
      req.user._id, // fine as there are a user really, look in protectAdvisor in auth for value setting
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );
    if (req.body.email) {
      try {
        await new Email(user, URL).sendEmailChangeConfirmation();
        /* const message = `You have updated your email address to ${updatedAdvisor.email}`;
        await sendEmail({
          email: updatedAdvisor.email,
          subject: 'SavvyPlan Email changed',
          message: message,
        }); */
      } catch (err) {
        // todo make this part better as if error just doesn't email you
      }
      // send response back
      res.status(200).json({
        status: 'success',
        data: { updatedAdvisor },
      });
    }
  } else {
    res.status(403).json({
      status: 'fail',
      message: 'User is not authorized to update this user',
    });
  }
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await Advisor.findById(req.user.id);
  if (String(req.user._id) === String(user._id)) {
    await Advisor.findByIdAndUpdate(req.user._id, { active: false });

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

exports.getAdvisorById = catchAsync(async (req, res, next) => {
  const user = await Advisor.findOne(req.params.id);
  if (user) {
    res.status(200).json({ status: 'success', data: { user } });
  } else {
    res.status(404).json({ status: 'fail', message: 'User not found' });
  }
});
