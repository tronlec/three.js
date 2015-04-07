/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.XHRLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.XHRLoader.prototype = {

	constructor: THREE.XHRLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var cached = THREE.Cache.get( url );

		if ( cached !== undefined ) {

			if ( onLoad ) onLoad( cached );
			return;

		}

        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
                if (request.readyState === XMLHttpRequest.DONE) {
                    if (request.status == 200) {
                        THREE.Cache.add( url, request.responseText );
                        if ( onLoad ) onLoad( request.responseText );
                        scope.manager.itemEnd( url );
                    } else {
                        if ( onError !== undefined ) {
                            onError();
                        }
                    }
                } else if (request.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
                    if ( onProgress !== undefined ) {
                        onProgress();
                    }
                }
            };

		request.open( 'GET', url, true );

		if ( this.crossOrigin !== undefined ) request.crossOrigin = this.crossOrigin;
		if ( this.responseType !== undefined ) request.responseType = this.responseType;

		request.send( null );

		scope.manager.itemStart( url );

	},

	setResponseType: function ( value ) {

		this.responseType = value;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

};
