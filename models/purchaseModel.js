const mongoose = require('mongoose');

const { Schema } = mongoose;

const purchaseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A purchase must belong to a User!']
      },
      plan: {
        type: Schema.Types.ObjectId,
        ref: 'Plan',
        required: [true, 'A purchase must belong to a Plan!']
      },
      price:{
          type: Number,
          require: [true,'Purchase must have a price']
      },
      createdAt:{
          type: Date,
          default: Date.now()
      },
      paid:{
          type: Boolean,
          default: true
      }
});

purchaseSchema.pre('find', function(next){
    this.populate('User').populate({
        path: 'Plan',
        select: 'name'
    });
    next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;