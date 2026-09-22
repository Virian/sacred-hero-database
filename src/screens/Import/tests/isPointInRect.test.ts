import { describe, expect, it } from 'vitest';

import { isPointInRect } from '../isPointInRect';

const rect = {
  left: 10,
  top: 20,
  right: 110,
  bottom: 220,
} as DOMRect;

describe('isPointInRect', () => {
  it.each([
    {
      description: 'accepts a point inside the rectangle',
      point: { x: 60, y: 120 },
      expected: true,
    },
    {
      description: 'accepts points on the rectangle boundaries',
      point: { x: 10, y: 20 },
      expected: true,
    },
    {
      description: 'accepts a point on the bottom-right corner',
      point: { x: 110, y: 220 },
      expected: true,
    },
    {
      description: 'rejects a point to the left',
      point: { x: 9, y: 120 },
      expected: false,
    },
    {
      description: 'rejects a point above',
      point: { x: 60, y: 19 },
      expected: false,
    },
    {
      description: 'rejects a point to the right',
      point: { x: 111, y: 120 },
      expected: false,
    },
    {
      description: 'rejects a point below',
      point: { x: 60, y: 221 },
      expected: false,
    },
  ])('$description', ({ point, expected }) => {
    const result = isPointInRect(point, rect);

    expect(result).toBe(expected);
  });

  it('accepts the only point in a zero-size rectangle', () => {
    const zeroSizeRect = {
      left: 50,
      top: 75,
      right: 50,
      bottom: 75,
    } as DOMRect;

    const result = isPointInRect({ x: 50, y: 75 }, zeroSizeRect);

    expect(result).toBe(true);
  });
});
