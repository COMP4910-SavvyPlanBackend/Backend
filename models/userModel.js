const crypto = require('crypto');
const mongoose = require('mongoose');
const validators = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String }, // WARN to BEN: This is needed for Email code to work
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validators.isEmail, 'Please provide a valid email'],
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
  role: {
    type: String,
    enum: ['Client', 'Advisor'],
    required: [
      true,
      'A role is required, please supply either Client or Advisor',
    ],
  },
  advisor: { type: Schema.Types.ObjectId, ref: 'User' },
  storeID: { type: Schema.Types.ObjectId, ref: 'StoreID' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  stripeCustomerId:{type: String},
  // potential option
  companyName: {
    type: String,
  },
  companyType: {
    type: String,
    enum: ['Independent', 'Institution'],
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // password change time setter, skipped if not modified or new user
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
// populate the clients advisor into the find
userSchema.pre('find', function (next) {
  if (this.advisor) {
    this.populate('advisor');
    next();
  }
  next();
});
// method to check if matching password hashes
// candidate recieved from client, user from a user document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //console.log(candidatePassword, userPassword);
  return await bcrypt.compare(candidatePassword, userPassword);
};
// used for checking validity of JWT, if password changed after JWT was signed succeed and resign
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
// cryptographically create reset token for password reset
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
//generate ref code
userSchema.pre('save', function (next) {
  //technically a error could occur if two codes are generated to the same.
  //error is not being dealt with if that occurs here.
  if (this.isNew) {
    this.referralCode = crypto.randomBytes(8).toString('hex');
    next();
  }
  next();
});
// populate clients on find
userSchema.pre('find', function (next) {
  if (this.clients && this.role === 'Advisor') {
    this.populate('clients');
    next();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
