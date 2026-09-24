use crate::{character_repository, save_reader};
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::SqlitePool;
use std::{path::Path, time::SystemTime};
use tauri::{AppHandle, Manager};
use uuid::Uuid;

#[derive(Debug, Serialize)]
#[serde(tag = "status", rename_all = "lowercase")]
pub enum ImportResult {
    Success {
        file_name: String,
        character_class: String,
    },
    Skipped {
        file_name: String,
        character_class: String,
    },
    Error {
        file_name: String,
        error: String,
    },
}

enum ImportOutcome {
    Imported(String),
    Skipped(String),
}

pub async fn import_characters(
    app: &AppHandle,
    pool: &SqlitePool,
    file_paths: Vec<String>,
) -> Result<Vec<ImportResult>, String> {
    let saves_directory = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?
        .join("saves");

    tokio::fs::create_dir_all(&saves_directory)
        .await
        .map_err(|error| error.to_string())?;

    let mut results = Vec::with_capacity(file_paths.len());

    for file_path in file_paths {
        let file_name = Path::new(&file_path)
            .file_name()
            .and_then(|name| name.to_str())
            .map(str::to_owned)
            .unwrap_or_else(|| file_path.clone());

        match import_one(pool, &saves_directory, &file_path).await {
            Ok(ImportOutcome::Imported(character_class)) => results.push(ImportResult::Success {
                file_name,
                character_class,
            }),
            Ok(ImportOutcome::Skipped(character_class)) => results.push(ImportResult::Skipped {
                file_name,
                character_class,
            }),
            Err(error) => results.push(ImportResult::Error { file_name, error }),
        }
    }

    Ok(results)
}

async fn import_one(
    pool: &SqlitePool,
    saves_directory: &Path,
    file_path: &str,
) -> Result<ImportOutcome, String> {
    let source_path = Path::new(file_path);
    let character = save_reader::read_underworld_character(source_path)
        .map_err(|error| format!("Could not read save file: {error}"))?;
    let normalized_name = strip_character_formatting(&character.name);
    let modified_at = system_time_iso(character.modified);
    let created_at = system_time_iso(SystemTime::now());

    let mut transaction = pool
        .begin()
        .await
        .map_err(|error| format!("Could not start database transaction: {error}"))?;

    let character_id = character_repository::find_character_id_by_name_and_class(
        &mut transaction,
        &normalized_name,
        &character.class,
    )
    .await
    .map_err(|error| format!("Could not find character: {error}"))?;

    let character_id = match character_id {
        Some(id) => id,
        None => character_repository::insert_character(
            &mut transaction,
            &character.name,
            &character.class,
        )
        .await
        .map_err(|error| format!("Could not insert character: {error}"))?,
    };

    if character_repository::version_with_play_time_exists(
        &mut transaction,
        &character_id,
        character.play_time.as_secs() as i64,
    )
    .await
    .map_err(|error| format!("Could not check for an existing character version: {error}"))?
    {
        return Ok(ImportOutcome::Skipped(character.class));
    }

    let version_id = Uuid::new_v4().to_string();
    let destination_directory = saves_directory.join(&character_id);
    let destination_path = destination_directory.join(format!("{version_id}.pax"));
    let destination_directory_existed = tokio::fs::try_exists(&destination_directory)
        .await
        .map_err(|error| format!("Could not inspect character save directory: {error}"))?;

    tokio::fs::create_dir_all(&destination_directory)
        .await
        .map_err(|error| format!("Could not create character save directory: {error}"))?;

    if let Err(error) = tokio::fs::copy(source_path, &destination_path).await {
        cleanup_destination(
            &destination_path,
            &destination_directory,
            destination_directory_existed,
        )
        .await;
        return Err(format!("Could not copy save file: {error}"));
    }

    if let Err(error) = character_repository::insert_version(
        &mut transaction,
        &version_id,
        &character_id,
        &character,
        &modified_at,
        &created_at,
    )
    .await
    {
        cleanup_destination(
            &destination_path,
            &destination_directory,
            destination_directory_existed,
        )
        .await;
        return Err(error);
    }

    if let Err(error) = transaction.commit().await {
        cleanup_destination(
            &destination_path,
            &destination_directory,
            destination_directory_existed,
        )
        .await;
        return Err(format!("Could not commit import: {error}"));
    }

    Ok(ImportOutcome::Imported(character.class))
}

async fn cleanup_destination(
    destination_path: &Path,
    destination_directory: &Path,
    destination_directory_existed: bool,
) {
    let _ = tokio::fs::remove_file(destination_path).await;

    if !destination_directory_existed {
        let _ = tokio::fs::remove_dir(destination_directory).await;
    }
}

fn system_time_iso(time: SystemTime) -> String {
    DateTime::<Utc>::from(time).to_rfc3339()
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
