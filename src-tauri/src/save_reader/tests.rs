use super::*;

#[test]
fn rejects_data_with_invalid_magic() {
    let data = vec![0; 256];

    let error = parse_character(&data, SystemTime::UNIX_EPOCH).unwrap_err();

    assert_eq!(error.to_string(), "Not a Sacred Underworld PAX file");
}

#[test]
fn calculates_survival_bonus_at_thresholds() {
    assert_eq!(calculate_survival_bonus(179), 0);
    assert_eq!(calculate_survival_bonus(180), 1);
    assert_eq!(calculate_survival_bonus(712_860), 99);
}

#[test]
fn parses_character_data() {
    let mut data = vec![0; 1_024];
    let hero_offset = 300usize;
    let stats_offset = 600usize;

    // PAX header: magic value and number of section entries.
    data[0..4].copy_from_slice(&0x1B484D41u32.to_le_bytes());
    data[4..8].copy_from_slice(&2u32.to_le_bytes());

    // Section table: HeroData2 (0xC3) starts at hero_offset and is 244 bytes long.
    data[256..260].copy_from_slice(&0xC3u32.to_le_bytes());
    data[260..264].copy_from_slice(&(hero_offset as u32).to_le_bytes());
    data[264..268].copy_from_slice(&244u32.to_le_bytes());

    // Section table: HeroData3 (0xC4) starts at stats_offset and is 28 bytes long.
    data[268..272].copy_from_slice(&0xC4u32.to_le_bytes());
    data[272..276].copy_from_slice(&(stats_offset as u32).to_le_bytes());
    data[276..280].copy_from_slice(&28u32.to_le_bytes());

    // HeroData2: level, class ID, UTF-16 name, equipped-item count, and hardcore flag.
    data[hero_offset..hero_offset + 4].copy_from_slice(&42u32.to_le_bytes());
    data[hero_offset + 4..hero_offset + 8].copy_from_slice(&2u32.to_le_bytes());
    data[hero_offset + 8..hero_offset + 10].copy_from_slice(&(u16::from(b'A')).to_le_bytes());
    data[hero_offset + 10..hero_offset + 12].copy_from_slice(&(u16::from(b'v')).to_le_bytes());
    data[hero_offset + 12..hero_offset + 14].copy_from_slice(&(u16::from(b'a')).to_le_bytes());
    data[hero_offset + 136..hero_offset + 140].copy_from_slice(&0u32.to_le_bytes());
    data[hero_offset + 243] = 1;

    // HeroData3: revivals, survival time, and play time (hours, minutes, seconds).
    data[stats_offset..stats_offset + 4].copy_from_slice(&3u32.to_le_bytes());
    data[stats_offset + 8..stats_offset + 12].copy_from_slice(&180u32.to_le_bytes());
    data[stats_offset + 16..stats_offset + 20].copy_from_slice(&1u32.to_le_bytes());
    data[stats_offset + 20..stats_offset + 24].copy_from_slice(&2u32.to_le_bytes());
    data[stats_offset + 24..stats_offset + 28].copy_from_slice(&3u32.to_le_bytes());

    let character = parse_character(&data, SystemTime::UNIX_EPOCH).unwrap();

    assert_eq!(character.name, "Ava");
    assert_eq!(character.class, "Gladiator");
    assert_eq!(character.level, 42);
    assert!(character.hardcore);
    assert_eq!(character.revivals, 3);
    assert_eq!(character.survival_bonus, 1);
    assert_eq!(character.play_time, std::time::Duration::from_secs(3723));
    assert_eq!(character.modified, SystemTime::UNIX_EPOCH);
}
