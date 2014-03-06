var __texImageToImageMap = {};

function textureLoaded(texImage) {
    var target = __texImageToImageMap[""+texImage.id()];
    if (target)
        target.notifySuccess(texImage);
}

function textureLoadError(texImage) {
    var target = __texImageToImageMap[""+texImage.id()];
    if (target)
        target.notifyError(texImage);
}

function Image () {
    this.crossOrigin = undefined;
    this._src = undefined;
    this._onSuccessCallback  = undefined;
    this._onProgressCallback = undefined;
    this._onErrorCallback    = undefined;
    this._width  = 0;
    this._height = 0;

    // Setup mapping between the native QObject image and this image
    var _this = this;

    this.__defineGetter__("src", function(){
        return this._src;
    });

    this.__defineSetter__("src", function(url){
        this._src = url;
        if (this._src && this._src !== '') {
            this._texImage = textureImageLoader.loadTexture(this._src);
            __texImageToImageMap[""+this._texImage.id()] = _this;
        }
    });
};

Image.prototype = {
    constructor: Image,

    get width() {
        return this._width;
    },

    set width(value) {
        console.log("TODO: Implement image resize");
    },

    get height() {
        return this._height;
    },

    set height(value) {
        console.log("TODO: Implement image resize");
    },

    addEventListener: function( eventName, callback, flag ) {
        if (eventName === 'load') {
            this._onSuccessCallback = callback;
        } else if (eventName === 'progress') {
            this._onProgressCallback = callback;
        } else if (eventName === 'error') {
            this._onErrorCallback = callback;
        }
    },

    notifySuccess: function(image) {
        if (this._onSuccessCallback !== undefined) {
            this._onSuccessCallback(new Event());
        }
    },

    notifyProgress: function(image) {
        if (this._onProgressCallback !== undefined) {
            this._onProgressCallback(new Event());
        }
    },

    notifyError: function(image) {
        console.log("Image.notifyError()");
        if (this._onErrorCallback !== undefined) {
            this._onErrorCallback(new Event());
        }
    },

    texImage: function() {
        return this._texImage;
    },

    data: function() {
        console.error("Image.data not implemented!");
    }
};

// TODO: Support for resizing:
//where.image.width = width;
//where.image.height = height;
//where.image.getContext( '2d' ).drawImage( this, 0, 0, width, height );
