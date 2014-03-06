/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ImageLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ImageLoader.prototype = {

	constructor: THREE.ImageLoader,

	load: function ( url, onLoad, onProgress, onError ) {
        console.log("THREE.ImageLoader.prototype.load")
		var scope = this;
		var image = document.createElement( 'img' );
        console.log("ImageLoader.load image created");

		if ( onLoad !== undefined ) {

			image.addEventListener( 'load', function ( event ) {
                console.log("THREE.ImageLoader.load.onload" + event.constructor.name + " this:"+this.constructor.name);
                console.log("scope.manager.itemEnd( url );");
                scope.manager.itemEnd( url );
                console.log("onLoad( this );");
                onLoad( this );
                console.log("done;");
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

        console.log("ImageLoader.load this.crossOrigin");
        if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;

        console.log("ImageLoader.load image.src");
        image.src = url;

        console.log("ImageLoader.load scope.manager.itemStart");
        scope.manager.itemStart( url );
        console.log("ImageLoader.load exit");
		return image;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

}
