const mongoose = require('mongoose');
//const validators = require('validator');
const { Schema } = mongoose;
const Stream = require('./schemaTypes/streamSchemaType');
const UserVariables = require('./schemaTypes/userSchemaType');
const CalcVariables = require('./schemaTypes/calcSchemaType');

const storeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  calc_reducer: {
    user1: {
      type: CalcVariables,
      required: true,
    },
    user2: {
      type: CalcVariables,
      required: true,
    },
  },
  ui_reducer: {
    changeRateAssumptions: {
      type: Boolean,
      required: true,
    },
    changeRetirementAssumptions: {
      type: Boolean,
      required: true,
    },
    chartEndYear: {
      type: Number,
      required: true,
    },
    colorIndex: {
      type: Number,
      required: true,
    },
    dualSelectValue: {
      type: Boolean,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
    scenarios: {
      type: Map,
      required: true,
    },
    selectedAccount: {
      type: String,
      required: true,
    },
    selectedId: {
      type: String,
      required: true,
    },
    selectedPage: {
      type: String,
      required: true,
    },
    selectedScenario: {
      type: Number,
      required: true,
    },
    selectedUser: {
      type: String,
      required: true,
    },
    showTargetIncome: {
      type: Boolean,
      required: true,
    },
  },
  stream_reducer: { type: Map, of: Stream },
  user_reducer: {
    hasChildrenStatus: {
      type: String,
      //required: true,
    },
    inflationRate: {
      type: Number,
      required: true,
    },
    maritalStatus: {
      type: String,
      required: true,
    },
    mer: {
      type: Number,
      required: true,
    },
    numberOfChildren: {
      type: Number,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    r1: {
      type: Number,
      required: true,
    },
    r2: {
      type: Number,
      required: true,
    },
    rate1: {
      type: Number,
      //required: true,
    },
    rate2: {
      type: Number,
      //required: true,
    },
    retIncome: {
      type: Number,
      //required: true,
    },
    user1: UserVariables,
    user2: UserVariables,
  },
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;

/* ui_reducer: {
     colorIndex: {
       type: Number,
       required: true,
     },
     dualSelectValue: {
       type: String,
       required: true,
     },
     progress: {
       type: Number,
       required: true,
     },
     selectedAccount: {
       type: String,
       required: true,
     },
     selectedUser: {
       type: String,
       required: true,
     },
     selectedId: {
       type: String,
       required: true,
     },
     selectedPage: {
       type: String,
       required: true,
     },
     selectedScenario: {
       type: Number,
       required: true,
     },
     scenarios: {
       type: Number,
       required: true,
     },
   },
   user_reducer: {
     hasUnsecuredDebt: {
       type: Boolean,
       required: true,
     },
     hasChildrenStatus: {
       type: String,
       required: true,
     },
     inflationRate: {
       type: Number,
       required: true,
     },
     ownHome: {
       type: Boolean,
       required: true,
     },
     numberOfChildren: {
       type: Number,
       required: true,
     },
     province: {
       type: String,
       required: true,
     },
     user1: {
       birthYear1: {
         type: Number,
         required: true,
       },
       firstName1: {
         type: String,
         required: true,
       },
       hasChildren: {
         type: Boolean,
         required: true,
       },
       isMarried: {
         type: Boolean,
         required: true,
       },
       gender1: {
         type: String,
         required: true,
       },
     },
     user2: {
       birthYear2: {
         type: Number,
         //required: true,
       },
       firstName2: {
         type: String,
         //required: true,
       },
       gender2: {
         type: String,
         //required: true,
       },
     },
   },
   stream_reducer: { type: Map, of: Stream },*/
