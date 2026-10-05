import { useState } from 'react';
import { Info } from 'lucide-react';

import { Button, Modal, Spinner } from '..';
import type { CharacterClass } from '../../enums';
import { useActiveCharacters } from '../../hooks';

import styles from './AssignSelectedCharacterModal.module.scss';
import { EmptyCard } from './Card/EmptyCard';
import { CharacterCard } from './Card/CharacterCard';
import { Overview } from './Overview/Overview';

interface AssignSelectedCharacterModalProps {
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (slotIndex: number, isEmptySlot: boolean) => void;
  character: {
    name: string;
    level: number;
    characterClass: CharacterClass;
    isHardcore: boolean;
    deathCount: number;
    survivalBonus: number;
    playTime: number;
  };
}

export const AssignSelectedCharacterModal = ({
  isLoading = false,
  isOpen,
  onClose,
  onAssign,
  character,
}: AssignSelectedCharacterModalProps) => {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const { activeCharacters, isLoading: isLoadingCharacters } =
    useActiveCharacters();

  const isEmptySlotSelected =
    selectedSlot !== null && !activeCharacters[selectedSlot];

  const handleAssign = () => {
    if (selectedSlot !== null) {
      onAssign(selectedSlot, isEmptySlotSelected);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Character to Slot"
    >
      {isLoadingCharacters ? (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      ) : (
        <div className={styles.container}>
          <span className={styles.subtitle}>
            Choose the slot where you want to assign the character.
          </span>
          <Overview
            name={character.name}
            characterClass={character.characterClass}
            level={character.level}
            isHardcore={character.isHardcore}
            deathCount={character.deathCount}
            survivalBonus={character.survivalBonus}
            playTime={character.playTime}
          />
          <h3 className={styles.gridHeader}>Available Slots</h3>
          <div className={styles.slotsGrid}>
            {activeCharacters.map((character, index) =>
              character ? (
                <CharacterCard
                  key={character.id}
                  slotNumber={index + 1}
                  characterClass={character.characterClass}
                  name={character.name}
                  level={character.level}
                  isActive={selectedSlot === index}
                  onClick={() => setSelectedSlot(index)}
                />
              ) : (
                <EmptyCard
                  key={index + 1}
                  slotNumber={index + 1}
                  isActive={selectedSlot === index}
                  onClick={() => setSelectedSlot(index)}
                />
              ),
            )}
          </div>
          <div className={styles.information}>
            <div className={styles.informationIconWrapper}>
              <Info size={16} />
            </div>
            <span className={styles.informationText}>
              Assigning a character will replace the current character in the
              selected slot. The replaced character will be automatically backed
              up first.
            </span>
          </div>
          <div className={styles.buttons}>
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={selectedSlot === null}
              isLoading={isLoading}
              onClick={handleAssign}
            >
              Assign
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
