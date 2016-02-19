
attribute vec3 vertexPosition;
attribute vec3 vertexNormal;
attribute vec2 vertexTexCoord;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;
uniform mat4 projection;
uniform mat4 modelView;
uniform mat3 modelViewNormal;
void main()
{
    vTexCoord = vertexTexCoord;
    vNormal = normalize( modelViewNormal * vertexNormal );
    vPosition = vec3( modelView * vec4( vertexPosition, 1.0 ) );
    gl_Position = projection * modelView * vec4( vertexPosition, 1.0 );
}

