const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// we could split this file in two-three files oen with utils like signToken and the other advisor/client and rename login back
const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
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
    next(new AppError('You are not logged in, log in to get access', 401));
  }
  //verify and store JWT payload
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //check if user still exist
  const currentUser = await User.findById(decoded.id);
  // if user no longer exists
  if (!currentUser) {
    next(
      new AppError('the user belonging to this token no longer exists', 401)
    );
  }

  //check if password changed after token creation
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    next(new AppError('User recently changed password!, Login Again!', 401));
  }
  //grant access
  req.user = currentUser;
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

exports.signup = catchAsync(async (req, res, next) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    const error = new AppError('Email already in use.', 422);
    next(error);
  }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    companyName: req.body.companyName,
    companyType: req.body.companyType,
  });

  if (req.body.referralCode) {
    const advisorRes = await User.findOne({
      referralCode: req.body.referralCode,
    });
    if (advisorRes) {
      newUser.advisor = advisorRes._id;
      advisorRes.clients = advisorRes.clients.push(newUser._id);
      await advisorRes.save({ validateBeforeSave: false });
      await newUser.save({ validateBeforeSave: false });
    } // todo: warn if code is not found, error
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

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new AppError('Please provide email and password!', 400));
  }
  // add password to result as password is default not sent
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
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
  )}/api/users/resetPassword/${resetToken}`;
  //console.log(user);
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

    next(
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
    next(new AppError('token is invalid or expired!'), 400);
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
