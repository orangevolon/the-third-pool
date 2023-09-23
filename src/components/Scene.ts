import vsSource from '../shaders/shader.vs';
import fsSource from '../shaders/shader.fs';

import { initProgram } from '../utils/initProgram';
import { Component } from './Component';
import { resetScene } from '../utils/resetScene';
import { Canvas } from './Canvas';
import { mapToConfiningRect } from '../utils/mapToRect';
import { TouchEventsList } from './TouchPoints';
import { Point, Rect, TouchEvent } from './types';

interface Props {
  resolution: Rect;
  progress: number;
}

interface ShaderState {
  progress: number;
  timeMs: number;
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
  startTime: number | undefined;

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
    this.updateTouchEvents(this.touchEvents);
    this.updateResolution(this.props.resolution);
    this.updateVertices(this.props.resolution);
    this.startTime = Date.now();
  }

  private createVertices(width: number, height: number) {
    const vertexIds = new Float32Array(width * height);

    for (let vertexIndex = 0; vertexIndex < vertexIds.length; vertexIndex++) {
      vertexIds[vertexIndex] = vertexIndex;
    }

    return vertexIds;
  }

  private updateVertices(resolution: Rect) {
    if (!this.program) throw new Error('Program not initialized');

    const { width, height } = resolution;
    const vertices = this.createVertices(width, height);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    const aVertexId = this.gl.getAttribLocation(this.program, 'aVertexId');

    this.gl.vertexAttribPointer(aVertexId, 1, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(aVertexId);
  }

  private updateResolution(resolution: Rect) {
    if (!this.program) throw new Error('Program not initialized');

    const { width, height } = resolution;
    const uResolution = this.gl.getUniformLocation(this.program, 'resolution');
    this.gl.uniform2f(uResolution, width, height);
  }

  private updateState(state: ShaderState) {
    if (!this.program) throw new Error('Program not initialized');

    const { progress, timeMs } = state;
    const uTimeMs = this.gl.getUniformLocation(this.program, 'state.timeMs');
    this.gl.uniform1f(uTimeMs, timeMs);

    const uProgress = this.gl.getUniformLocation(
      this.program,
      'state.progress'
    );
    this.gl.uniform1f(uProgress, progress);
  }

  private updateTouchEvents(touchEvents: TouchEventsList, latest = false) {
    const update = (event: TouchEvent, index: number) => {
      if (!this.program) throw new Error('Program not initialized');
      const uPoint = this.gl.getUniformLocation(
        this.program,
        `touchEvents[${index}].point`
      );
      this.gl.uniform2f(uPoint, event.x, event.y);

      const uTime = this.gl.getUniformLocation(
        this.program,
        `touchEvents[${index}].timeMs`
      );
      this.gl.uniform1f(uTime, event.timeMs);
    };

    if (latest) {
      const { event, index } = touchEvents.latestEvent;
      update(event, index);
    } else {
      touchEvents.events.forEach((event, index) => update(event, index));
    }
  }

  public addTouchEvent(touchEvent: Point) {
    if (!this.canvas) throw new Error('Canvas not initialized');
    if (!this.startTime) throw new Error('Start time not initialized');

    const { resolution } = this.props;
    const canvasSize = this.canvas.getBoundingClientRect();
    const mappedMousePosition = mapToConfiningRect(
      touchEvent,
      canvasSize,
      resolution
    );

    this.touchEvents.add({
      x: mappedMousePosition.x,
      y: mappedMousePosition.y + this.props.progress,
      timeMs: Date.now() - this.startTime,
    });

    this.updateTouchEvents(this.touchEvents, true);
  }

  override mount() {
    const { width, height } = this.props.resolution;
    this.canvas = new Canvas({
      width,
      height,
      id: 'scene',
    }).mount();

    this.prepareScene();
    this.render();

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

  private render() {
    if (!this.canvas) throw new Error('Canvas not initialized');
    if (!this.startTime) throw new Error('Start time not initialized');

    // Update shader state
    const timeMs = Date.now() - this.startTime;
    this.updateState({
      progress: this.props.progress,
      timeMs,
    });

    // Draw
    const { width, height } = this.props.resolution;
    const drawSize = width * height;
    this.gl.drawArrays(this.gl.POINTS, 0, drawSize);

    requestAnimationFrame(this.render.bind(this));
  }
}
