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

vec2 travellingWave(
  vec2 center,
  vec2 point,
  float time_ms,
  float touch_time_ms,
  float freq,
  float propogation,
  float magnitude,
  float attenuation
) {
  float time = (time_ms - touch_time_ms) / 1000.0;
  vec2 wavePoint = point - center;

  // Wave shift
  float waveShift = sin(propogation * length(wavePoint) - freq * time);

  // Wavefront
  waveShift *= (1.0 - step(freq * time, propogation * length(wavePoint)));

  // Magnitude
  waveShift *= magnitude;

  // Attenuation
  waveShift *= exp(-attenuation * length(wavePoint));

  // Direction
  vec2 pointShift = waveShift * normalize(wavePoint);

  return pointShift;
}

vec2 addTouchPoints(vec2 point, ShaderState state, TouchEvent[TOUCH_EVENT_SIZE] touchEvents) {
  // Touch settings
  float touchDropoffMs = 3500.0;

  vec2 pointShift = vec2(0.0, 0.0);

  for(int index = 0; index < TOUCH_EVENT_SIZE; ++index) {
    vec2 touchPoint = mapToClipSpace(touchEvents[index].point, resolution);
    float touchTime = touchEvents[index].timeMs;

    vec2 touchShift = vec2(0.0, 0.0);
    
    // Touch radius
    touchShift += travellingWave(
      touchPoint,
      point,
      state.timeMs,
      touchTime,
      6.0,
      6.0,
      0.05,
      2.0
    );

    // Time falloff
    touchShift *= asymmetricGaussian(
      state.timeMs - touchTime, 
      touchDropoffMs,
      0.0,
      1.0
    );

    pointShift += touchShift;
  }

  return point += pointShift;
}

vec2 moveField(vec2 point, ShaderState state) {
  vec2 offsetShift = vec2(0.0, state.offsetY);
  offsetShift += vec2(resolution.x / 2.0, resolution.y / 2.0);
  offsetShift = mapToClipSpace(offsetShift, resolution);

  return point + offsetShift;
}

void paintField(out vec4 color, vec2 point, ShaderState state) {
  float freqCoeff = 100.0;

  // Create stripes
  float intensity = sin(freqCoeff * point.y) *
    cos(freqCoeff * point.x) * 0.5 + 0.5;

  float cutoffValue = 0.1;
  intensity = smoothstep(cutoffValue, cutoffValue - 0.02, intensity);

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
  
  paintField(vColor, point, state);
}
