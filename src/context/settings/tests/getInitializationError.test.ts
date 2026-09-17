import { describe, expect, it } from 'vitest';

import { getInitializationError } from '../getInitializationError';

describe('getInitializationError', () => {
  it('returns null when the error value is falsy', () => {
    // given
    const error = null;

    // when
    const result = getInitializationError(error);

    // then
    expect(result).toBeNull();
  });

  it('returns the error message when the value is an Error instance', () => {
    // given
    const error = new Error('Settings file is invalid.');

    // when
    const result = getInitializationError(error);

    // then
    expect(result).toBe('Settings file is invalid.');
  });

  it('returns the original string when the value is a string', () => {
    // given
    const error = 'Could not initialize settings.';

    // when
    const result = getInitializationError(error);

    // then
    expect(result).toBe('Could not initialize settings.');
  });

  it('returns a fallback message for unknown error objects', () => {
    // given
    const error = { code: 500 };

    // when
    const result = getInitializationError(error);

    // then
    expect(result).toBe('An error occurred.');
  });
});
