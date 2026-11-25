import { describe, expect, it } from 'vitest';

import { getErrorMessage } from '../getErrorMessage';

describe('getErrorMessage', () => {
  it('returns the message from Error instances', () => {
    // given
    const error = new Error('Something failed');

    // when
    const message = getErrorMessage(error);

    // then
    expect(message).toBe('Something failed');
  });

  it('converts non-Error values to strings', () => {
    // given
    const error = 42;

    // when
    const message = getErrorMessage(error);

    // then
    expect(message).toBe('42');
  });
});
