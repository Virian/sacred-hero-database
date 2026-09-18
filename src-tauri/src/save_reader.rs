use anyhow::{bail, Context, Result};
use byteorder::{LittleEndian, ReadBytesExt};
use std::{
    fs,
    io::{Cursor, Read, Seek, SeekFrom},
    path::Path,
    time::SystemTime,
};

#[cfg(test)]
mod tests;

#[derive(Debug, serde::Serialize)]
pub struct CharacterInfo {
    pub name: String,
    pub class: String,
    pub level: u32,
    pub hardcore: bool,
    pub revivals: u32,
    pub survival_bonus: u8,
    pub play_time: std::time::Duration,
    pub modified: SystemTime,
}

#[derive(Debug)]
struct Section {
    section_type: u32,
    offset: u32,
    size: u32,
}

const SURVIVAL_THRESHOLDS: [u32; 99] = [
    180, 240, 300, 360, 480, 540, 660, 720, 780, 900, 960, 1080, 1140, 1260, 1380, 1440, 1560,
    1680, 1800, 1860, 1980, 2100, 2220, 2340, 2460, 2640, 2760, 2880, 3060, 3180, 3300, 3480, 3660,
    3780, 3960, 4140, 4320, 4500, 4680, 4860, 5100, 5280, 5520, 5760, 6000, 6240, 6480, 6720, 7020,
    7260, 7560, 7860, 8220, 8520, 8880, 9240, 9660, 10020, 10440, 10860, 11340, 11820, 12360,
    12900, 13440, 14040, 14700, 15360, 16140, 16860, 17700, 18600, 19560, 20580, 21660, 22860,
    24180, 25620, 27180, 28860, 30780, 32940, 35220, 37860, 40860, 44340, 48300, 52860, 58320,
    64860, 72900, 82860, 95760, 112860, 136800, 172860, 232860, 352860, 712860,
];

fn calculate_survival_bonus(seconds: u32) -> u8 {
    SURVIVAL_THRESHOLDS
        .iter()
        .take_while(|&&threshold| seconds >= threshold)
        .count() as u8
}

pub fn read_underworld_character<P: AsRef<Path>>(path: P) -> Result<CharacterInfo> {
    let path = path.as_ref();

    let metadata = fs::metadata(path)?;
    let modified = metadata.modified()?;

    let data = fs::read(path)?;
    parse_character(&data, modified)
}

fn parse_character(data: &[u8], modified: SystemTime) -> Result<CharacterInfo> {
    let mut file = Cursor::new(data);

    // PAX header (256 bytes)
    let mut header = [0u8; 256];
    file.read_exact(&mut header)?;

    let mut header_cursor = Cursor::new(header);

    let magic = header_cursor.read_u32::<LittleEndian>()?;
    if magic != 0x1B484D41 {
        bail!("Not a Sacred Underworld PAX file");
    }

    let section_count = header_cursor.read_u32::<LittleEndian>()?;

    // Find HeroData2 (section type 0xC3)
    let mut hero_section = None;
    let mut stats_section = None;

    for _ in 0..section_count {
        let section = Section {
            section_type: file.read_u32::<LittleEndian>()?,
            offset: file.read_u32::<LittleEndian>()?,
            size: file.read_u32::<LittleEndian>()?,
        };

        match section.section_type {
            0xC3 => hero_section = Some(section),
            0xC4 => stats_section = Some(section),
            _ => {}
        }
    }

    let hero_section = hero_section.context("HeroData2 (0xC3) section not found")?;

    file.seek(SeekFrom::Start(hero_section.offset as u64))?;

    let mut hero = vec![0u8; hero_section.size as usize];
    file.read_exact(&mut hero)?;

    let mut hero_cursor = Cursor::new(hero);

    // SECTIONC3 layout
    let level = hero_cursor.read_u32::<LittleEndian>()?;
    let class_id = hero_cursor.read_u32::<LittleEndian>()?;

    let mut name_chars = [0u16; 64];

    for character in &mut name_chars {
        *character = hero_cursor.read_u16::<LittleEndian>()?;
    }

    let end = name_chars
        .iter()
        .position(|&character| character == 0)
        .unwrap_or(name_chars.len());

    let name = String::from_utf16(&name_chars[..end])?;

    let _equipped_items_count = hero_cursor.read_u32::<LittleEndian>()?;

    let mut equipped_items = [0u32; 24];
    for slot in &mut equipped_items {
        *slot = hero_cursor.read_u32::<LittleEndian>()?;
    }

    let mut game_completion_bytes = [0u8; 7];
    hero_cursor.read_exact(&mut game_completion_bytes)?;

    let hardcore = hero_cursor.read_u8()? != 0;

    let stats_section = stats_section.context("HeroData3 (0xC4) section not found")?;

    file.seek(SeekFrom::Start(stats_section.offset as u64))?;

    let revivals = file.read_u32::<LittleEndian>()?;
    let _kills = file.read_u32::<LittleEndian>()?;
    let survival_time = file.read_u32::<LittleEndian>()?;
    let _runes = file.read_u32::<LittleEndian>()?;

    let play_hours = file.read_u32::<LittleEndian>()?;
    let play_minutes = file.read_u32::<LittleEndian>()?;
    let play_seconds = file.read_u32::<LittleEndian>()?;

    let play_time = std::time::Duration::from_secs(
        play_hours as u64 * 3600 + play_minutes as u64 * 60 + play_seconds as u64,
    );

    let class = match class_id {
        1 => String::from("Seraphim"),
        2 => String::from("Gladiator"),
        3 => String::from("Battle Mage"),
        4 => String::from("Dark Elf"),
        5 => String::from("Wood Elf"),
        6 => String::from("Vampiress"),
        7 => String::from("Vampiress"),
        8 => String::from("Dwarf"),
        9 => String::from("Daemon"),
        other => format!("Unknown({})", other),
    };

    Ok(CharacterInfo {
        name,
        class,
        level,
        hardcore,
        revivals,
        survival_bonus: calculate_survival_bonus(survival_time),
        play_time,
        modified,
    })
}
