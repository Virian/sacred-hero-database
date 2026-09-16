import { RefreshCw } from 'lucide-react';

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
  return (
    <div className={styles.container}>
      <h1>Characters</h1>
      <h2 className={styles.subheading}>Active character slots (1 - 8)</h2>
      <div className={styles.characters}>
        <CharacterCard
          cardNumber={1}
          character={MOCK_CHARACTERS[0]}
        />
        <CharacterCard
          cardNumber={2}
          character={MOCK_CHARACTERS[1]}
        />
        <CharacterCard
          cardNumber={3}
          character={MOCK_CHARACTERS[2]}
        />
        <CharacterCard
          cardNumber={4}
          character={MOCK_CHARACTERS[3]}
        />
        <CharacterCard
          cardNumber={5}
          character={MOCK_CHARACTERS[4]}
        />
        <CharacterCard
          cardNumber={6}
          character={MOCK_CHARACTERS[5]}
        />
        <EmptyCharacterCard cardNumber={7} />
        <EmptyCharacterCard cardNumber={8} />
      </div>
      <div className={styles.actions}>
        <Button variant="secondary">
          <span className={styles.buttonText}>
            <RefreshCw size={16} />
            Refresh
          </span>
        </Button>
      </div>
    </div>
  );
};
