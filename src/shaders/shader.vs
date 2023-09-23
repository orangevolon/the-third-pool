# version 300 es
const int TOUCH_EVENT_SIZE = 100;

struct TouchEvent {
  vec2 point;
  float timeMs;
};

struct State {
  float timeMs;
  float progress;
  vec2 resolution;
};

uniform State state;
uniform TouchEvent[TOUCH_EVENT_SIZE] touchEvents;

in float aVertexId;
out highp vec4 vColor;


vec2 mapToClipSpace(vec2 point, vec2 resolution) {
  return point / resolution * vec2(2.0, -2.0) - vec2(1.0, -1.0);
}

float asymmetricGaussian(float x, float sigma, float mu, float bias) {
  x = x - mu; // Shift the function along the x-axis
  if (x > 0.0) x *= bias;
  return exp(-pow(x, 2.0) / (2.0 * pow(sigma, 2.0)));
}

vec2 addTouchPoints(vec2 point, State state, TouchEvent[TOUCH_EVENT_SIZE] touchEvents) {
  // Touch settings
  float touchDropoffMs = 500.0;
  float touchRadius = 10.0;

  vec2 pointShift = vec2(0.0, 0.0);

  for(int index = 0; index < TOUCH_EVENT_SIZE; ++index) {
    vec2 touchPoint = mapToClipSpace(touchEvents[index].point, state.resolution);
    float touchTimeMs = touchEvents[index].timeMs;

    // Create pinch point bubble
    float distanceToTouchEvent = distance(point, touchPoint);

    vec2 dirToTouch =
      sin(distanceToTouchEvent * 100.0) /
      (distanceToTouchEvent * 1000.0) *
      normalize(touchPoint - point);

    float dirToTouchEvent = asymmetricGaussian(
      state.timeMs - touchTimeMs,
      touchDropoffMs / 3.0,
      touchDropoffMs,
      0.1
    );

    pointShift += dirToTouch * dirToTouchEvent * touchRadius;
  }

  return point += pointShift;
}

void paintField(out vec4 color, vec2 point, State state) {
  float progress = state.progress;
  float freqCoeff = 100.0;

  // Add one more dimension to the pattern
  point = vec2(
    point.x,
    point.y + 0.1 * sin(point.x * (freqCoeff / 20.0) * sin(progress))
  );

  // Create stripes
  float intensity =
    sin(freqCoeff * (6.0 * progress / 10.0 + point.y / 2.0)) * 0.5 + 0.5;

  float cutoffValue = 0.1;
  intensity = smoothstep(cutoffValue, cutoffValue - 0.02, intensity) * 0.8;

  color = vec4(intensity, intensity, intensity, 1.0);
}

void main() {
  float u = mod(aVertexId, state.resolution.x);
  float v = floor(aVertexId / state.resolution.x);
  vec2 point = mapToClipSpace(vec2(u, v), state.resolution);

  gl_Position = vec4(point.xy, 0, 1);
  gl_PointSize = 5.0;

  point = addTouchPoints(point, state, touchEvents);
  paintField(vColor, point, state);
}
