/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ImageLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ImageLoader.prototype = {

	constructor: THREE.ImageLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

        if ( THREE.qmlImageLoader === undefined ) {
            console.log("THREE.qmlImageLoader not set, can't load images.")
            return null;
        }
        console.log("About to load ("+url+")");
        var image = THREE.qmlImageLoader.load (url);

		if ( onLoad !== undefined ) {

			image.addEventListener( 'load', function ( event ) {
                console.log("THREE.ImageLoader.load function ( event ) manager "+scope.manager);
                scope.manager.itemEnd( url );
				onLoad( this );

			}, false );

		}

		if ( onProgress !== undefined ) {

			image.addEventListener( 'progress', function ( event ) {

				onProgress( event );

			}, false );

		}

		if ( onError !== undefined ) {

			image.addEventListener( 'error', function ( event ) {

				onError( event );

			}, false );

		}

		if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;

		image.src = url;

        scope.manager.itemStart( url );

		return image;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

}
