attribute float aVertexId;

uniform vec2 resolution;
uniform float time;

varying highp vec4 vColor;

vec2 touchPoint = vec2(0.0, 0.0);

void paint(out vec4 vColor, vec2 point, float time_ms) {
  float timeS = time_ms / 1000.0;
  float timeCoeff = timeS / 10.0;
  float freqCoeff = 100.0;

  // Rotate the pattern
  float rotationAngleRad = radians(timeCoeff * 10.0);
  mat2 rotationMatrix = mat2(
    cos(rotationAngleRad),
    -sin(rotationAngleRad),
    sin(rotationAngleRad),
    cos(rotationAngleRad)
  );
  point = vec2(
    point.x,
    point.y + 0.1 * sin(point.x * (freqCoeff / 20.0) * sin(timeCoeff))
  );

  point = rotationMatrix * point;

  // Create pinch point bubble
  vec2 dirToTouch = 1.0 / distance(point, touchPoint) * (touchPoint - point);
  point = point + dirToTouch * 0.1;

  // Create stripes
  float intensity =
    sin(freqCoeff * (6.0 * timeCoeff / 10.0 + point.y / 2.0)) * 0.5 + 0.5;

  float cutoffValue = 0.1;
  intensity = smoothstep(cutoffValue, cutoffValue - 0.02, intensity) * 0.8;

  vColor = vec4(intensity, intensity, intensity, 1.0);
}

void main() {
  float u = mod(aVertexId, resolution.x);
  float v = floor(aVertexId / resolution.x);
  vec2 point = 2.0 * vec2(u, v) / resolution - 1.0;

  gl_Position = vec4(point.xy, 0, 1);
  gl_PointSize = 5.0;

  paint(vColor, point, time);
}
