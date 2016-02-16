/**
 * @author Michael Guerrero / http://realitymeltdown.com
 */

THREE.BlendCharacter = function () {

    this.weightSchedule = [];
    this.warpSchedule = [];

    this.load = function ( url, onLoad ) {

        var scope = this;

        var loader = new THREE.JSONLoader();
        loader.load( url, function( geometry, materials ) {
            console.log("THREE.BlendCharacter.load.loader done loading");
            console.log("  geometry "+geometry);
            console.log("  material[0] "+materials[0]);

            var originalMaterial = materials[ 0 ];
            originalMaterial.skinning = true;

            console.log("  THREE.SkinnedMesh.call");
            THREE.SkinnedMesh.call( scope, geometry, originalMaterial );

            var mixer = new THREE.AnimationMixer( scope );
            scope.mixer = mixer;

            // Create the animations
            for ( var i = 0; i < geometry.animations.length; ++ i ) {
                console.log("    "+i+" name"+geometry.animations[ i ].name);
                mixer.clipAction( geometry.animations[ i ] );

            }

            // Loading is complete, fire the callback
            if ( onLoad !== undefined ) onLoad();

        });

    };

    this.update = function( dt ) {

        this.mixer.update( dt );

    };

    this.play = function( animName, weight ) {

        //console.log("play('%s', %f)", animName, weight);
        return this.mixer.clipAction( animName ).
        setEffectiveWeight( weight ).play();
    };

    this.crossfade = function( fromAnimName, toAnimName, duration ) {

        this.mixer.stopAllAction();

        var fromAction = this.play( fromAnimName, 1 );
        var toAction = this.play( toAnimName, 1 );

        fromAction.crossFadeTo( toAction, duration, false );

    };

    this.warp = function( fromAnimName, toAnimName, duration ) {

        this.mixer.stopAllAction();

        var fromAction = this.play( fromAnimName, 1 );
        var toAction = this.play( toAnimName, 1 );

        fromAction.crossFadeTo( toAction, duration, true );

    };

    this.applyWeight = function( animName, weight ) {

        this.mixer.clipAction( animName ).setEffectiveWeight( weight );

    };

    this.getWeight = function( animName ) {

        return this.mixer.clipAction( animName ).getEffectiveWeight();

    }

    this.pauseAll = function() {

        this.mixer.timeScale = 0;

    };

    this.unPauseAll = function() {

        this.mixer.timeScale = 1;

    };


    this.stopAll = function() {

        this.mixer.stopAllAction();

    };

    this.showModel = function( bVal ) {

        this.visible = bVal;

    }

};


THREE.BlendCharacter.prototype = Object.create( THREE.SkinnedMesh.prototype );
THREE.BlendCharacter.prototype.constructor = THREE.BlendCharacter;

THREE.BlendCharacter.prototype.getForward = function() {

    var forward = new THREE.Vector3();

    return function() {

        // pull the character's forward basis vector out of the matrix
        forward.set(
                    - this.matrix.elements[ 8 ],
                    - this.matrix.elements[ 9 ],
                    - this.matrix.elements[ 10 ]
                    );

        return forward;

    }

};

