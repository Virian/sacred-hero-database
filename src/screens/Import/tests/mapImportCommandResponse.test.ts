import { describe, expect, it } from 'vitest';

import type { ImportCharactersCommandResponse } from '../../../types';
import { mapImportCommandResponse } from '../mapImportCommandResponse';

describe('mapImportCommandResponse', () => {
  it('maps successful imports to imported file rows', () => {
    // given
    const response: ImportCharactersCommandResponse = [
      {
        status: 'success',
        file_name: 'Hero00.pax',
        character_class: 'Wood Elf',
      },
    ];

    // when
    const result = mapImportCommandResponse(response);

    // then
    expect(result).toEqual([
      {
        status: 'success',
        fileName: 'Hero00.pax',
        characterClass: 'Wood Elf',
      },
    ]);
  });

  it('maps skipped imports while preserving their character class', () => {
    // given
    const response: ImportCharactersCommandResponse = [
      {
        status: 'skipped',
        file_name: 'Hero01.pax',
        character_class: 'Gladiator',
      },
    ];

    // when
    const result = mapImportCommandResponse(response);

    // then
    expect(result).toEqual([
      {
        status: 'skipped',
        fileName: 'Hero01.pax',
        characterClass: 'Gladiator',
      },
    ]);
  });

  it('maps import errors to rows with an error message', () => {
    // given
    const response: ImportCharactersCommandResponse = [
      {
        status: 'error',
        file_name: 'invalid.pax',
        error: 'Not a Sacred Underworld PAX file',
      },
    ];

    // when
    const result = mapImportCommandResponse(response);

    // then
    expect(result).toEqual([
      {
        status: 'error',
        fileName: 'invalid.pax',
        message: 'Not a Sacred Underworld PAX file',
      },
    ]);
  });

  it('preserves the response order', () => {
    // given
    const response: ImportCharactersCommandResponse = [
      {
        status: 'success',
        file_name: 'Hero00.pax',
        character_class: 'Wood Elf',
      },
      {
        status: 'skipped',
        file_name: 'Hero01.pax',
        character_class: 'Gladiator',
      },
      {
        status: 'error',
        file_name: 'invalid.pax',
        error: 'Invalid save file',
      },
    ];

    // when
    const result = mapImportCommandResponse(response);

    // then
    expect(result.map(({ fileName }) => fileName)).toEqual([
      'Hero00.pax',
      'Hero01.pax',
      'invalid.pax',
    ]);
  });
});
