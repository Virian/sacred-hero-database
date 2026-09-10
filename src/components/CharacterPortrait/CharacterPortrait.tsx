import BattleMagePortrait from '../../assets/battle-mage.webp';
import DaemonPortrait from '../../assets/daemon.webp';
import DarkElfPortrait from '../../assets/dark-elf.webp';
import DwarfPortrait from '../../assets/dwarf.webp';
import GladiatorPortrait from '../../assets/gladiator.webp';
import SeraphimPortrait from '../../assets/seraphim.webp';
import VampiressPortrait from '../../assets/vampiress.webp';
import WoodElfPortrait from '../../assets/wood-elf.webp';
import { CharacterClass } from '../../enums/CharacterClass';
import styles from './CharacterPortrait.module.scss';

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

interface CharacterPortraitProps {
  characterClass: CharacterClass;
  size?: number;
}

export const CharacterPortrait = ({
  characterClass,
  size = 56,
}: CharacterPortraitProps) => (
  <div
    className={styles.portraitWrapper}
    style={{ width: size, height: size }}
  >
    <img
      src={characterPortraitsMap[characterClass]}
      alt={`${characterClass} portrait`}
      className={styles.portrait}
    />
  </div>
);
