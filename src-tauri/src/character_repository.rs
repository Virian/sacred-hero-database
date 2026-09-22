use crate::save_reader;
use sqlx::{Sqlite, Transaction};
use uuid::Uuid;

pub async fn insert_character(
    transaction: &mut Transaction<'_, Sqlite>,
    name: &str,
    class: &str,
) -> Result<String, sqlx::Error> {
    let id = Uuid::new_v4().to_string();

    sqlx::query("INSERT INTO characters (id, name, class) VALUES (?, ?, ?)")
        .bind(&id)
        .bind(name)
        .bind(class)
        .execute(&mut **transaction)
        .await?;

    Ok(id)
}

pub async fn find_character_id_by_class(
    transaction: &mut Transaction<'_, Sqlite>,
    name: &str,
    class: &str,
) -> Result<Option<String>, sqlx::Error> {
    let characters: Vec<(String, String, String)> =
        sqlx::query_as("SELECT id, name, class FROM characters WHERE class = ?")
            .bind(class)
            .fetch_all(&mut **transaction)
            .await?;

    Ok(characters
        .into_iter()
        .find_map(|(id, stored_name, stored_class)| {
            (strip_character_formatting(&stored_name) == name && stored_class == class)
                .then_some(id)
        }))
}

pub async fn version_with_play_time_exists(
    transaction: &mut Transaction<'_, Sqlite>,
    character_id: &str,
    play_time_seconds: i64,
) -> Result<bool, sqlx::Error> {
    let exists: i64 = sqlx::query_scalar(
        "SELECT EXISTS(
            SELECT 1
            FROM character_versions
            WHERE character_id = ? AND play_time_seconds = ?
        )",
    )
    .bind(character_id)
    .bind(play_time_seconds)
    .fetch_one(&mut **transaction)
    .await?;

    Ok(exists != 0)
}

pub async fn insert_version(
    transaction: &mut Transaction<'_, Sqlite>,
    version_id: &str,
    character_id: &str,
    character: &save_reader::CharacterInfo,
    modified_at: &str,
    created_at: &str,
) -> Result<(), String> {
    let version_number: i64 = sqlx::query_scalar(
        "SELECT COALESCE(MAX(version_number), 0) + 1 FROM character_versions WHERE character_id = ?",
    )
    .bind(character_id)
    .fetch_one(&mut **transaction)
    .await
    .map_err(|error| format!("Could not determine version number: {error}"))?;

    sqlx::query(
        "INSERT INTO character_versions (
            id, version_number, character_id, level, hardcore, deaths,
            survival_bonus, play_time_seconds, modified_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(version_id)
    .bind(version_number)
    .bind(character_id)
    .bind(i64::from(character.level))
    .bind(i64::from(character.hardcore))
    .bind(i64::from(character.revivals))
    .bind(i64::from(character.survival_bonus))
    .bind(character.play_time.as_secs() as i64)
    .bind(modified_at)
    .bind(created_at)
    .execute(&mut **transaction)
    .await
    .map_err(|error| format!("Could not insert character version: {error}"))?;

    Ok(())
}

fn strip_character_formatting(value: &str) -> String {
    let characters: Vec<char> = value.chars().collect();
    let mut result = String::with_capacity(value.len());
    let mut index = 0;

    while index < characters.len() {
        if characters[index] == '\\' && index + 1 < characters.len() {
            let code = characters[index + 1];
            let formatting_length = match code {
                'c' | 'd' | 'w' => Some(10),
                'g' => Some(18),
                'r' => Some(2),
                _ => None,
            };

            if let Some(length) = formatting_length {
                if index + length <= characters.len() {
                    index += length;
                    continue;
                }
            }
        }

        result.push(characters[index]);
        index += 1;
    }

    result
}

#[cfg(test)]
mod tests {
    use super::strip_character_formatting;

    #[test]
    fn strips_supported_character_formatting_codes() {
        assert_eq!(
            strip_character_formatting(r"\c12345678Hero\g1234567890123456\r"),
            "Hero"
        );
    }

    #[test]
    fn preserves_incomplete_formatting_codes() {
        assert_eq!(strip_character_formatting(r"Hero\c123"), r"Hero\c123");
    }
}
