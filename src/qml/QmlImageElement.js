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
    // Setup mapping between the native QObject image and this image
    var _self = this;

    _self.crossOrigin = undefined;
    _self._src = undefined;
    _self._onSuccessCallback  = undefined;
    _self._onProgressCallback = undefined;
    _self._onErrorCallback    = undefined;
    _self._width  = 0;
    _self._height = 0;
    _self._texImage = undefined;


    _self.__defineGetter__("src", function(){
        return _self._src;
    });

    _self.__defineSetter__("src", function(url){
        if (url && url !== '' && url !== _self._src) {
            _self._texImage = textureImageLoader.loadTexture(url);
            _self._texImage.name = url;
            __texImageToImageMap[""+_self._texImage.id()] = _self;
        }
        _self._src = url;
    });

    _self.__defineGetter__("width", function(){
        return (_self._texImage !== undefined)?_self._texImage.width:0;
    });

    _self.__defineSetter__("width", function(url){
        console.log("TODO: Implement image resize");
    });

    _self.__defineGetter__("height", function(){
        return (_self._texImage !== undefined)?_self._texImage.height:0;
    });

    _self.__defineSetter__("height", function(url){
        console.log("TODO: Implement image resize");
    });
};

Image.prototype = {
    constructor: Image,

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
