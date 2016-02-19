
uniform highp vec4 lightPosition;
uniform highp vec3 lightIntensity;
uniform highp vec3 ka;
uniform highp vec4 kd;
uniform highp vec3 ks;
uniform highp float shininess;
varying highp vec3 vPosition;
varying highp vec3 vNormal;

highp vec3 adsModel( const highp vec3 pos, const highp vec3 n )
{
    highp vec3 s = normalize( vec3( lightPosition ) - pos );
    highp vec3 v = normalize( -pos );
    highp vec3 r = reflect( -s, n );
    highp float diffuse = max( dot( s, n ), 0.0 );
    highp float specular = 0.0;
    if ( dot( s, n ) > 0.0 )
        specular = pow( max( dot( r, v ), 0.0 ), shininess );
    return lightIntensity * ( ka + kd.rgb * diffuse + ks * specular );
}
void main()
{
    gl_FragColor = vec4( adsModel( vPosition, normalize( vNormal ) ) * kd.a, kd.a );
}

