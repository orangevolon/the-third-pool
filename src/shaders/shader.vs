attribute vec4 aVertexPosition;

varying highp vec4 vColor;

void main() {
    gl_Position = aVertexPosition;
    gl_PointSize = 10.0;
    vColor = vec4(1.0, 1.0, 1.0, 1.0);
}