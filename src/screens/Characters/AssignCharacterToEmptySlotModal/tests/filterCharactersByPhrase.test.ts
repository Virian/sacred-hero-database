import { describe, expect, it } from 'vitest';

import { CharacterClass } from '../../../../enums';
import type { MappedCharacter } from '../../../../hooks';

import { filterCharactersByPhrase } from '../filterCharactersByPhrase';

const seraphimCharacter: MappedCharacter = {
  id: 'character-1',
  name: 'Aria',
  characterClass: CharacterClass.SERAPHIM,
  versionCount: 2,
};

const gladiatorCharacter: MappedCharacter = {
  id: 'character-2',
  name: 'Brutus',
  characterClass: CharacterClass.GLADIATOR,
  versionCount: 1,
};

const characters = [seraphimCharacter, gladiatorCharacter];

describe('filterCharactersByPhrase', () => {
  it.each([
    {
      description: 'filters by character name case-insensitively',
      phrase: 'aRi',
      expected: [seraphimCharacter],
    },
    {
      description: 'filters by character class case-insensitively',
      phrase: 'GLAD',
      expected: [gladiatorCharacter],
    },
  ])('$description', ({ phrase, expected }) => {
    // given
    const input = characters;

    // when
    const result = filterCharactersByPhrase({ phrase, characters: input });

    // then
    expect(result).toEqual(expected);
  });

  it('returns all characters for an empty or whitespace-only phrase', () => {
    // given
    const input = '   ';

    // when
    const result = filterCharactersByPhrase({
      phrase: input,
      characters,
    });

    // then
    expect(result).toBe(characters);
  });

  it('includes the selected character even when it does not match', () => {
    // given
    const selectedCharacter = gladiatorCharacter;

    // when
    const result = filterCharactersByPhrase({
      phrase: 'aria',
      characters,
      selectedCharacter,
    });

    // then
    expect(result).toEqual([seraphimCharacter, gladiatorCharacter]);
  });

  it('does not duplicate a selected character that already matches', () => {
    // given
    const selectedCharacter = seraphimCharacter;

    // when
    const result = filterCharactersByPhrase({
      phrase: 'seraphim',
      characters,
      selectedCharacter,
    });

    // then
    expect(result).toEqual([seraphimCharacter]);
  });

  it('returns an empty list when nothing matches and no character is selected', () => {
    // when
    const result = filterCharactersByPhrase({
      phrase: 'missing',
      characters,
    });

    // then
    expect(result).toEqual([]);
  });
});
