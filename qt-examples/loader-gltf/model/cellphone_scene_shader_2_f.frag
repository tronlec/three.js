
uniform highp vec4 lightPosition;
uniform highp vec3 lightIntensity;
uniform highp vec3 ka;
uniform highp vec3 ks;
uniform highp float shininess;
uniform sampler2D diffuseTexture;
varying highp vec3 vPosition;
varying highp vec3 vNormal;
varying highp vec2 vTexCoord;

highp vec4 adsModel( const highp vec3 pos, const highp vec3 n )
{
    highp vec3 s = normalize( vec3( lightPosition ) - pos );
    highp vec3 v = normalize( -pos );
    highp vec3 r = reflect( -s, n );
    highp float diffuse = max( dot( s, n ), 0.0 );
    highp float specular = 0.0;
    if ( dot( s, n ) > 0.0 )
        specular = pow( max( dot( r, v ), 0.0 ), shininess );
    highp vec4 kd = texture2D( diffuseTexture, vTexCoord );
    return vec4( lightIntensity * ( ka + kd.rgb * diffuse + ks * specular ) * kd.a, kd.a );
}
void main()
{
    gl_FragColor = adsModel( vPosition, normalize( vNormal ) );
}

