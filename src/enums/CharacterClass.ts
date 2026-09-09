export const CharacterClass = {
  GLADIATOR: 'Gladiator',
  SERAPHIM: 'Seraphim',
  DARK_ELF: 'Dark Elf',
  WOOD_ELF: 'Wood Elf',
  BATTLE_MAGE: 'Battle Mage',
  VAMPIRESS: 'Vampiress',
  DWARF: 'Dwarf',
  DAEMON: 'Daemon',
} as const;

export type CharacterClass =
  (typeof CharacterClass)[keyof typeof CharacterClass];
