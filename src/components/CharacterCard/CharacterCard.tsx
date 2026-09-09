import clsx from 'clsx';

import BattleMagePortrait from '../../assets/battle-mage.webp';
import DaemonPortrait from '../../assets/daemon.webp';
import DarkElfPortrait from '../../assets/dark-elf.webp';
import DwarfPortrait from '../../assets/dwarf.webp';
import GladiatorPortrait from '../../assets/gladiator.webp';
import SeraphimPortrait from '../../assets/seraphim.webp';
import VampiressPortrait from '../../assets/vampiress.webp';
import WoodElfPortrait from '../../assets/wood-elf.webp';
import { CharacterClass } from '../../enums/CharacterClass';
import { Character } from '../../types';
import styles from './CharacterCard.module.scss';
import { formatTime } from './formatTime';

const characterPortraitsMap: Record<string, string> = {
  [CharacterClass.BATTLE_MAGE]: BattleMagePortrait,
  [CharacterClass.DAEMON]: DaemonPortrait,
  [CharacterClass.DARK_ELF]: DarkElfPortrait,
  [CharacterClass.DWARF]: DwarfPortrait,
  [CharacterClass.GLADIATOR]: GladiatorPortrait,
  [CharacterClass.SERAPHIM]: SeraphimPortrait,
  [CharacterClass.VAMPIRESS]: VampiressPortrait,
  [CharacterClass.WOOD_ELF]: WoodElfPortrait,
};

interface CharacterCardProps {
  cardNumber?: number;
  isActive?: boolean;
  character: Character;
  onClick?: () => void;
}

export const CharacterCard = ({
  cardNumber,
  isActive = false,
  character,
  onClick,
}: CharacterCardProps) => {
  return (
    <div
      className={clsx(styles.card, { [styles.active]: isActive })}
      onClick={onClick}
    >
      <div className={styles.content}>
        <span className={styles.cardNumber}>{cardNumber}</span>

        <div className={styles.portraitWrapper}>
          <img
            src={characterPortraitsMap[character.class]}
            alt={`${character.class} portrait`}
            className={styles.portrait}
          />
        </div>

        <div className={styles.characterInfo}>
          <h3 className={styles.characterName}>{character.name}</h3>
          <p className={styles.characterDetails}>
            {character.class} · Lv{character.level}
          </p>
          <p className={styles.characterDetails}>
            {character.isHardcore ? 'Hardcore' : 'Softcore'} · Deaths:{' '}
            {character.deathCount}
          </p>
          <p className={styles.characterDetails}>
            Survival Bonus: {character.survivalBonus}% · Play Time:{' '}
            {formatTime(character.playTime)}
          </p>
          <p className={styles.characterDetails}>
            Last modified: {character.modifiedAt.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
