const mongoose = require('mongoose');

const dotenv = require('dotenv');
const Plan = require('../models/planModel');

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '../config.env' });
  }
//mongodb+srv://devUser:Arwy9igbRs5GtmHq@cluster0.eocq1.mongodb.net/savvydata?authSource=admin&replicaSet=atlas-124uhh-shard-0&readPreference=primary
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );
  
  mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }).then(() => {console.log('DB connection successful!'); importData()});
    //importData();

const plans = [
    {
        "name": "Plan1",
        "amount": 9999,
        "interval": "yearly",
        "currency": "USD",
        "summary": "A good plan",
        "planID": 1
    },
    {
    "name": "Plan2",
    "amount": 99999,
    "interval": "yearly",
    "currency": "CAD",
    "summary": "A better plan",
    "planID": 2
    
    }
];

const importData = async() =>{
    try{await Plan.create(plans);}
    catch(err){console.log(err)}
    exitFunct();
}



//Plan.create(plans);
function exitFunct(){
    mongoose.disconnect();
    process.exit();
}

