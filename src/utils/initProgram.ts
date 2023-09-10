import { loadShader } from './loadShader';

export function initProgram(
  gl: WebGL2RenderingContext,
  vsSource: VertexShader,
  fsSource: FragmentShader
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) {
    throw new Error('Unable to create shader program');
  }

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
  }

  gl.useProgram(shaderProgram);

  return shaderProgram;
}
