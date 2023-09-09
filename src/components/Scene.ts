import vsSource from '../shaders/shader.vs';
import fsSource from '../shaders/shader.fs';

import { Canvas } from './Canvas';
import { resetScene } from '../utils/resetScene';
import { initProgram } from '../utils/initProgram';
import { Component } from './types';

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

    initProgram(gl, vsSource, fsSource);
    resetScene(gl);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.drawElements(gl.TRIANGLES, 0, gl.UNSIGNED_SHORT, 0);
  };

  return {
    element: canvas,
    onMount,
  };
}
