const mongoose = require('mongoose');

const Schema = mongoose.Schema;

class CalcVariables extends mongoose.SchemaType {
  constructor(key, options) {
    super(key, options, 'UserVariables');
  }

  // `cast()` takes a parameter that can be anything. You need to
  // validate the provided `val` and throw a `CastError` if you
  // can't convert it.
  cast(calcUserVariables) {
    if (typeof calcUserVariables !== 'object') {
      throw new Error(
        'UserVariables: ' + calcUserVariables + ' is not an object'
      );
    }

    console.log(Object.values(calcUserVariables).pop());

    if (!('avgIncome' in calcUserVariables))
      throw new Error(
        'UserVariables: ' + calcUserVariables + ' is not an average Income'
      );
    if (typeof calcUserVariables.avgIncome !== 'number')
      throw new Error(
        'UserVariables: ' +
          calcUserVariables.avgIncome +
          ' birth year is not a number'
      );

    if (!('cppPayment' in calcUserVariables))
      throw new Error(
        'UserVariables: ' + calcUserVariables + ' is missing a cppPayment'
      );
    if (typeof calcUserVariables.cppPayment !== 'number')
      throw new Error(
        'UserVariables: ' + calcUserVariables.cppPayment + ' is not a number'
      );

    if (!('nregInc' in calcUserVariables))
      throw new Error(
        'UserVariables: ' + calcUserVariables + ' is missing nregInce'
      );
    if (typeof calcUserVariables.nregInc !== 'number')
      throw new Error(
        'UserVariables: ' + calcUserVariables.nregInc + ' nregInc is not number'
      );

    if (!('nregNestEgg' in calcUserVariables))
      throw new Error(
        'UserVariables: ' + calcUserVariables + ' is missing nregNestEgg'
      );
    if (typeof calcUserVariables.nregNestEgg !== 'number')
      throw new Error(
        'UserVariables: ' +
          calcUserVariables.colorIndex +
          ' nregNestEgg is not number'
      );
    if (!('rrspInc' in calcUserVariables))
      throw new Error(
        'UserVariables: ' + calcUserVariables + ' is missing rrspInc'
      );
    if (typeof calcUserVariables.rrspInc !== 'number')
      throw new Error(
        'UserVariables: ' +
          calcUserVariables.colorIndex +
          ' rrspInc is not number'
      );
    if (!('rrspNestEgg' in calcUserVariables))
      throw new Error(
        'UserVariables: ' + calcUserVariables + ' is missing rrspNestEgg'
      );
    if (typeof calcUserVariables.rrspNestEgg !== 'number')
      throw new Error(
        'UserVariables: ' +
          calcUserVariables.colorIndex +
          ' rrspNestEgg is not number'
      );
    if (!('tfsaInc' in calcUserVariables))
      throw new Error(
        'UserVariables: ' + calcUserVariables + ' is missing tfsaInc'
      );
    if (typeof calcUserVariables.tfsaInc !== 'number')
      throw new Error(
        'UserVariables: ' +
          calcUserVariables.colorIndex +
          ' tfsaInc is not number'
      );
    if (!('tfsaNestEgg' in calcUserVariables))
      throw new Error(
        'UserVariables: ' + calcUserVariables + ' is missing tfsaNestEgg'
      );
    if (typeof calcUserVariables.tfsaNestEgg !== 'number')
      throw new Error(
        'UserVariables: ' +
          calcUserVariables.colorIndex +
          ' tfsaNestEgg is not number'
      );

    return calcUserVariables;
  }
}

mongoose.Schema.Types.CalcVariables = CalcVariables;

//  birthYear: 1990,
//   cppStartAge: 65,
//   firstName: "",
//   gender: "female",
//   lastName: "",
//   lifeSpan: 95,
//   oasStartAge: 65,
