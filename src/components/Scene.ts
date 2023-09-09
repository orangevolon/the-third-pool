import vsSource from '../shaders/shader.vs';
import fsSource from '../shaders/shader.fs';

import { Canvas } from './Canvas';
import { resetScene } from '../utils/resetScene';
import { initProgram } from '../utils/initProgram';
import { Component } from './types';

const TEST_POSITIONS = [
  // point 1
  0, 0,
  // point 2
  0, 0.5,
  // point 3
  0.5, 0,
];

export function Scene(): Component {
  const canvas = Canvas({
    width: 600,
    height: 400,
  });

  const onMount = () => {
    const gl = canvas.getContext('webgl2');

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    const program = initProgram(gl, vsSource, fsSource);
    resetScene(gl);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2]),
      gl.STATIC_DRAW
    );

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(TEST_POSITIONS),
      gl.STATIC_DRAW
    );

    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);

    gl.drawElements(gl.POINTS, 3, gl.UNSIGNED_SHORT, 0);
  };

  return {
    element: canvas,
    onMount,
  };
}
