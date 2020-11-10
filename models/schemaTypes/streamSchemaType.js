const mongoose = require('mongoose');

const Schema = mongoose.Schema;

class Stream extends mongoose.SchemaType {
    constructor(key, options) {
        super(key, options, 'Stream');
    }

    // `cast()` takes a parameter that can be anything. You need to
    // validate the provided `val` and throw a `CastError` if you
    // can't convert it.
    cast(stream) {

        if (typeof stream !== "object") {
            throw new Error('Stream: ' + stream + ' is not an object');
        }

        console.log(Object.values(stream).pop())

        if (!("amortization" in stream)) { stream.amortization = 0; } //throw new Error('Stream: ' + stream + ' is missing amortization');
        if (typeof stream.amortization !== 'number') throw new Error('Stream: ' + stream.amortization + ' amortization is not a number');

        if (!("colorIndex" in stream)) { stream.colorIndex = 0; }//throw new Error('Stream: ' + stream + ' is missing color index');
        if (typeof stream.colorIndex !== 'number') throw new Error('Stream: ' + stream.colorIndex + ' color is not a number');

        if (!("createdAt" in stream)) { stream.createdAt = 0; }//throw new Error('Stream: ' + stream + ' is missing createdAt key');
        if (typeof stream.createdAt !== 'number') throw new Error('Stream: ' + stream.createdAt + ' is not a date');

        if (!("currentValue" in stream)) { stream.currentValue = 0; } //throw new Error('Stream: ' + stream + ' is missing a currentValue');
        if (typeof stream.currentValue !== 'number') throw new Error('Stream: ' + stream.currentValue + ' is not a number');

        if (!("flow" in stream)) { stream.flow = ""; }//throw new Error('Stream: ' + stream + ' is missing flow');
        if (typeof stream.flow !== 'string') throw new Error('Stream: ' + stream.flow + ' is not a string');

        if (!("in" in stream)) { stream.in = null; }//throw new Error('Stream: ' + stream + ' is missing in');
        if (typeof stream.in !== 'object') throw new Error('Stream: ' + stream.in + ' is not aan object');

        if (!("id" in stream)) { stream.id = ""; }//throw new Error('Stream: ' + stream + ' is missing id');
        if (typeof stream.id !== 'string') throw new Error('Stream: ' + stream.id + ' is not an id');

        if (!("owner" in stream)) { stream.owner = ""; }//throw new Error('Stream: ' + stream + ' is missing owner');
        if (typeof stream.owner !== 'string') throw new Error('Stream: ' + stream.owner + ' is not a string');

        if (!("out" in stream)) { stream.out = null; }//throw new Error('Stream: ' + stream + ' is missing out option');
        if (typeof stream.out !== 'object') throw new Error('Stream: ' + stream.out + ' is not the out object');

        if (!("name" in stream)) { stream.name = ""; }//throw new Error('Stream: ' + stream + ' is missing a name');
        if (typeof stream.name !== 'string') throw new Error('Stream: ' + stream.name + ' name is not a string');

        if (!("payment" in stream)) { stream.payment = 0 }//throw new Error('Stream: ' + stream + ' is missing a payment');
        if (typeof stream.payment !== 'number') throw new Error('Stream: ' + stream.payment + ' payment is not a number');

        if (!("streamType" in stream)) { stream.streamtype = ""; }//throw new Error('Stream: ' + stream + ' is missing a streamType');
        if (typeof stream.streamType !== 'string') throw new Error('Stream: ' + stream.streamType + ' streamType is not a string');

        if (!("reg" in stream)) { stream.reg = ""; }//throw new Error('Stream: ' + stream + ' is missing a reg');
        if (typeof stream.reg !== 'string') throw new Error('Stream: ' + stream.reg + ' reg is not a string');

        if (!("taxable" in stream)) { stream.taxable = null; }//throw new Error('Stream: ' + stream + ' is missing a taxable');
        if (typeof stream.taxable !== 'boolean') throw new Error('Stream: ' + stream.taxable + ' taxable is not an boolean');

        if (!("scenarios" in stream)) { stream.scenarios = 0; }//throw new Error('Stream: ' + stream + ' is missing scenarios');
        if (typeof stream.scenarios !== 'number') throw new Error('Stream: ' + stream.scenarios + ' color is not a number');

        if (!("startYear" in stream)) { stream.startYear = 0; }//throw new Error('Stream: ' + stream + ' is missing startYear');
        if (typeof stream.startYear !== 'number') throw new Error('Stream: ' + stream.startYear + ' color is not a number');

        if (!("startValue" in stream)) { stream.startValue = 0; }//throw new Error('Stream: ' + stream + ' is missing startValue');
        if (typeof stream.startValue !== 'number') throw new Error('Stream: ' + stream.startValue + ' color is not a number');

        if (!("periodIn" in stream)) { stream.periodIn = 0; }//throw new Error('Stream: ' + stream + ' is missing periodIn');
        if (typeof stream.periodIn !== 'number') throw new Error('Stream: ' + stream.periodIn + ' color is not a number');

        if (!("periodOut" in stream)) { stream.periodOut = 0; }//throw new Error('Stream: ' + stream + ' is missing periodOut');
        if (typeof stream.periodOut !== 'number') throw new Error('Stream: ' + stream.periodOut + ' color is not a number');
        return stream;
    }
}

// Don't forget to add `Stream` to the type registry
mongoose.Schema.Types.Stream = Stream;