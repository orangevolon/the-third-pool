const int TOUCH_EVENT_SIZE = 100;

attribute float aVertexId;

uniform vec2 resolution;
uniform float time;
uniform vec3 touchEvent[TOUCH_EVENT_SIZE];

varying highp vec4 vColor;

vec2 mapToClipSpace(vec2 point, vec2 resolution) {
  return point / resolution * vec2(2.0, -2.0) - vec2(1.0, -1.0);
}

float asymmetricGaussian(float x, float sigma, float mu, float bias) {
  x = x - mu; // Shift the function along the x-axis
  if (x > 0.0) x *= bias;
  return exp(-pow(x, 2.0) / (2.0 * pow(sigma, 2.0)));
}

vec2 addTouchPoint(vec2 point, float time_ms, vec3 touchEvent[TOUCH_EVENT_SIZE]) {
  // Touch settings
  float touchDropoffMs = 500.0;
  float touchRadius = 10.0;

  vec2 pointShift = vec2(0.0, 0.0);

  for(int index = 0; index < TOUCH_EVENT_SIZE; ++index) {
    vec2 touchPoint = mapToClipSpace(touchEvent[index].xy, resolution);
    float touchTimeMs = touchEvent[index].z;

    // Create pinch point bubble
    float distanceToTouchEvent = distance(point, touchPoint);

    vec2 dirToTouch =
      sin(distanceToTouchEvent * 100.0) /
      (distanceToTouchEvent * 1000.0) *
      normalize(touchPoint - point);

    float dirToTouchEvent = asymmetricGaussian(
      time_ms - touchTimeMs,
      touchDropoffMs / 3.0,
      touchDropoffMs,
      0.1
    );

    pointShift += dirToTouch * dirToTouchEvent * touchRadius;
  }

  return pointShift;
}

void paint(out vec4 vColor, vec2 point, float time_ms, vec3 touchEvent[TOUCH_EVENT_SIZE]) {
  float timeS = time_ms / 1000.0;
  float timeCoeff = timeS / 10.0;
  float freqCoeff = 100.0;

  point += addTouchPoint(point, time_ms, touchEvent);

  // Rotate the pattern
  float rotationAngleRad = radians(timeCoeff * 10.0);
  mat2 rotationMatrix = mat2(
    cos(rotationAngleRad),
    -sin(rotationAngleRad),
    sin(rotationAngleRad),
    cos(rotationAngleRad)
  );
  point = rotationMatrix * point;

  // Add one more dimension to the pattern
  point = vec2(
    point.x,
    point.y + 0.1 * sin(point.x * (freqCoeff / 20.0) * sin(timeCoeff))
  );

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
  vec2 point = mapToClipSpace(vec2(u, v), resolution);

  gl_Position = vec4(point.xy, 0, 1);
  gl_PointSize = 5.0;

  paint(vColor, point, time, touchEvent);
}
