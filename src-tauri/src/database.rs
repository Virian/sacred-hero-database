use sqlx::{sqlite::SqliteConnectOptions, SqlitePool};
use tauri::{AppHandle, Manager};

pub async fn initialize(app: &AppHandle) -> Result<SqlitePool, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    tokio::fs::create_dir_all(&app_data_dir)
        .await
        .map_err(|error| error.to_string())?;

    let database_path = app_data_dir.join("database.sqlite");
    let options = SqliteConnectOptions::new()
        .filename(database_path)
        .create_if_missing(true)
        .foreign_keys(true);

    let pool = SqlitePool::connect_with(options)
        .await
        .map_err(|error| error.to_string())?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|error| error.to_string())?;

    Ok(pool)
}
