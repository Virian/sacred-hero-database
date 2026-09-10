import { useState } from 'react';
import { ArrowUpDown, Save } from 'lucide-react';

import { Button } from '../../components';
import { CharacterClass } from '../../enums';
import { CharacterCard, EmptyCharacterCard } from './CharacterCard';
import styles from './Characters.module.scss';

const MOCK_CHARACTERS = [
  {
    id: '1',
    name: 'Ares',
    characterClass: CharacterClass.GLADIATOR,
    level: 42,
    isHardcore: true,
    deathCount: 0,
    survivalBonus: 38,
    playTime: 45240, // in seconds
    modifiedAt: new Date(),
    version: 1,
  },
  {
    id: '2',
    name: 'Seraphina',
    characterClass: CharacterClass.SERAPHIM,
    level: 37,
    isHardcore: false,
    deathCount: 2,
    survivalBonus: 95,
    playTime: 33120, // in seconds
    modifiedAt: new Date(),
    version: 1,
  },
  {
    id: '3',
    name: 'Shadow',
    characterClass: CharacterClass.DARK_ELF,
    level: 28,
    isHardcore: false,
    deathCount: 0,
    survivalBonus: 76,
    playTime: 24300, // in seconds
    modifiedAt: new Date(),
    version: 1,
  },
  {
    id: '4',
    name: 'Sylvan',
    characterClass: CharacterClass.WOOD_ELF,
    level: 31,
    isHardcore: true,
    deathCount: 0,
    survivalBonus: 84,
    playTime: 28320, // in seconds
    modifiedAt: new Date(),
    version: 1,
  },
  {
    id: '5',
    name: 'Merlin',
    characterClass: CharacterClass.BATTLE_MAGE,
    level: 40,
    isHardcore: false,
    deathCount: 12,
    survivalBonus: 5,
    playTime: 40860, // in seconds
    modifiedAt: new Date(),
    version: 1,
  },
  {
    id: '6',
    name: 'Vladis',
    characterClass: CharacterClass.VAMPIRESS,
    level: 26,
    isHardcore: false,
    deathCount: 0,
    survivalBonus: 64,
    playTime: 19980, // in seconds
    modifiedAt: new Date(),
    version: 1,
  },
];

export const Characters = () => {
  const [activeCharacterSlot, setActiveCharacterSlot] = useState<number | null>(
    null,
  );

  const handleCharacterCardClick = (slotNumber: number) => {
    setActiveCharacterSlot(() =>
      activeCharacterSlot === slotNumber ? null : slotNumber,
    );
  };

  return (
    <div className={styles.container}>
      <h1>Characters</h1>
      <h2 className={styles.subheading}>Active character slots (1 - 8)</h2>
      <div className={styles.characters}>
        <CharacterCard
          cardNumber={1}
          isActive={activeCharacterSlot === 1}
          character={MOCK_CHARACTERS[0]}
          onClick={() => handleCharacterCardClick(1)}
        />
        <CharacterCard
          cardNumber={2}
          isActive={activeCharacterSlot === 2}
          character={MOCK_CHARACTERS[1]}
          onClick={() => handleCharacterCardClick(2)}
        />
        <CharacterCard
          cardNumber={3}
          isActive={activeCharacterSlot === 3}
          character={MOCK_CHARACTERS[2]}
          onClick={() => handleCharacterCardClick(3)}
        />
        <CharacterCard
          cardNumber={4}
          isActive={activeCharacterSlot === 4}
          character={MOCK_CHARACTERS[3]}
          onClick={() => handleCharacterCardClick(4)}
        />
        <CharacterCard
          cardNumber={5}
          isActive={activeCharacterSlot === 5}
          character={MOCK_CHARACTERS[4]}
          onClick={() => handleCharacterCardClick(5)}
        />
        <CharacterCard
          cardNumber={6}
          isActive={activeCharacterSlot === 6}
          character={MOCK_CHARACTERS[5]}
          onClick={() => handleCharacterCardClick(6)}
        />
        <EmptyCharacterCard cardNumber={7} />
        <EmptyCharacterCard cardNumber={8} />
      </div>
      <div className={styles.actions}>
        <Button variant="secondary">
          <span className={styles.buttonText}>
            <ArrowUpDown size={16} />
            Change Order
          </span>
        </Button>
        <Button
          variant="secondary"
          disabled={activeCharacterSlot === null}
        >
          <span className={styles.buttonText}>
            <Save size={16} />
            Backup
          </span>
        </Button>
      </div>
    </div>
  );
};
