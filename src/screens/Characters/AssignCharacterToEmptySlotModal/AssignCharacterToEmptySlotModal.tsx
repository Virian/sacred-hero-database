import { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

import { Button, Input, Modal, Spinner } from '../../../components';
import type { MappedCharacter } from '../../../hooks';

import styles from './AssignCharacterToEmptySlotModal.module.scss';
import { CharacterRow } from './CharacterRow';

interface AssignCharacterToEmptySlotModalProps {
  isLoading?: boolean;
  isLoadingCharacters: boolean;
  characters: MappedCharacter[];
  isOpen: boolean;
  onClose: () => void;
  onAssign?: (characterVersionId?: string) => void;
}

export const AssignCharacterToEmptySlotModal = ({
  isLoading = false,
  isLoadingCharacters,
  characters,
  isOpen,
  onClose,
  onAssign,
}: AssignCharacterToEmptySlotModalProps) => {
  const [selectedCharacter, setSelectedCharacter] =
    useState<MappedCharacter | null>(null);
  const [searchPhrase, setSearchPhrase] = useState('');
  const [filteredCharacters, setFilteredCharacters] = useState<
    MappedCharacter[]
  >([]);

  useEffect(() => {
    // won't cause cascading re-renders
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchPhrase('');
    setFilteredCharacters(characters);
  }, [characters]);

  useEffect(() => {
    if (!isOpen) {
      // won't cause cascading re-renders
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCharacter(null);
      setSearchPhrase('');
      setFilteredCharacters(characters);
    }
  }, [isOpen, characters]);

  const handleSelectCharacter = (characterId: string) => {
    const clickedCharacter = characters.find(({ id }) => id === characterId);
    setSelectedCharacter(clickedCharacter || null);
  };

  const filterCharacters = useCallback(
    (phrase: string) => {
      const normalizedPhrase = phrase.trim().toLocaleLowerCase();

      if (!normalizedPhrase) {
        setFilteredCharacters(characters);
        return;
      }

      const results = characters.filter(
        (character) =>
          character.name.toLocaleLowerCase().includes(normalizedPhrase) ||
          character.characterClass
            .toLocaleLowerCase()
            .includes(normalizedPhrase),
      );

      if (
        selectedCharacter &&
        !results.some((character) => character.id === selectedCharacter.id)
      ) {
        results.push(selectedCharacter);
      }

      setFilteredCharacters(results);
    },
    [characters, selectedCharacter],
  );

  const debouncedFilterCharacters = useMemo(
    () => debounce(filterCharacters, 300),
    [filterCharacters],
  );

  useEffect(
    () => () => {
      debouncedFilterCharacters.cancel();
    },
    [debouncedFilterCharacters],
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchPhrase(newValue);
    debouncedFilterCharacters(newValue);
  };

  return (
    <Modal
      className={styles.modal}
      contentClassName={styles.modalContent}
      isOpen={isOpen}
      onClose={onClose}
      title="Select character"
    >
      {isLoadingCharacters ? (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      ) : (
        <div className={styles.container}>
          {characters.length ? (
            <>
              <span className={styles.subtitle}>
                Select a character from your database to fill this empty slot.
              </span>
              <Input
                className={styles.searchInput}
                placeholder="Search by name or class"
                value={searchPhrase}
                onChange={handleSearchChange}
              />
              {filteredCharacters.length ? (
                <ul className={styles.list}>
                  {filteredCharacters.map((character) => (
                    <CharacterRow
                      key={character.id}
                      isSelected={selectedCharacter?.id === character.id}
                      id={character.id}
                      characterClass={character.characterClass}
                      name={character.name}
                      level={character.level || 0}
                      modifiedAt={character.modifiedAt}
                      onClick={handleSelectCharacter}
                    />
                  ))}
                </ul>
              ) : (
                <span className={styles.noResults}>No characters found.</span>
              )}
            </>
          ) : (
            <span className={styles.noResults}>No characters available.</span>
          )}

          <div className={styles.buttons}>
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={selectedCharacter === null}
              isLoading={isLoading}
              onClick={() => {
                if (selectedCharacter && onAssign) {
                  onAssign(selectedCharacter.versionId);
                }
              }}
            >
              Assign
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
