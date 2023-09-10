attribute float aVertexId;
uniform vec2 resolution;
uniform float time;

varying highp vec4 vColor;

void main() {
    float u = mod(aVertexId, resolution.x);
    float v = floor(aVertexId / resolution.x);

    vec2 point = 2.0 * vec2(u, v) / resolution - 1.0;

    gl_Position = vec4(point.xy, 0, 1);
    gl_PointSize = 5.0;

    float dist = distance(vec2(0, 0), point);

    float red = cos(20.0 * (time / 6000.00 + dist));
    float green = cos(10.0 * (time / 8000.00 + dist + 2.0));
    float blue = cos(10.0 * (time / 10000.00 + dist + 4.0));

    vec3 color = vec3(red, green, blue) / 2.0 + 0.5;

    vColor = vec4(color, 1.0);
}