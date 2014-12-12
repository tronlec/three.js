//Uint8ClampedArray

function Int8Array(initValue) {
    var i;
    if (initValue instanceof Int8Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt8Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt8Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newInt8Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Int8Array.prototype = {
    constructor: Int8Array,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Int8Array) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },

    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;
        return ar;
    }
}

function Uint8Array(initValue) {
    var i;
    if (initValue instanceof Uint8Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint8Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint8Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newUint8Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Uint8Array.prototype = {
    constructor: Uint8Array,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Uint8Array) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },

    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;

        return ar;
    }
}

function Int16Array(initValue) {
    var i;
    if (initValue instanceof Int16Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt16Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt16Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newInt16Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Int16Array.prototype = {
    constructor: Int16Array,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Int16Array) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },

    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;

        return ar;
    }
}

function Uint16Array(initValue) {
    var i;
    if (initValue instanceof Uint16Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint16Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = iniValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint16Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = iniValue[i];
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newUint16Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Uint16Array.prototype = {
    constructor: Uint16Array,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Uint16Array) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },

    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;

        return ar;
    }
}

function Int32Array(initValue) {
    var i;
    if (initValue instanceof Int32Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newInt32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Int32Array.prototype = {
    constructor: Int32Array,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Int32Array) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },

    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;

        return ar;
    }
}

function Uint32Array(initValue) {
    var i;
    if (initValue instanceof Uint32Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newUint32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Uint32Array.prototype = {
    constructor: Uint32Array,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Uint32Array) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },

    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;

        return ar;
    }
}

function Float32Array(initValue) {
    var i;
    if (initValue instanceof Float32Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newFloat32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newFloat32Array(this._length);
        for (i = 0; i < this._length; i++) {
            this[i] = initValue[i];
        }
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newFloat32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Float32Array.prototype = {
    constructor: Float32Array,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Float32Array) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },

    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++) {
            ar.set(i, this[i]);
        }
        if (this.name !== undefined) {
            ar.name = this.name;
        }

        return ar;
    }
}

function Float64Array(initValue) {
    var i;
    if (initValue instanceof Float64Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newFloat64Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newFloat64Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newFloat64Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Float64Array.prototype = {
    constructor: Float64Array,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Float64Array) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },

    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++) {
            ar.set(i, this[i]);
        }
        if (this.name !== undefined) {
            ar.name = this.name;
        }

        return ar;
    }
}

function Int32Array(initValue) {
    var i;
    if (initValue instanceof Int32Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newInt32Array(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Int32Array.prototype = {
    constructor: Int32Array,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Int32Array) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },

    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;

        return ar;
    }
}

function Uint8ClampedArray(initValue) {
    var i;
    if (initValue instanceof Uint8ClampedArray) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint8ClampedArray(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint8ClampedArray(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = initValue[i];
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newUint8ClampedArray(this._length);
        for (i = 0; i < this._length; i++)
            this[i] = 0;
    }

    var _this = this;
    this.__defineGetter__("length", function(){
        return _this._length;
    });
}

Uint8ClampedArray.prototype = {
    constructor: Uint8ClampedArray,

    set: function( index, value ) {
        if (index instanceof Array || index instanceof Uint8ClampedArray) {
            for (var i = 0; i < this._length; i++)
                this[i] = index[i];
        } else {
            this[index] = value;
        }
    },

    get: function( index ) {
        return this[index];
    },
    print: function() {
        var values = "[ "
        for (var i = 0; i < this._length; i++) {
            values += this[i] + " ";
        };
        values += "]";
    },
    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;

        return ar;
    }
}
