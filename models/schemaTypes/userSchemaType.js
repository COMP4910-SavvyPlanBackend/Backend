const mongoose = require("mongoose");

const Schema = mongoose.Schema;

class UserVariables extends mongoose.SchemaType {
    constructor(key, options) {
        super(key, options, "UserVariables");
    }

    // `cast()` takes a parameter that can be anything. You need to
    // validate the provided `val` and throw a `CastError` if you
    // can't convert it.
    cast(userVariables) {
        if (typeof userVariables !== "object") {
            throw new Error("UserVariables: " + userVariables + " is not an object");
        }

        console.log(Object.values(userVariables).pop());

        if (!("birthYear" in userVariables)) throw new Error("UserVariables: " + userVariables + " is a Birth Year");
        if (typeof userVariables.birthYear !== "number")
            throw new Error("UserVariables: " + userVariables.birthYear + " birth year is not a number");

        if (!("cppStartAge" in userVariables)) throw new Error("UserVariables: " + userVariables + " is missing a cppStartAge");
        if (typeof userVariables.cppStartAge !== "number") throw new Error("UserVariables: " + userVariables.cppStartAge + " is not a number");

        if (!("firstName" in userVariables)) throw new Error("UserVariables: " + userVariables + " is missing first Name");
        if (typeof userVariables.firstName !== "number")
            throw new Error("UserVariables: " + userVariables.firstName + " firstName is not string");

        if (!("gender" in userVariables)) throw new Error("UserVariables: " + userVariables + " is missing gender");
        if (typeof userVariables.gender !== "number") throw new Error("UserVariables: " + userVariables.colorIndex + " gender is not string");

        if (!("lastName" in userVariables)) throw new Error("UserVariables: " + userVariables + " is missing lastName");
        if (typeof userVariables.lastName !== "number") throw new Error("UserVariables: " + userVariables.lastName + " lastName is not string");

        if (!("lifeSpan" in userVariables)) throw new Error("UserVariables: " + userVariables + " is missing a lifeSpan");
        if (typeof userVariables.lifeSpan !== "number") throw new Error("UserVariables: " + userVariables.lifeSpan + " is not a number");

        if (!("oasStartAge" in userVariables)) throw new Error("UserVariables: " + userVariables + " is missing a oasStartAge");
        if (typeof userVariables.oasStartAge !== "number") throw new Error("UserVariables: " + userVariables.oasStartAge + " is not a number");

        return userVariables;
    }
}

mongoose.Schema.Types.UserVariables = UserVariables;

//  birthYear: 1990,
//   cppStartAge: 65,
//   firstName: "",
//   gender: "female",
//   lastName: "",
//   lifeSpan: 95,
//   oasStartAge: 65,
