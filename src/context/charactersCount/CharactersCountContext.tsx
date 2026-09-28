import { createContext } from 'react';

interface CharactersCountContextProps {
  charactersCount: number;
  refetch: () => Promise<void>;
}

export const CharactersCountContext =
  createContext<CharactersCountContextProps>({
    charactersCount: 0,
    refetch: async () => {},
  });
