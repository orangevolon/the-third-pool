# version 300 es
const int TOUCH_EVENT_SIZE = 100;

struct TouchEvent {
  vec2 point;
  float timeMs;
};

struct ShaderState {
  float timeMs;
  float offsetY;
};

uniform ShaderState state;
uniform TouchEvent[TOUCH_EVENT_SIZE] touchEvents;
uniform vec2 resolution;

in float aVertexId;
out highp vec4 vColor;

vec2 mapToClipSpace(vec2 point, vec2 resolution) {
  return point / resolution * vec2(2.0, -2.0) - vec2(1.0, -1.0);
}

float asymmetricGaussian(float x, float sigma, float mu, float bias) {
  x = x - mu; // Shift the function along the x-axis
  if(x > 0.0)
    x *= bias;
  return exp(-pow(x, 2.0) / (2.0 * pow(sigma, 2.0)));
}

vec2 addTouchPoints(vec2 point, ShaderState state, TouchEvent[TOUCH_EVENT_SIZE] touchEvents) {
  // Touch settings
  float touchDropoffMs = 500.0;
  float touchRadius = 10.0;

  vec2 pointShift = vec2(0.0, 0.0);

  for(int index = 0; index < TOUCH_EVENT_SIZE; ++index) {
    vec2 touchPoint = mapToClipSpace(touchEvents[index].point, resolution);
    float touchTimeMs = touchEvents[index].timeMs;

    // Create pinch point bubble
    float distanceToTouchPoint = distance(point, touchPoint);

    vec2 dirToTouch = sin(distanceToTouchPoint * 100.0) /
      (distanceToTouchPoint * 1000.0) *
      normalize(touchPoint - point);

    float dirToTouchEvent = asymmetricGaussian(state.timeMs - touchTimeMs, touchDropoffMs / 3.0, touchDropoffMs, 0.1);

    pointShift += dirToTouch * dirToTouchEvent * touchRadius;
  }

  return point += pointShift;
}

vec2 moveField(vec2 point, ShaderState state) {
  vec2 offsetShift = vec2(0.0, state.offsetY);
  offsetShift += vec2(resolution.x / 2.0, resolution.y / 2.0);
  offsetShift = mapToClipSpace(offsetShift, resolution);

  return point + offsetShift;
}

vec2 addSecondWave(vec2 point, ShaderState state) {
  float freqCoeff = 10.0;
  float magnitude = 0.05;

  vec2 pointShift = vec2(
    0,
    sin(freqCoeff * point.x)
  ) * magnitude;

  return point + pointShift;
}

void paintField(out vec4 color, vec2 point, ShaderState state) {
  float freqCoeff = 100.0;

  // Create stripes
  float intensity = sin(freqCoeff * (10.0 + point.y / 2.0)) * 0.5 + 0.5;

  float cutoffValue = 0.1;
  intensity = smoothstep(cutoffValue, cutoffValue - 0.02, intensity) * 0.8;

  color = vec4(intensity, intensity, intensity, 1.0);
}

void main() {
  float u = mod(aVertexId, resolution.x);
  float v = floor(aVertexId / resolution.x);
  vec2 point = mapToClipSpace(vec2(u, v), resolution);

  gl_Position = vec4(point.xy, 0, 1);
  gl_PointSize = 5.0;

  point = moveField(point, state);
  point = addTouchPoints(point, state, touchEvents);
  point = addSecondWave(point, state);
  paintField(vColor, point, state);
}
