import vsSource from '../shaders/shader.vs';
import fsSource from '../shaders/shader.fs';

import { loadShader } from '../utils/loadShader';
import { Canvas } from './Canvas';

export function Scene() {
  const canvas = Canvas();
  const gl = canvas.getContext('webgl2');

  if (!gl) {
    throw new Error('WebGL not supported');
  }

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

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  return canvas;
}
