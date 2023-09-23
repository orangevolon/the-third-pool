import { Point, Rect } from '../components/types';

// Fits only to center
export function mapToConfiningRect(
  point: Point,
  sourceRect: Rect,
  confiningRect: Rect
): Point {
  const sourceRectRatio = sourceRect.width / sourceRect.height;
  const confiningRectRatio = confiningRect.width / confiningRect.height;

  if (sourceRectRatio > confiningRectRatio) {
    const scale = confiningRect.width / sourceRect.width;
    const scaledHeight = sourceRect.height * scale;
    const y = (confiningRect.height - scaledHeight) / 2 + point.y * scale;

    return {
      x: point.x * scale,
      y,
    };
  } else {
    const scale = confiningRect.height / sourceRect.height;
    const scaledWidth = sourceRect.width * scale;
    const x = (confiningRect.width - scaledWidth) / 2 + point.x * scale;

    return {
      x,
      y: point.y * scale,
    };
  }
}
