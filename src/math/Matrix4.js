/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 * @author bhouston / http://exocortex.com
 * @author WestLangley / http://github.com/WestLangley
 */


THREE.Matrix4 = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

    this.elements = Arrays.newFloat32Array( 16 );

	// TODO: if n11 is undefined, then just set to identity, otherwise copy all other values into matrix
	//   we should not support semi specification of Matrix4, it is just weird.

	var te = this.elements;

    te.set( 0, (n11 !== undefined) ? n11 : 1);
    te.set( 4,  n12 || 0);
    te.set( 8, n13 || 0);
    te.set(12, n14 || 0);
    te.set( 1, n21 || 0);
    te.set( 5, (n22 !== undefined) ? n22 : 1);
    te.set( 9, n23 || 0);
    te.set(13, n24 || 0);
    te.set( 2, n31 || 0);
    te.set( 6, n32 || 0);
    te.set(10, (n33 !== undefined) ? n33 : 1);
    te.set(14, n34 || 0);
    te.set( 3, n41 || 0);
    te.set( 7, n42 || 0);
    te.set(11, n43 || 0);
    te.set(15, (n44 !== undefined) ? n44 : 1);
};

THREE.Matrix4.prototype = {

	constructor: THREE.Matrix4,

	set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		var te = this.elements;

        te.set(0,n11); te.set(4,n12); te.set(8,n13); te.set(12,n14);
        te.set(1,n21); te.set(5,n22); te.set(9,n23); te.set(13,n24);
        te.set(2,n31); te.set(6,n32); te.set(10,n33); te.set(14,n34);
        te.set(3,n41); te.set(7,n42); te.set(11,n43); te.set(15,n44);

		return this;

	},

    float32Array: function() {
        console.log("float32Array returning " + this.elements);
        return this.elements;
    },

	identity: function () {

		this.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);

		return this;

	},

	copy: function ( m ) {

		this.elements.set( m.elements );

		return this;

	},

	extractPosition: function ( m ) {

		console.warn( 'DEPRECATED: Matrix4\'s .extractPosition() has been renamed to .copyPosition().' );
		return this.copyPosition( m );

	},

	copyPosition: function ( m ) {

		var te = this.elements;
		var me = m.elements;

        te.set(12,me.get(12));
        te.set(13,me.get(13));
        te.set(14,me.get(14));

		return this;

	},

    extractRotation: function ( m ) {

		var v1 = new THREE.Vector3();

			var te = this.elements;
			var me = m.elements;

            var scaleX = 1 / v1.set( me.get(0), me.get(1), me.get(2) ).length();
            var scaleY = 1 / v1.set( me.get(4), me.get(5), me.get(6) ).length();
            var scaleZ = 1 / v1.set( me.get(8), me.get(9), me.get(10) ).length();

            te.set(0,me.get(0) * scaleX);
            te.set(1,me.get(1) * scaleX);
            te.set(2,me.get(2) * scaleX);

            te.set(4,me.get(4) * scaleY);
            te.set(5,me.get(5) * scaleY);
            te.set(6,me.get(6) * scaleY);

            te.set(8,me.get(8) * scaleZ);
            te.set(9,me.get(9) * scaleZ);
            te.set(10,me.get(10) * scaleZ);

			return this;
    },

	makeRotationFromEuler: function ( euler ) {

		if ( euler instanceof THREE.Euler === false ) {

			console.error( 'ERROR: Matrix\'s .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.  Please update your code.' );

		}

		var te = this.elements;

		var x = euler.x, y = euler.y, z = euler.z;
		var a = Math.cos( x ), b = Math.sin( x );
		var c = Math.cos( y ), d = Math.sin( y );
		var e = Math.cos( z ), f = Math.sin( z );

		if ( euler.order === 'XYZ' ) {

			var ae = a * e, af = a * f, be = b * e, bf = b * f;

            te.set(0,c * e);
            te.set(4,- c * f);
            te.set(8,d);

            te.set(1,af + be * d);
            te.set(5,ae - bf * d);
            te.set(9,- b * c);

            te.set(2,bf - ae * d);
            te.set(6,be + af * d);
            te.set(10,a * c);

		} else if ( euler.order === 'YXZ' ) {

			var ce = c * e, cf = c * f, de = d * e, df = d * f;

            te.set(0,ce + df * b);
            te.set(4,de * b - cf);
            te.set(8,a * d);

            te.set(1,a * f);
            te.set(5,a * e);
            te.set(9,- b);

            te.set(2,cf * b - de);
            te.set(6,df + ce * b);
            te.set(10,a * c);

		} else if ( euler.order === 'ZXY' ) {

			var ce = c * e, cf = c * f, de = d * e, df = d * f;

            te.set(0, ce - df * b);
            te.set(4, - a * f);
            te.set(8, de + cf * b);

            te.set(1, cf + de * b);
            te.set(5, a * e);
            te.set(9, df - ce * b);

            te.set(2, - a * d);
            te.set(6, b);
            te.set(10, a * c);

		} else if ( euler.order === 'ZYX' ) {

			var ae = a * e, af = a * f, be = b * e, bf = b * f;

            te.set(0, c * e);
            te.set(4, be * d - af);
            te.set(8, ae * d + bf);

            te.set(1, c * f);
            te.set(5, bf * d + ae);
            te.set(9, af * d - be);

            te.set(2, - d);
            te.set(6, b * c);
            te.set(10, a * c);

		} else if ( euler.order === 'YZX' ) {

			var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

            te.set(0, c * e);
            te.set(4, bd - ac * f);
            te.set(8, bc * f + ad);

            te.set(1, f);
            te.set(5, a * e);
            te.set(9, - b * e);

            te.set(2, - d * e);
            te.set(6, ad * f + bc);
            te.set(10, ac - bd * f);

		} else if ( euler.order === 'XZY' ) {

			var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

            te.set(0, c * e);
            te.set(4, - f);
            te.set(8, d * e);

            te.set(1, ac * f + bd);
            te.set(5, a * e);
            te.set(9, ad * f - bc);

            te.set(2, bc * f - ad);
            te.set(6, b * e);
            te.set(10, bd * f + ac);
		}

		// last column
        te.set(3,0);
        te.set(7,0);
        te.set(11,0);

		// bottom row
        te.set(12,0);
        te.set(13,0);
        te.set(14,0);
        te.set(15,1);

		return this;

	},

	setRotationFromQuaternion: function ( q ) {

		console.warn( 'DEPRECATED: Matrix4\'s .setRotationFromQuaternion() has been deprecated in favor of makeRotationFromQuaternion.  Please update your code.' );

		return this.makeRotationFromQuaternion( q );

	},

	makeRotationFromQuaternion: function ( q ) {

		var te = this.elements;

		var x = q.x, y = q.y, z = q.z, w = q.w;
		var x2 = x + x, y2 = y + y, z2 = z + z;
		var xx = x * x2, xy = x * y2, xz = x * z2;
		var yy = y * y2, yz = y * z2, zz = z * z2;
		var wx = w * x2, wy = w * y2, wz = w * z2;

        te.set(0,1 - ( yy + zz ));
        te.set(4,xy - wz);
        te.set(8,xz + wy);

        te.set(1,xy + wz);
        te.set(5,1 - ( xx + zz ));
        te.set(9,yz - wx);

        te.set(2,xz - wy);
        te.set(6,yz + wx);
        te.set(10,1 - ( xx + yy ));

		// last column
        te.set(3,0);
        te.set(7,0);
        te.set(11,0);

		// bottom row
        te.set(12,0);
        te.set(13,0);
        te.set(14,0);
        te.set(15,1);

		return this;

	},

    lookAt: function( eye, target, up ) {

		var x = new THREE.Vector3();
		var y = new THREE.Vector3();
		var z = new THREE.Vector3();

			var te = this.elements;

			z.subVectors( eye, target ).normalize();

			if ( z.length() === 0 ) {

				z.z = 1;

			}

			x.crossVectors( up, z ).normalize();

			if ( x.length() === 0 ) {

				z.x += 0.0001;
				x.crossVectors( up, z ).normalize();

			}

			y.crossVectors( z, x );


            te.set(0,x.x); te.set(4,y.x); te.set(8,z.x);
            te.set(1,x.y); te.set(5,y.y); te.set(9,z.y);
            te.set(2,x.z); te.set(6,y.z); te.set(10,z.z);

			return this;

    },

	multiply: function ( m, n ) {

		if ( n !== undefined ) {

			console.warn( 'DEPRECATED: Matrix4\'s .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.' );
			return this.multiplyMatrices( m, n );

		}

		return this.multiplyMatrices( this, m );

	},

	multiplyMatrices: function ( a, b ) {

		var ae = a.elements;
		var be = b.elements;
		var te = this.elements;

        var a11 = ae.get(0), a12 = ae.get(4), a13 = ae.get(8), a14 = ae.get(12);
        var a21 = ae.get(1), a22 = ae.get(5), a23 = ae.get(9), a24 = ae.get(13);
        var a31 = ae.get(2), a32 = ae.get(6), a33 = ae.get(10), a34 = ae.get(14);
        var a41 = ae.get(3), a42 = ae.get(7), a43 = ae.get(11), a44 = ae.get(15);

        var b11 = be.get(0), b12 = be.get(4), b13 = be.get(8), b14 = be.get(12);
        var b21 = be.get(1), b22 = be.get(5), b23 = be.get(9), b24 = be.get(13);
        var b31 = be.get(2), b32 = be.get(6), b33 = be.get(10), b34 = be.get(14);
        var b41 = be.get(3), b42 = be.get(7), b43 = be.get(11), b44 = be.get(15);

        te.set(0,a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41);
        te.set(4,a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42);
        te.set(8,a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43);
        te.set(12,a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44);

        te.set(1,a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41);
        te.set(5,a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42);
        te.set(9,a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43);
        te.set(13,a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44);

        te.set(2,a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41);
        te.set(6,a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42);
        te.set(10,a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43);
        te.set(14,a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44);

        te.set(3,a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41);
        te.set(7,a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42);
        te.set(11,a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43);
        te.set(15,a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44);

		return this;

	},

	multiplyToArray: function ( a, b, r ) {

		var te = this.elements;

		this.multiplyMatrices( a, b );

        r.set( 0, te.get(0)); r.set( 1 ,te.get(1)); r.set( 2 ,te.get(2)); r.set( 3 ,te.get(3));
        r.set( 4, te.get(4)); r.set( 5 ,te.get(5)); r.set( 6 ,te.get(6)); r.set( 7 ,te.get(7));
        r.set( 8, te.get(8)); r.set( 9, te.get(9)); r.set( 10 ,te.get(10)); r.set( 11 ,te.get(11));
        r.set( 12, te.get(12)); r.set( 13 ,te.get(13)); r.set( 14 ,te.get(14)); r.set( 15 ,te.get(15));

		return this;

	},

	multiplyScalar: function ( s ) {

		var te = this.elements;

        te.set(0, te.get(0) * s); te.set(4, te.get(4) * s); te.set(8, te.get(8) * s); te.set(12, te.get(12) * s);
        te.set(1, te.get(1) * s); te.set(5, te.get(5) * s); te.set(9, te.get(9) * s); te.set(13, te.get(13) * s);
        te.set(2, te.get(2) * s); te.set(6, te.get(6) * s); te.set(10, te.get(10) * s); te.set(14, te.get(14) * s);
        te.set(3, te.get(3) * s); te.set(7, te.get(7) * s); te.set(11, te.get(11) * s); te.set(15, te.get(15) * s);

		return this;

	},

	multiplyVector3: function ( vector ) {

		console.warn( 'DEPRECATED: Matrix4\'s .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) or vector.applyProjection( matrix ) instead.' );
		return vector.applyProjection( this );

	},

	multiplyVector4: function ( vector ) {

		console.warn( 'DEPRECATED: Matrix4\'s .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
		return vector.applyMatrix4( this );

	},

    multiplyVector3Array: function( a ) {

		var v1 = new THREE.Vector3();

			for ( var i = 0, il = a.length; i < il; i += 3 ) {

                v1.x = a.get( i );
                v1.y = a.get( i + 1 );
                v1.z = a.get( i + 2 );

				v1.applyProjection( this );

                a.set( i, v1.x);
                a.set( i + 1 ,v1.y);
                a.set( i + 2 ,v1.z);
			}

			return a;
    },

	rotateAxis: function ( v ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead.' );

		v.transformDirection( this );

	},

	crossVector: function ( vector ) {

		console.warn( 'DEPRECATED: Matrix4\'s .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
		return vector.applyMatrix4( this );

	},

	determinant: function () {

		var te = this.elements;

        var n11 = te.get(0), n12 = te.get(4), n13 = te.get(8), n14 = te.get(12);
        var n21 = te.get(1), n22 = te.get(5), n23 = te.get(9), n24 = te.get(13);
        var n31 = te.get(2), n32 = te.get(6), n33 = te.get(10), n34 = te.get(14);
        var n41 = te.get(3), n42 = te.get(7), n43 = te.get(11), n44 = te.get(15);

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

		return (
			n41 * (
				+n14 * n23 * n32
				-n13 * n24 * n32
				-n14 * n22 * n33
				+n12 * n24 * n33
				+n13 * n22 * n34
				-n12 * n23 * n34
			) +
			n42 * (
				+n11 * n23 * n34
				-n11 * n24 * n33
				+n14 * n21 * n33
				-n13 * n21 * n34
				+n13 * n24 * n31
				-n14 * n23 * n31
			) +
			n43 * (
				+n11 * n24 * n32
				-n11 * n22 * n34
				-n14 * n21 * n32
				+n12 * n21 * n34
				+n14 * n22 * n31
				-n12 * n24 * n31
			) +
			n44 * (
				-n13 * n22 * n31
				-n11 * n23 * n32
				+n11 * n22 * n33
				+n13 * n21 * n32
				-n12 * n21 * n33
				+n12 * n23 * n31
			)

		);

	},

	transpose: function () {

		var te = this.elements;
		var tmp;

        tmp = te.get(1); te.set(1,te.get(4)); te.set(4,tmp);
        tmp = te.get(2); te.set(2,te.get(8)); te.set(8,tmp);
        tmp = te.get(6); te.set(6,te.get(9)); te.set(9,tmp);

        tmp = te.get(3); te.set(3,te.get(12)); te.set(12,tmp);
        tmp = te.get(7); te.set(7,te.get(13)); te.set(13,tmp);
        tmp = te.get(11); te.set(11,te.get(14)); te.set(14,tmp);

		return this;

	},

	flattenToArray: function ( flat ) {

		var te = this.elements;
        flat.set(0, te.get(0));
        flat.set(1, te.get(1));
        flat.set(2, te.get(2));
        flat.set(3, te.get(3));
        flat.set(4, te.get(4));
        flat.set(5, te.get(5));
        flat.set(6, te.get(6));
        flat.set(7, te.get(7));
        flat.set(8, te.get(8));
        flat.set(9, te.get(9));
        flat.set(10, te.get(10));
        flat.set(11, te.get(11));
        flat.set(12, te.get(12));
        flat.set(13, te.get(13));
        flat.set(14, te.get(14));
        flat.set(15, te.get(15));

		return flat;

	},

	flattenToArrayOffset: function( flat, offset ) {

		var te = this.elements;
        flat.set(offset, te.get(0));
        flat.set(offset + 1, te.get(1));
        flat.set(offset + 2, te.get(2));
        flat.set(offset + 3, te.get(3));
        flat.set(offset + 4, te.get(4));
        flat.set(offset + 5, te.get(5));
        flat.set(offset + 6, te.get(6));
        flat.set(offset + 7, te.get(7));
        flat.set(offset + 8, te.get(8));
        flat.set(offset + 9, te.get(9));
        flat.set(offset + 10, te.get(10));
        flat.set(offset + 11, te.get(11));
        flat.set(offset + 12, te.get(12));
        flat.set(offset + 13, te.get(13));
        flat.set(offset + 14, te.get(14));
        flat.set(offset + 15, te.get(15));
		return flat;
	},

	getPosition: function() {

		var v1 = new THREE.Vector3();

			console.warn( 'DEPRECATED: Matrix4\'s .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.' );

			var te = this.elements;
            return v1.set( te.get(12), te.get(13), te.get(14) );
    },

	setPosition: function ( v ) {

		var te = this.elements;

        te.set(12,v.x);
        te.set(13,v.y);
        te.set(14,v.z);

		return this;

	},

	getInverse: function ( m, throwOnInvertible ) {

		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
		var te = this.elements;
		var me = m.elements;

        var n11 = me.get(0), n12 = me.get(4), n13 = me.get(8), n14 = me.get(12);
        var n21 = me.get(1), n22 = me.get(5), n23 = me.get(9), n24 = me.get(13);
        var n31 = me.get(2), n32 = me.get(6), n33 = me.get(10), n34 = me.get(14);
        var n41 = me.get(3), n42 = me.get(7), n43 = me.get(11), n44 = me.get(15);

        te.set(0,n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44);
        te.set(4,n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44);
        te.set(8,n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44);
        te.set(12,n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34);
        te.set(1,n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44);
        te.set(5,n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44);
        te.set(9,n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44);
        te.set(13,n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34);
        te.set(2,n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44);
        te.set(6,n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44);
        te.set(10,n12*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44);
        te.set(14,n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34);
        te.set(3,n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43);
        te.set(7,n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43);
        te.set(11,n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43);
        te.set(15,n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33);

        var det = n11 * te.get( 0 ) + n21 * te.get( 4 ) + n31 * te.get( 8 ) + n41 * te.get( 12 );

		if ( det == 0 ) {

			var msg = "Matrix4.getInverse(): can't invert matrix, determinant is 0";

			if ( throwOnInvertible || false ) {

				throw new Error( msg ); 

			} else {

				console.warn( msg );

			}

			this.identity();

			return this;
		}

		this.multiplyScalar( 1 / det );

		return this;

	},

	translate: function ( v ) {

		console.warn( 'DEPRECATED: Matrix4\'s .translate() has been removed.');

	},

	rotateX: function ( angle ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateX() has been removed.');

	},

	rotateY: function ( angle ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateY() has been removed.');

	},

	rotateZ: function ( angle ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateZ() has been removed.');

	},

	rotateByAxis: function ( axis, angle ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateByAxis() has been removed.');

	},

	scale: function ( v ) {

		var te = this.elements;
		var x = v.x, y = v.y, z = v.z;

        te.set(0, te.get(0) * x); te.set(4, te.get(4) * y); te.set(8, te.get(8) * z);
        te.set(1, te.get(1) * x); te.set(5, te.get(5) * y); te.set(9, te.get(9) * z);
        te.set(2, te.get(2) * x); te.set(6, te.get(6) * y); te.set(10, te.get(10) * z);
        te.set(3, te.get(3) * x); te.set(7, te.get(7) * y); te.set(11, te.get(11) * z);

		return this;

	},

	getMaxScaleOnAxis: function () {

		var te = this.elements;

        var scaleXSq = te.get(0) * te.get(0) + te.get(1) * te.get(1) + te.get(2) * te.get(2);
        var scaleYSq = te.get(4) * te.get(4) + te.get(5) * te.get(5) + te.get(6) * te.get(6);
        var scaleZSq = te.get(8) * te.get(8) + te.get(9) * te.get(9) + te.get(10) * te.get(10);

		return Math.sqrt( Math.max( scaleXSq, Math.max( scaleYSq, scaleZSq ) ) );

	},

	makeTranslation: function ( x, y, z ) {

		this.set(

			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1

		);

		return this;

	},

	makeRotationX: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			1, 0,  0, 0,
			0, c, -s, 0,
			0, s,  c, 0,
			0, 0,  0, 1

		);

		return this;

	},

	makeRotationY: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			 c, 0, s, 0,
			 0, 1, 0, 0,
			-s, 0, c, 0,
			 0, 0, 0, 1

		);

		return this;

	},

	makeRotationZ: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			c, -s, 0, 0,
			s,  c, 0, 0,
			0,  0, 1, 0,
			0,  0, 0, 1

		);

		return this;

	},

	makeRotationAxis: function ( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		var c = Math.cos( angle );
		var s = Math.sin( angle );
		var t = 1 - c;
		var x = axis.x, y = axis.y, z = axis.z;
		var tx = t * x, ty = t * y;

		this.set(

			tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		 return this;

	},

	makeScale: function ( x, y, z ) {

		this.set(

			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1

		);

		return this;

	},

	compose: function ( position, quaternion, scale ) {

		this.makeRotationFromQuaternion( quaternion );
		this.scale( scale );
		this.setPosition( position );

		return this;

	},

    decompose: function ( position, quaternion, scale ) {

		var vector = new THREE.Vector3();
		var matrix = new THREE.Matrix4();

			var te = this.elements;

            var sx = vector.set( te.get(0), te.get(1), te.get(2) ).length();
            var sy = vector.set( te.get(4), te.get(5), te.get(6) ).length();
            var sz = vector.set( te.get(8), te.get(9), te.get(10) ).length();

			// if determine is negative, we need to invert one scale
			var det = this.determinant();
			if( det < 0 ) {
				sx = -sx;
			}

            position.x = te.get(12);
            position.y = te.get(13);
            position.z = te.get(14);

			// scale the rotation part

			matrix.elements.set( this.elements ); // at this point matrix is incomplete so we can't use .copy()

			var invSX = 1 / sx;
			var invSY = 1 / sy;
			var invSZ = 1 / sz;

            matrix.elements.set(0, te.get(0) * invSX);
            matrix.elements.set(1, te.get(1) * invSX);
            matrix.elements.set(2, te.get(2) * invSX);

            matrix.elements.set(4, te.get(4) * invSY);
            matrix.elements.set(5, te.get(5) * invSY);
            matrix.elements.set(6, te.get(6) * invSY);

            matrix.elements.set(8, te.get(8) * invSZ);
            matrix.elements.set(9, te.get(9) * invSZ);
            matrix.elements.set(10, te.get(10) * invSZ);

			quaternion.setFromRotationMatrix( matrix );

			scale.x = sx;
			scale.y = sy;
			scale.z = sz;

			return this;
    },

	makeFrustum: function ( left, right, bottom, top, near, far ) {

		var te = this.elements;
		var x = 2 * near / ( right - left );
		var y = 2 * near / ( top - bottom );

		var a = ( right + left ) / ( right - left );
		var b = ( top + bottom ) / ( top - bottom );
		var c = - ( far + near ) / ( far - near );
		var d = - 2 * far * near / ( far - near );

        te.set(0,x); te.set(4,0);	te.set(8,a);	te.set(12,0);
        te.set(1,0); te.set(5,y);	te.set(9,b);	te.set(13,0);
        te.set(2,0); te.set(6,0);	te.set(10,c);	te.set(14,d);
        te.set(3,0); te.set(7,0);	te.set(11,- 1);	te.set(15,0);

		return this;

	},

	makePerspective: function ( fov, aspect, near, far ) {

		var ymax = near * Math.tan( THREE.Math.degToRad( fov * 0.5 ) );
		var ymin = - ymax;
		var xmin = ymin * aspect;
		var xmax = ymax * aspect;

		return this.makeFrustum( xmin, xmax, ymin, ymax, near, far );

	},

	makeOrthographic: function ( left, right, top, bottom, near, far ) {

		var te = this.elements;
		var w = right - left;
		var h = top - bottom;
		var p = far - near;

		var x = ( right + left ) / w;
		var y = ( top + bottom ) / h;
		var z = ( far + near ) / p;

        te.set(0,2 / w); te.set(4,0); te.set(8,0); te.set(12,-x);
        te.set(1,0); te.set(5,2 / h); te.set(9,0); te.set(13,-y);
        te.set(2,0); te.set(6,0); te.set(10,-2/p); te.set(14,-z);
        te.set(3,0); te.set(7,0); te.set(11,0); te.set(15,1);

		return this;

	},

	fromArray: function ( array ) {

		this.elements.set( array );

		return this;

	},

	toArray: function () {

		var te = this.elements;

        return [
            te.get( 0 ), te.get( 1 ), te.get( 2 ), te.get( 3 ),
            te.get( 4 ), te.get( 5 ), te.get( 6 ), te.get( 7 ),
            te.get( 8 ), te.get( 9 ), te.get( 10 ), te.get( 11 ),
            te.get( 12 ), te.get( 13 ), te.get( 14 ), te.get( 15 )
		];

	},

	clone: function () {

		var te = this.elements;

		return new THREE.Matrix4(
                    te.get( 0 ), te.get( 1 ), te.get( 2 ), te.get( 3 ),
                    te.get( 4 ), te.get( 5 ), te.get( 6 ), te.get( 7 ),
                    te.get( 8 ), te.get( 9 ), te.get( 10 ), te.get( 11 ),
                    te.get( 12 ), te.get( 13 ), te.get( 14 ), te.get( 15 )
        );

	}

};
