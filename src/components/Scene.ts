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
  let vertexBuffer: WebGLBuffer;

  const prepareScene = () => {
    const webglContext = canvas.getContext('webgl2');
    if (!webglContext) throw new Error('WebGL not supported');
    gl = webglContext;

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');
    vertexBuffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    program = initProgram(gl, vsSource, fsSource);

    resetScene(gl);
  };

  const createVertices = (width: number, height: number) => {
    const vertexIds = new Float32Array(width * height);

    for (let vertexIndex = 0; vertexIndex < vertexIds.length; vertexIndex++) {
      vertexIds[vertexIndex] = vertexIndex;
    }

    return vertexIds;
  };

  const setVertices = (vertices: Float32Array) => {
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aVertexId = gl.getAttribLocation(program, 'aVertexId');
    gl.vertexAttribPointer(aVertexId, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexId);
  };

  const setResolution = (width: number, height: number) => {
    const resolution = gl.getUniformLocation(program, 'resolution');
    gl.uniform2f(resolution, width, height);
  };

  const renderScene = (width: number, height: number) => {
    const vertices = createVertices(width, height);

    requestAnimationFrame(() => {
      setVertices(vertices);
      setResolution(width, height);
      gl.drawArrays(gl.POINTS, 0, vertices.length);
    });
  };

  const onMount = () => {
    prepareScene();
    renderScene(width, height);
  };

  const onUnmount = () => {
    gl.deleteBuffer(vertexBuffer);
    gl.deleteProgram(program);
  };

  const onUpdate = ({ width, height }: Props) => {
    canvas.width = width;
    canvas.height = height;
  };

  return {
    element: canvas,
    onMount,
    onUnmount,
    onUpdate,
  };
}
