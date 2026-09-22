export const isPointInRect = (point: { x: number; y: number }, rect: DOMRect) =>
  point.x >= rect.left &&
  point.x <= rect.right &&
  point.y >= rect.top &&
  point.y <= rect.bottom;
