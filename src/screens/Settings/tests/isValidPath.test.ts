import { describe, expect, it } from 'vitest';

import { isValidPath } from '../isValidPath';

describe('isValidPath', () => {
  it.each([
    {
      description: 'accepts a valid Windows drive path',
      path: 'C:\\Games\\Sacred\\Hero',
      expected: true,
    },
    {
      description: 'rejects a Windows drive path ending in a dot',
      path: 'C:\\Games\\Bad.',
      expected: false,
    },
    {
      description: 'rejects a Windows drive path with invalid characters',
      path: 'C:\\Games\\Bad<name>',
      expected: false,
    },
    {
      description: 'accepts a valid UNC path',
      path: '\\\\server\\share\\folder',
      expected: true,
    },
    {
      description: 'rejects a UNC path without a share name',
      path: '\\\\server',
      expected: false,
    },
    {
      description: 'accepts a valid POSIX path',
      path: '/var/games/sacred',
      expected: true,
    },
    {
      description: 'rejects a relative POSIX path',
      path: 'relative/path',
      expected: false,
    },
    {
      description: 'rejects a POSIX path with a control character',
      path: '/var/games/bad\npath',
      expected: false,
    },
  ])('$description', ({ path, expected }) => {
    // given
    const input = path;

    // when
    const result = isValidPath(input);

    // then
    expect(result).toBe(expected);
  });
});
