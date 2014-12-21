/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin 	/ http://mark-lundin.com
 * @author Pasi Keränen / pasi.keranen@theqtcompany.com
 */

THREE.TrackballControls = function ( object, controlEventSource ) {
    var _this = this;
    this._object = object;
    this._controlEventSource = controlEventSource;

    var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

    // API

    this.enabled = true;

    this.area = { left: 0, top: 0, width: 0, height: 0 };

    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.2;
    this.panSpeed = 0.3;

    this.noRotate = false;
    this.noZoom = false;
    this.noPan = false;
    this.noRoll = false;

    this.staticMoving = false;
    this.dynamicDampingFactor = 0.2;

    this.minDistance = 0;
    this.maxDistance = Infinity;

    this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

    // internals

    this.target = new THREE.Vector3();

    var EPS = 0.000001;

    var lastPosition = new THREE.Vector3();

    var _state = STATE.NONE,
            _prevState = STATE.NONE,
            _eye = new THREE.Vector3(),
            _rotateStart = new THREE.Vector3(),
            _rotateEnd = new THREE.Vector3(),
            _zoomStart = new THREE.Vector2(),
            _zoomEnd = new THREE.Vector2(),
            _touchZoomDistanceStart = 0,
            _touchZoomDistanceEnd = 0,
            _panStart = new THREE.Vector2(),
            _panEnd = new THREE.Vector2();

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this._object.position.clone();
    this.up0 = this._object.up.clone();

    // events

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start'};
    var endEvent = { type: 'end'};


    // methods

    this.handleResize = function () {

        _this.area.left = 0;
        _this.area.top = 0;
        _this.area.width = _this._controlEventSource.width;
        _this.area.height = _this._controlEventSource.height;

    };

    this.handleEvent = function ( event ) {

        if ( typeof this[ event.type ] == 'function' ) {

            this[ event.type ]( event );

        }

    };

    var getMouseOnArea = ( function () {

        var vector = new THREE.Vector2();
        return function ( pageX, pageY ) {
            vector.set(
                        ( pageX  ) / _this.area.width,
                        ( pageY ) / _this.area.height
                        );
            return vector;
        };

    }() );

    var getMouseProjectionOnBall = ( function () {
        var vector = new THREE.Vector3();
        var objectUp = new THREE.Vector3();
        var mouseOnBall = new THREE.Vector3();

        return function ( pageX, pageY ) {
            mouseOnBall.set(
                        ( pageX - _this.area.width * 0.5 ) / (_this.area.width*.5),
                        ( _this.area.height * 0.5 - pageY ) / (_this.area.height*.5),
                        0.0
                        );

            var length = mouseOnBall.length();
            if ( _this.noRoll ) {
                if ( length < Math.SQRT1_2 ) {
                    mouseOnBall.z = Math.sqrt( 1.0 - length*length );
                } else {
                    mouseOnBall.z = .5 / length;
                }
            } else if ( length > 1.0 ) {
                mouseOnBall.normalize();
            } else {
                mouseOnBall.z = Math.sqrt( 1.0 - length * length );
            }

            _eye.copy( _this._object.position ).sub( _this.target );

            vector.copy( _this._object.up ).setLength( mouseOnBall.y )
            vector.add( objectUp.copy( _this._object.up ).cross( _eye ).setLength( mouseOnBall.x ) );
            vector.add( _eye.setLength( mouseOnBall.z ) );

            return vector;
        };
    }() );

    this.rotateCamera = (function(){

        var axis = new THREE.Vector3(),
                quaternion = new THREE.Quaternion();

        return function () {
            var angle = Math.acos( _rotateStart.dot( _rotateEnd )
                                  / _rotateStart.length()
                                  / _rotateEnd.length() );
            if ( angle ) {
                axis.crossVectors( _rotateStart, _rotateEnd ).normalize();
                angle *= _this.rotateSpeed;
                quaternion.setFromAxisAngle( axis, -angle );
                _eye.applyQuaternion( quaternion );
                _this._object.up.applyQuaternion( quaternion );
                _rotateEnd.applyQuaternion( quaternion );
                if ( _this.staticMoving ) {
                    _rotateStart.copy( _rotateEnd );
                } else {
                    quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
                    _rotateStart.applyQuaternion( quaternion );
                }
            }
        }

    }());

    this.zoomCamera = function () {
        if ( _state === STATE.TOUCH_ZOOM_PAN ) {
            var factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
            _touchZoomDistanceStart = _touchZoomDistanceEnd;
            _eye.multiplyScalar( factor );
        } else {
            var factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;
            if ( factor !== 1.0 && factor > 0.0 ) {
                _eye.multiplyScalar( factor );
                if ( _this.staticMoving ) {
                    _zoomStart.copy( _zoomEnd );
                } else {
                    _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;
                }
            }
        }
    };

    this.panCamera = (function(){
        var mouseChange = new THREE.Vector2(),
                objectUp = new THREE.Vector3(),
                pan = new THREE.Vector3();

        return function () {
            mouseChange.copy( _panEnd ).sub( _panStart );
            if ( mouseChange.lengthSq() ) {
                mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );
                pan.copy( _eye ).cross( _this._object.up ).setLength( mouseChange.x );
                pan.add( objectUp.copy( _this._object.up ).setLength( mouseChange.y ) );
                _this._object.position.add( pan );
                _this.target.add( pan );
                if ( _this.staticMoving ) {
                    _panStart.copy( _panEnd );
                } else {
                    _panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );
                }
            }
        }
    }());

    this.checkDistances = function () {
        if ( !_this.noZoom || !_this.noPan ) {
            if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {
                _this._object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );
            }

            if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {
                _this._object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );
            }

        }

    };

    this.update = function () {
        _eye.subVectors( _this._object.position, _this.target );
        if ( !_this.noRotate ) {
            _this.rotateCamera();
        }

        if ( !_this.noZoom ) {
            _this.zoomCamera();
        }

        if ( !_this.noPan ) {
            _this.panCamera();
        }

        _this._object.position.addVectors( _this.target, _eye );
        _this.checkDistances();
        _this._object.lookAt( _this.target );

        if ( lastPosition.distanceToSquared( _this._object.position ) > EPS ) {
            _this.dispatchEvent( changeEvent );
            lastPosition.copy( _this._object.position );
        }
    };

    this.reset = function () {
        _state = STATE.NONE;
        _prevState = STATE.NONE;

        _this.target.copy( _this.target0 );
        _this._object.position.copy( _this.position0 );
        _this._object.up.copy( _this.up0 );

        _eye.subVectors( _this._object.position, _this.target );

        _this._object.lookAt( _this.target );

        _this.dispatchEvent( changeEvent );

        lastPosition.copy( _this._object.position );
    };

    // listeners

    function keydown( event ) {

        if ( _this.enabled === false ) return;

        _this._controlEventSource.removeEventListener( 'keydown', keydown );

        _prevState = _state;
        if ( _state !== STATE.NONE ) {
            return;
        } else if ( event.key === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {
            _state = STATE.ROTATE;
        } else if ( event.key === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {
            _state = STATE.ZOOM;
        } else if ( event.key === _this.keys[ STATE.PAN ] && !_this.noPan ) {
            _state = STATE.PAN;
        }
    }

    function keyup( event ) {
        if ( _this.enabled === false ) return;
        _state = _prevState;

        _this._controlEventSource.addEventListener( 'keydown', keydown, false );
    }

    function mousedown( x, y, buttons ) {

        if ( _this.enabled === false ) return;

        if ( _state === STATE.NONE ) {
            if (buttons & THREE.MOUSE.LEFT !== 0)
                _state = STATE.ROTATE;
            else if (buttons & THREE.MOUSE.MIDDLE !== 0)
                _state = STATE.ZOOM;
            else if (buttons & THREE.MOUSE.RIGHT !== 0)
                _state = STATE.PAN;
        }

        if ( _state === STATE.ROTATE && !_this.noRotate ) {
            _rotateStart.copy( getMouseProjectionOnBall( x, y ) );
            _rotateEnd.copy( _rotateStart );
        } else if ( _state === STATE.ZOOM && !_this.noZoom ) {
            _zoomStart.copy( getMouseOnArea( x, y ) );
            _zoomEnd.copy(_zoomStart);
        } else if ( _state === STATE.PAN && !_this.noPan ) {
            _panStart.copy( getMouseOnArea( x, y ) );
            _panEnd.copy(_panStart)
        }

        _this._controlEventSource.addEventListener( 'mousemove', mousemove, false );
        _this._controlEventSource.addEventListener( 'mouseup', mouseup, false );

        _this.dispatchEvent( startEvent );
    }

    function mousemove( x, y ) {

        if ( _this.enabled === false ) return;

        if ( _state === STATE.ROTATE && !_this.noRotate ) {

            _rotateEnd.copy( getMouseProjectionOnBall( x, y ) );

        } else if ( _state === STATE.ZOOM && !_this.noZoom ) {

            _zoomEnd.copy( getMouseOnArea( x, y ) );

        } else if ( _state === STATE.PAN && !_this.noPan ) {

            _panEnd.copy( getMouseOnArea( x, y ) );

        }

    }

    function mouseup( x, y ) {

        if ( _this.enabled === false ) return;

        _state = STATE.NONE;

        _this._controlEventSource.removeEventListener( 'mousemove', mousemove );
        _this._controlEventSource.removeEventListener( 'mouseup', mouseup );
        _this.dispatchEvent( endEvent );

    }

    function mousewheel( wheelDeltaX, wheelDeltaY ) {

        if ( _this.enabled === false || ( wheelDeltaX === 0 && wheelDeltaY === 0)) return;

        var delta = 0;

        if ( wheelDeltaY ) { // WebKit / Opera / Explorer 9

            delta = wheelDeltaY / 40;

        }

        _zoomStart.y += delta * 0.01;
        _this.dispatchEvent( startEvent );
        _this.dispatchEvent( endEvent );

    }

    function touchstart( touches ) {

        if ( _this.enabled === false ) return;

        switch ( touches.length ) {

        case 1:
            _state = STATE.TOUCH_ROTATE;
            _rotateStart.copy( getMouseProjectionOnBall( touches[ 0 ].pageX, touches[ 0 ].pageY ) );
            _rotateEnd.copy( _rotateStart );
            break;

        case 2:
            _state = STATE.TOUCH_ZOOM_PAN;
            var dx = touches[ 0 ].pageX - touches[ 1 ].pageX;
            var dy = touches[ 0 ].pageY - touches[ 1 ].pageY;
            _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

            var x = ( touches[ 0 ].pageX + touches[ 1 ].pageX ) / 2;
            var y = ( touches[ 0 ].pageY + touches[ 1 ].pageY ) / 2;
            _panStart.copy( getMouseOnArea( x, y ) );
            _panEnd.copy( _panStart );
            break;

        default:
            _state = STATE.NONE;

        }
        _this.dispatchEvent( startEvent );


    }

    function touchmove( touches ) {

        if ( _this.enabled === false ) return;

        event.preventDefault();
        event.stopPropagation();

        switch ( touches.length ) {

        case 1:
            _rotateEnd.copy( getMouseProjectionOnBall( touches[ 0 ].pageX, touches[ 0 ].pageY ) );
            break;

        case 2:
            var dx = touches[ 0 ].pageX - touches[ 1 ].pageX;
            var dy = touches[ 0 ].pageY - touches[ 1 ].pageY;
            _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

            var x = ( touches[ 0 ].pageX + touches[ 1 ].pageX ) / 2;
            var y = ( touches[ 0 ].pageY + touches[ 1 ].pageY ) / 2;
            _panEnd.copy( getMouseOnArea( x, y ) );
            break;

        default:
            _state = STATE.NONE;

        }

    }

    function touchend( touches ) {

        if ( _this.enabled === false ) return;

        switch ( touches.length ) {

        case 1:
            _rotateEnd.copy( getMouseProjectionOnBall( touches[ 0 ].pageX, touches[ 0 ].pageY ) );
            _rotateStart.copy( _rotateEnd );
            break;

        case 2:
            _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;

            var x = ( touches[ 0 ].pageX + touches[ 1 ].pageX ) / 2;
            var y = ( touches[ 0 ].pageY + touches[ 1 ].pageY ) / 2;
            _panEnd.copy( getMouseOnArea( x, y ) );
            _panStart.copy( _panEnd );
            break;

        }

        _state = STATE.NONE;
        _this.dispatchEvent( endEvent );

    }

    controlEventSource.widthChanged.connect( _this.handleResize );
    controlEventSource.heightChanged.connect( _this.handleResize );

    controlEventSource.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

    controlEventSource.addEventListener( 'mousedown', mousedown, false );

    controlEventSource.addEventListener( 'mousewheel', mousewheel, false );
    controlEventSource.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

    controlEventSource.addEventListener( 'touchstart', touchstart, false );
    controlEventSource.addEventListener( 'touchend', touchend, false );
    controlEventSource.addEventListener( 'touchmove', touchmove, false );

    controlEventSource.addEventListener( 'keydown', keydown, false );
    controlEventSource.addEventListener( 'keyup', keyup, false );

    this.handleResize();

    // force an update at start
    this.update();

};

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );

