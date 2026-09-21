PRAGMA foreign_keys = ON;

CREATE TABLE characters (
	id INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	class TEXT NOT NULL CHECK (
		class IN (
			'Gladiator',
			'Seraphim',
			'Dark Elf',
			'Wood Elf',
			'Battle Mage',
			'Vampiress',
			'Dwarf',
			'Daemon'
		)
	)
);

CREATE TABLE character_versions (
	id INTEGER PRIMARY KEY,
	version_number INTEGER NOT NULL,
	character_id INTEGER NOT NULL,
	level INTEGER NOT NULL,
	hardcore INTEGER NOT NULL CHECK (hardcore IN (0, 1)),
	deaths INTEGER NOT NULL,
	survival_bonus INTEGER NOT NULL,
	play_time_seconds INTEGER NOT NULL,
	modified_at TEXT NOT NULL,
	created_at TEXT NOT NULL,
	save_file BLOB NOT NULL,
	FOREIGN KEY (character_id) REFERENCES characters (id) ON DELETE CASCADE,
	UNIQUE (character_id, version_number)
);
