attribute float aVertexId;
uniform vec2 resolution;

varying highp vec4 vColor;

void main() {
    float u = mod(aVertexId, resolution.x);
    float v = floor(aVertexId / resolution.x);

    vec2 point = 2.0 * vec2(u, v) / resolution - 1.0;

    gl_Position = vec4(point.xy, 0, 1);
    gl_PointSize = 5.0;

    float dist = distance(vec2(0, 0), point);

    vColor = vec4(dist, 0, 0.2, 1.0);
}