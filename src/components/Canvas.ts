interface Props {
  width: number;
  height: number;
}

export function Canvas({ width, height }: Props) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
