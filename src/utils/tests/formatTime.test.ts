import { describe, expect, it } from 'vitest';

import { formatTime } from '../formatTime';

describe('formatTime', () => {
  it('formats zero seconds as 0 hours and 00 minutes', () => {
    // given
    const seconds = 0;

    // when
    const result = formatTime(seconds);

    // then
    expect(result).toBe('0h 00m');
  });

  it('formats values under one hour by keeping the remaining minutes', () => {
    // given
    const seconds = 125;

    // when
    const result = formatTime(seconds);

    // then
    expect(result).toBe('0h 02m');
  });

  it('formats one hour plus additional minutes correctly', () => {
    // given
    const seconds = 3661;

    // when
    const result = formatTime(seconds);

    // then
    expect(result).toBe('1h 01m');
  });

  it('formats multiple hours and minutes correctly', () => {
    // given
    const seconds = 12 * 60 * 60 + 34 * 60 + 56;

    // when
    const result = formatTime(seconds);

    // then
    expect(result).toBe('12h 34m');
  });
});
