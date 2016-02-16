/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.XHRLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.XHRLoader.prototype = {

	constructor: THREE.XHRLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		if ( this.path !== undefined ) url = this.path + url;

		var scope = this;

		var cached = THREE.Cache.get( url );

		if ( cached !== undefined ) {

			if ( onLoad ) {

                // setTimeout doesn't work in QML.
                // There should be no need to do this asynchronously anyway,
                // as we add the url to cache after the loading is done.
                //setTimeout( function () {

					onLoad( cached );

                //}, 0 );

			}

			return cached;

		}

        var request = new XMLHttpRequest();
        //request.overrideMimeType( 'text/plain' ); // Not supported in QML
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status == 200 || request.status == 0) {
                    var response;
                    response = request.response;
                    if ( onLoad ) onLoad( response );
                    THREE.Cache.add( url, response );
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

        if ( this.responseType !== undefined ) request.responseType = this.responseType;
		if ( this.withCredentials !== undefined ) request.withCredentials = this.withCredentials;

		request.send( null );

		scope.manager.itemStart( url );

		return request;

	},

	setPath: function ( value ) {

		this.path = value;

	},

	setResponseType: function ( value ) {

		this.responseType = value;

	},

	setWithCredentials: function ( value ) {

		this.withCredentials = value;

	}

};
