export function Canvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;

  const webglContext = canvas.getContext('webgl2');

  if (!webglContext) {
    throw new Error('WebGL not supported');
  }

  return canvas;
}
