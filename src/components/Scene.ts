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

export function Scene({ width, height }: Props): Component<Props> {
  const canvas = Canvas({
    width,
    height,
  });

  let gl: WebGL2RenderingContext;
  let program: WebGLProgram;

  const createVertexIds = () => {
    const vertexIds = new Float32Array(width * height);

    for (let vertexIndex = 0; vertexIndex < vertexIds.length; vertexIndex++) {
      vertexIds[vertexIndex] = vertexIndex;
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexIds, gl.STATIC_DRAW);

    const aVertexId = gl.getAttribLocation(program, 'aVertexId');
    gl.vertexAttribPointer(aVertexId, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexId);

    return vertexIds;
  };

  const setResolution = (width: number, height: number) => {
    const resolution = gl.getUniformLocation(program, 'resolution');
    gl.uniform2f(resolution, width, height);
  };

  const onMount = () => {
    const webglContext = canvas.getContext('webgl2');

    if (!webglContext) {
      throw new Error('WebGL not supported');
    }

    gl = webglContext;

    program = initProgram(gl, vsSource, fsSource);
    resetScene(gl);
    setResolution(width, height);

    const vertices = createVertexIds();
    gl.drawArrays(gl.POINTS, 0, vertices.length);
  };

  const onUpdate = ({ width, height }: Props) => {
    setResolution(width, height);
    canvas.width = width;
    canvas.height = height;
  };

  return {
    element: canvas,
    onMount,
    onUpdate,
  };
}
