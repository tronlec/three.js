function Uint16Array(initValue) {
    if (initValue instanceof Uint16Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint16Array(initValue);
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint16Array(initValue);
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newUint16Array(initValue);
    }
}

Uint16Array.prototype = {
    constructor: Uint16Array,

    set: function( array ) {
        if (array instanceof Uint16Array) {
            for (var i; i < this._length; i++) {
                this[i] = array.get(i);
            }

        } else if (array instanceof Array) {
            for (var j = 0; j < this._length; j++) {
                this[j] = array[j];
            }
        }
    },

    set: function( index, value ) {
        this[index] = value;
    },

    get: function( index ) {
        return this[index];
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;
        //this._internalArray.set(this);
        return ar;
    }
}

function Uint8Array(initValue) {
    if (initValue instanceof Uint8Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint8Array(initValue);
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newUint8Array(initValue);
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newUint8Array(initValue);
    }
}

Uint8Array.prototype = {
    constructor: Uint8Array,

    set: function( array ) {
        if (array instanceof Uint8Array) {
            for (var i; i < this._length; i++) {
                this[i] = array.get(i);
            }

        } else if (array instanceof Array) {
            for (var j = 0; j < this._length; j++) {
                this[j] = array[j];
            }
        }
    },

    set: function( index, value ) {
        this[index] = value;
    },

    get: function( index ) {
        return this[index];
    },

    typedArray: function() {
        var ar = this._internalArray;
        for (var i = 0; i < this._length; i++)
            ar.set(i, this[i]);
        if (this.name !== undefined)
            ar.name = this.name;

        //this._internalArray.set(this);
        return ar;
    }
}

function Float32Array(initValue) {
    if (initValue instanceof Float32Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newFloat32Array(initValue);
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newFloat32Array(initValue);
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newFloat32Array(this._length);
    }
}

Float32Array.prototype = {
    constructor: Float32Array,

    set: function( array ) {
        if (array instanceof Float32Array) {
            for (var i; i < this._length; i++) {
                this[i] = array.get(i);
            }

        } else if (array instanceof Array) {
            for (var j = 0; j < this._length; j++) {
                this[j] = array[j];
            }
        }
    },

    set: function( index, value ) {
        this[index] = value;
    },

    get: function( index ) {
        return this[index];
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
    if (initValue instanceof Int32Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt32Array(initValue);
    } else if (initValue instanceof Array) {
        this._length = initValue.length;
        this._internalArray = Arrays.newInt32Array(initValue);
    } else {
        this._length = initValue;
        this._internalArray = Arrays.newInt32Array(this._length);
    }
}

Int32Array.prototype = {
    constructor: Int32Array,

    set: function( array ) {
        if (array instanceof Int32Array) {
            for (var i; i < this._length; i++) {
                this[i] = array.get(i);
            }

        } else if (array instanceof Array) {
            for (var j = 0; j < this._length; j++) {
                this[j] = array[j];
            }
        }
    },

    set: function( index, value ) {
        this[index] = value;
    },

    get: function( index ) {
        return this[index];
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
console.log("QmlWrappers DONE");
