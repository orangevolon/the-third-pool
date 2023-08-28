attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

void main() {
    gl_Position = aVertexPosition;
    vColor = aVertexColor;
}