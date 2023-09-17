import vsSource from '../shaders/shader.vs';
import fsSource from '../shaders/shader.fs';

import { initProgram } from '../utils/initProgram';
import { Component } from './Component';
import { resetScene } from '../utils/resetScene';
import { Canvas } from './Canvas';
import { mapToConfiningRect } from '../utils/mapToRect';
import { SurfaceTouchEvent } from './types';
import { TouchEventsList } from './TouchPoints';

interface Props {
  width: number;
  height: number;
  time: number;
  touchEvent?: SurfaceTouchEvent;
}

const MAX_TOUCH_EVENTS = 100;

export class Scene extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.touchEvents = new TouchEventsList(MAX_TOUCH_EVENTS);
  }

  canvas: HTMLCanvasElement | undefined;
  program: WebGLProgram | undefined;
  vertexBuffer: WebGLBuffer | undefined;
  touchEvents: TouchEventsList;

  get gl(): WebGL2RenderingContext {
    if (!this.canvas) throw new Error('Canvas not initialized');
    const webglContext = this.canvas.getContext('webgl2');
    if (!webglContext) throw new Error('WebGL not supported');
    return webglContext;
  }

  private prepareScene() {
    const buffer = this.gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.vertexBuffer = buffer;

    this.program = initProgram(this.gl, vsSource, fsSource);

    resetScene(this.gl);
  }

  private createVertices() {
    const vertexIds = new Float32Array(this.props.width * this.props.height);

    for (let vertexIndex = 0; vertexIndex < vertexIds.length; vertexIndex++) {
      vertexIds[vertexIndex] = vertexIndex;
    }

    return vertexIds;
  }

  private setVertices(vertices: Float32Array) {
    if (!this.program) throw new Error('Program not initialized');

    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    const aVertexId = this.gl.getAttribLocation(this.program, 'aVertexId');

    this.gl.vertexAttribPointer(aVertexId, 1, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(aVertexId);
  }

  private setResolution(width: number, height: number) {
    if (!this.program) throw new Error('Program not initialized');
    const resolution = this.gl.getUniformLocation(this.program, 'resolution');
    this.gl.uniform2f(resolution, width, height);
  }

  private setTime(time: number) {
    if (!this.program) throw new Error('Program not initialized');
    const uTime = this.gl.getUniformLocation(this.program, 'time');
    this.gl.uniform1f(uTime, time);
  }

  private setTouchEvents() {
    if (!this.program) throw new Error('Program not initialized');
    const uMousePosition = this.gl.getUniformLocation(
      this.program,
      'touchEvent'
    );
    this.gl.uniform3fv(uMousePosition, this.touchEvents.getData());
  }

  public addTouchEvent(touchEvent: SurfaceTouchEvent) {
    if (!this.canvas) throw new Error('Canvas not initialized');

    const canvasSize = this.canvas.getBoundingClientRect();
    const renderSize = { width: this.props.width, height: this.props.height };

    const mappedMousePosition = mapToConfiningRect(
      touchEvent,
      canvasSize,
      renderSize
    );

    this.touchEvents.add({ ...touchEvent, ...mappedMousePosition });
  }


  override mount() {
    this.canvas = new Canvas({
      width: this.props.width,
      height: this.props.height,
      id: 'scene',
    }).mount();

    this.prepareScene();
    this.setTouchEvents();

    return this.canvas;
  }

  override unmount() {
    if (this.vertexBuffer) {
      this.gl.deleteBuffer(this.vertexBuffer);
    }

    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
  }

  override render() {
    if (!this.canvas) throw new Error('Canvas not initialized');
    const { width, height, time } = this.props;

    const vertices = this.createVertices();
    this.setVertices(vertices);
    this.setResolution(width, height);
    this.setTime(time);
    this.setTouchEvents();

    requestAnimationFrame(() => {
      this.gl.drawArrays(this.gl.POINTS, 0, vertices.length);
    });
  }
}
