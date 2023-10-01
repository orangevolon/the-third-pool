# version 300 es
const int TOUCH_EVENT_SIZE = 100;
const float PI = 3.14159;

struct TouchEvent {
  vec2 point;
  float timeMs;
};

struct ShaderState {
  float timeMs;
  float offsetY;
};

struct ColorCoeffs {
  vec3 offset;
  vec3 amplitude;
  vec3 frequency;
  vec3 phase;
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
  float shiftedX = x - mu; // Shift the function along the x-axis
  float biasedSigma = sigma / bias;

  if(shiftedX > 0.0)
    shiftedX /= bias;
  else 
    shiftedX *= bias;

  return exp(-pow(shiftedX, 2.0) / (2.0 * pow(biasedSigma, 2.0)));
}

float rand(vec2 co){
  return fract(
    sin(
        dot(co, vec2(12.9898, 78.233))
      ) * 43758.5453
    );
}

float circle(vec2 point, float radius){
  float r = distance(point, vec2(0.5));
    return 1. - smoothstep(
      radius - (radius * 0.05),
      radius + (radius * 0.05),
      pow(r, 2.) * PI
      );
}

float addSinusoid(
  float x,
  float amp,
  float freq,
  float phase,
  float base
) {
  return base * (1. + amp * sin(freq * x + phase));
}

vec2 travellingWave(
  vec2 center,
  vec2 point,
  float time_ms,
  float touch_time_ms,
  float freq,
  float propogation,
  float magnitude,
  float attenuation,
  float phase
) {
  float time = (time_ms - touch_time_ms) / 1000.0;
  vec2 wavePoint = point - center;

  // Wave shift
  float waveShift = sin(propogation * length(wavePoint) - freq * time - phase);

  // Wavefront
  waveShift *= (1.0 - step(freq * time - phase, propogation * length(wavePoint)));

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
  float touchBias = 6.0;

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
      8.0,
      30.0,
      0.05,
      2.0,
      - PI / 2.0
    );

    // Time falloff
    touchShift *= asymmetricGaussian(
      state.timeMs - touchTime, 
      touchDropoffMs / 3.,
      touchDropoffMs / (touchBias * 9.),
      touchBias
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

vec4 cosineGradient(float x) {
  ColorCoeffs coeffs = ColorCoeffs(
    vec3(0.177, 0.638, 1.018),
    vec3(0.396, 0.269, -0.252),
    vec3(0.8595, 1.1387, 0.4877),
    vec3(3.606, 6.232, 5.057)
  );

  x *= 2.0 * PI;

  vec3 color = cos(coeffs.frequency * x + coeffs.phase) * 0.5 + 0.5;
  color *= coeffs.amplitude;
  color += coeffs.offset;
  color = clamp(color, 0.0, 1.0);

  return vec4(color, 1.0);
}

void paintField(out vec4 color, vec2 point, ShaderState state) {
  vec4 bgColor = vec4(0.0, 0.0, 0.0, 1.0);
  float speedCoeff = 2.;
  float breathCoeff = 0.1;
  float sizeCoeff = 5.;

  float t = speedCoeff * state.timeMs / 1000.0;

  vec4 colorLayer1 = cosineGradient(length(point) * 0.5 + t / 10.);
  vec4 colorLayer2 = cosineGradient(length(point) * 0.8 + t / 10.);
  
  vec4 col = mix(
    bgColor,
    colorLayer1,
    circle(
      fract(point * sizeCoeff + vec2(0.5)),
      addSinusoid(t, breathCoeff, 1.0, 0.0, 0.3)
     )
  );

  col = mix(
    col,
    bgColor,
    circle(
      fract(point * sizeCoeff + vec2(0.5)),
      addSinusoid(t, breathCoeff, 1.0, 0.0, 0.1)
    )
  );

  col = mix(
    col,
    colorLayer2,
    circle(
      fract(point * sizeCoeff),
      addSinusoid(t, breathCoeff, 1.0, PI, 0.1)
    )
  );
  
  col = mix(
    col,
    bgColor,
    circle(
      fract(point * sizeCoeff),
      addSinusoid(t, breathCoeff, 1.0, PI, 0.01)
    )
  );

  color = col;
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
