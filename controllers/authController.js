const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Advisor = require('../models/advisorModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// we could split this file in two-three files oen with utils like signToken and the other advisor/client and rename login back
const signToken = (id, type) => {
  return jwt.sign(
    {
      id,
      type,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const type = user.constructor.modelName;
  const token = signToken(user._id, type);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // ensure format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // split bearer part off
    //console.log(req.header);
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in, log in to get access', 401)
    );
  }
  //verify and store
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //check if user still exist
  let currentUser;
  if (decoded.type === 'User') {
    currentUser = await User.findById(decoded.id);
  } else if (decoded.type === 'Advisor') {
    currentUser = await Advisor.findById(decoded.id);
  }
  // if user no longer exists
  if (!currentUser) {
    next(
      new AppError('the user belonging to this token no longer exists', 401)
    );
  }

  //check if password changed after token creation
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password!, Login Again!', 401)
    );
  }
  //grant access
  req.user = currentUser;
  req.userType = decoded.type;
  next();
});

// this one is sus as this depends on ben interaction
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.signupUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  if (req.body.referralCode) {
    const advisorRes = await Advisor.findOne({
      referralCode: req.body.referralCode,
    });
    if (advisorRes) {
      // todo: fix user not gettting advisor properly
      newUser.advisor = advisorRes._id;
      advisorRes.clients = advisorRes.clients.push(newUser._id);
      await advisorRes.save({ validateBeforeSave: false });
      await newUser.save({ validateBeforeSave: false });
    }
  }

  //const message = `Welcome to Savvy Plan the Financial Advising platform!`;
  const url = '';
  try {
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
  } catch (err) {
    // todo make this part better as if error just doesn't email you
    createSendToken(newUser, 201, res);
  }
});
// not passing a company here, should do that
exports.signupAdvisor = catchAsync(async (req, res, next) => {
  const newAdvisor = await Advisor.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    companyName: req.body.companyName,
    companyType: req.body.companyType,
  });

  //const message = `Welcome to Savvy Plan the Financial Advising platform!`;
  const url = '';
  try {
    await new Email(newAdvisor, url).sendWelcome();
    createSendToken(newAdvisor, 201, res);
  } catch (err) {
    // todo make this part better as if error just doesn't email you
    createSendToken(newAdvisor, 201, res);
  }
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // add password to result as password is default not sent
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});

exports.loginAdvisor = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // add password to result as password is default not sent
  const advisor = await Advisor.findOne({ email }).select('+password');
  if (
    !advisor ||
    !(await advisor.correctPassword(password, advisor.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(advisor, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  //console.log(user);
  if (!user) {
    next(new AppError('No User at that Email Address'), 404);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  //const message = `Forgot your password? Send a Patch request with your new password and passwordConfirm to ${resetURL}.
  //If you didn't forget your password, please ignore this email.`;
  try {
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email address',
    });
  } catch (err) {
    //console.error(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again later'
      ),
      500
    );
  }
});

exports.forgotPasswordAdvisor = catchAsync(async (req, res, next) => {
  const advisor = await Advisor.findOne({ email: req.body.email });
  //console.log(user);
  if (!advisor) {
    next(new AppError('No User at that Email Address'), 404);
  }

  const resetToken = advisor.createPasswordResetToken();
  await advisor.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPasswordAdvisor/${resetToken}`;

  //const message = `Forgot your password? Send a Patch request with your new password and passwordConfirm to ${resetURL}.
  //If you didn't forget your password, please ignore this email.`;

  try {
    await new Email(advisor, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email address',
    });
  } catch (err) {
    //console.log(err);
    advisor.passwordResetToken = undefined;
    advisor.passwordResetExpires = undefined;
    await advisor.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again later'
      ),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //check if token expired and user exists
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('token is invalid or expired!'), 400);
  }
  //set password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  //update db with last updated time

  await user.save();
  //const message =
  //'Password Reset Completed!, if this was not you please secure your account.';
  const url = '';
  try {
    await new Email(user, url).sendResetConfirmation();
    //login user, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    // todo make this part better as if error just doesn't email you
    createSendToken(user, 201, res);
  }
});

exports.resetPasswordAdvisor = catchAsync(async (req, res, next) => {
  //get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //check if token expired and user exists
  const advisor = await Advisor.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!advisor) {
    return next(new AppError('token is invalid or expired!'), 400);
  }
  //set password
  advisor.password = req.body.password;
  advisor.passwordConfirm = req.body.passwordConfirm;
  advisor.passwordResetToken = undefined;
  advisor.passwordResetExpires = undefined;
  //update db with last updated time

  await advisor.save();
  //const message =
  //'Password Reset Completed!, if this was not you please secure your account.';
  const url = '';
  try {
    await new Email(advisor, url).sendResetConfirmation();
    //login user, send JWT
    createSendToken(advisor, 200, res);
  } catch (err) {
    // todo make this part better as if error just doesn't email you
    createSendToken(advisor, 201, res);
  }
});
