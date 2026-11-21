import type { MappedCharacter } from '../../../hooks';

interface FilterCharactersByPhraseParams {
  phrase: string;
  characters: MappedCharacter[];
  selectedCharacter?: MappedCharacter | null;
}

export const filterCharactersByPhrase = ({
  phrase,
  characters,
  selectedCharacter,
}: FilterCharactersByPhraseParams) => {
  const normalizedPhrase = phrase.trim().toLocaleLowerCase();

  if (!normalizedPhrase) {
    return characters;
  }

  const results = characters.filter(
    (character) =>
      character.name.toLocaleLowerCase().includes(normalizedPhrase) ||
      character.characterClass.toLocaleLowerCase().includes(normalizedPhrase),
  );

  if (
    selectedCharacter &&
    !results.some((character) => character.id === selectedCharacter.id)
  ) {
    results.push(selectedCharacter);
  }

  return results;
};
