import { Commands } from '../../enums';
import { useInvokeQuery } from '../../hooks';
import type { GetAllCharactersCountCommandResponse } from '../../types';

import { CharactersCountContext } from './CharactersCountContext';

interface CharactersCountProviderProps {
  children: React.ReactNode;
}

export const CharactersCountProvider = ({
  children,
}: CharactersCountProviderProps) => {
  const { data: charactersCount, refetch } =
    useInvokeQuery<GetAllCharactersCountCommandResponse>({
      command: Commands.GET_ALL_CHARACTERS_COUNT,
    });

  return (
    <CharactersCountContext.Provider
      value={{ charactersCount: charactersCount || 0, refetch }}
    >
      {children}
    </CharactersCountContext.Provider>
  );
};
