import { useContext, useMemo } from 'react';

import { SettingsContext } from '../../context';
import { Commands } from '../../enums';
import { useInvokeQuery } from '../../hooks';
import type { GetActiveCharactersCommandResponse } from '../../types';
import { stripCharacterFormatting } from '../../utils';

import type { ActiveCharacter } from './Characters.types';

export const useActiveCharacters = () => {
  const {
    settings: { activeCharacterSlots },
  } = useContext(SettingsContext);

  const { data, isLoading, isFetching, refetch } = useInvokeQuery<
    GetActiveCharactersCommandResponse,
    Array<ActiveCharacter | null>
  >({
    command: Commands.GET_ACTIVE_CHARACTERS,
    mapper: (data) =>
      data.map(({ character, slot }) =>
        character
          ? {
              id: `${slot}`,
              name: stripCharacterFormatting(character.name),
              characterClass: character.class,
              level: character.level,
              isHardcore: character.hardcore,
              deathCount: character.revivals,
              survivalBonus: character.survival_bonus,
              playTime: character.play_time.secs,
              modifiedAt: new Date(character.modified.secs_since_epoch * 1000),
            }
          : null,
      ),
  });

  const activeCharacters: Array<ActiveCharacter | null> = useMemo(() => {
    const baseArray = new Array(activeCharacterSlots).fill(null);

    return baseArray.map((_, index) => {
      const slotNumber = `${index + 1}`;
      return (
        (data || []).find((character) => character?.id === slotNumber) || null
      );
    });
  }, [activeCharacterSlots, data]);

  return { activeCharacters, isLoading, isFetching, refetch };
};
