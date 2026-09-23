import { describe, expect, it } from 'vitest';

import { stripCharacterFormatting } from '../stripCharacterFormatting';

describe('stripCharacterFormatting', () => {
  it.each([
    {
      description: 'removes escaped color formatting codes from a name',
      value: '\\cff0000ffName\\c12345678',
      expected: 'Name',
    },
    {
      description: 'removes escaped color formatting codes from a name',
      value: '\\dff0000ffName\\d12345678',
      expected: 'Name',
    },
    {
      description: 'removes escaped color formatting codes from a name',
      value: '\\wff0000ffName\\w12345678',
      expected: 'Name',
    },
    {
      description: 'removes icon codes from a value',
      value: 'Character\\gffcc00ab0000024eName\\gac1234ff000000cf',
      expected: 'CharacterName',
    },
    {
      description: 'removes color reset markers from a string',
      value: 'Alpha\\rBeta\\rGamma',
      expected: 'AlphaBetaGamma',
    },
    {
      description: 'leaves strings without formatting markers unchanged',
      value: 'PlainName',
      expected: 'PlainName',
    },
  ])('$description', ({ value, expected }) => {
    // given
    const input = value;

    // when
    const result = stripCharacterFormatting(input);

    // then
    expect(result).toBe(expected);
  });
});
