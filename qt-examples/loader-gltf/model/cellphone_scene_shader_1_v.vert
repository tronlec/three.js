
attribute vec3 vertexPosition;
attribute vec3 vertexNormal;
varying vec3 vPosition;
varying vec3 vNormal;
uniform mat4 projection;
uniform mat4 modelView;
uniform mat3 modelViewNormal;
void main()
{
    vNormal = normalize( modelViewNormal * vertexNormal );
    vPosition = vec3( modelView * vec4( vertexPosition, 1.0 ) );
    gl_Position = projection * modelView * vec4( vertexPosition, 1.0 );
}

