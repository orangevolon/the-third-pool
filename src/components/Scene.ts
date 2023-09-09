import vsSource from '../shaders/shader.vs';
import fsSource from '../shaders/shader.fs';

import { Canvas } from './Canvas';
import { resetScene } from '../utils/resetScene';
import { initProgram } from '../utils/initProgram';
import { Component } from './types';

interface Props {
  width: number;
  height: number;
}

export function Scene({ width, height }: Props): Component {
  const canvas = Canvas({
    width,
    height,
  });

  const createVertexIds = (
    gl: WebGL2RenderingContext,
    shaderProgram: WebGLProgram
  ) => {
    const vertexIds = new Float32Array(width * height);

    for (let vertexIndex = 0; vertexIndex < vertexIds.length; vertexIndex++) {
      vertexIds[vertexIndex] = vertexIndex;
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexIds, gl.STATIC_DRAW);

    const aVertexId = gl.getAttribLocation(shaderProgram, 'aVertexId');
    gl.vertexAttribPointer(aVertexId, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexId);

    return vertexIds;
  };

  const setUniforms = (
    gl: WebGL2RenderingContext,
    shaderProgram: WebGLProgram
  ) => {
    const resolution = gl.getUniformLocation(shaderProgram, 'resolution');
    gl.uniform2f(resolution, width, height);
  };

  const onMount = () => {
    const gl = canvas.getContext('webgl2');

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    const program = initProgram(gl, vsSource, fsSource);
    resetScene(gl);
    setUniforms(gl, program);

    const vertices = createVertexIds(gl, program);
    gl.drawArrays(gl.POINTS, 0, vertices.length);
  };

  return {
    element: canvas,
    onMount,
  };
}
