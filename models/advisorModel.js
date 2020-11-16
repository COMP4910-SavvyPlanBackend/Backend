const crypto = require('crypto');
const mongoose = require('mongoose');
const validators = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;
//data model
const advisorSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validators.isEmail, 'Please provide a valid email'],
  },
  // potential option
  companyName: {
    type: String,
  },
  companyType: {
    type: String,
    enum: ['Independent', 'Institution'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // only on SAVE hook
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  referralCode: {
    type: String,
    unique: true,
  },
  clients: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//methods and middleware
//Middleware layer
//encrypt password when recieved
advisorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
//create password last change updates
advisorSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//gen Advisor Code
advisorSchema.pre('save', function (next) {
  //technically a error could occur if two codes are generated to the same.
  //error is not being dealt with if that occurs here.
  if (this.isNew) {
    this.referralCode = crypto.randomBytes(8).toString('hex');
    next();
  }
  next();
});
// populate clients on find
advisorSchema.pre('find', function (next) {
  this.populate('clients');
  next();
});
//Methods
//check if password is correct
advisorSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //console.log(candidatePassword, userPassword);
  return await bcrypt.compare(candidatePassword, userPassword);
};
//
advisorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //check if field exists
  if (this.passwordChangedAt) {
    // convert time to ms
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
//create a reset token using crypto
advisorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //set reset token expiry
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
//compile model
const Advisor = mongoose.model('Advisor', advisorSchema);

module.exports = Advisor;
