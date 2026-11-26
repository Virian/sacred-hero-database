use super::*;
use serde_json::json;

#[test]
fn applies_missing_defaults() {
    let settings = apply_defaults(json!({})).unwrap();

    assert_eq!(settings["gameInstallationPath"], "");
    assert_eq!(settings["activeCharacterSlots"], 8);
    assert_eq!(settings["triedDetectingGamePath"], false);
    assert_eq!(settings["shouldDownloadAppUpdates"], true);
}

#[test]
fn preserves_existing_settings_when_applying_defaults() {
    let settings = apply_defaults(json!({
        "gameInstallationPath": "C:/Sacred",
        "activeCharacterSlots": 4,
        "triedDetectingGamePath": true,
        "shouldDownloadAppUpdates": false
    }))
    .unwrap();

    assert_eq!(settings["gameInstallationPath"], "C:/Sacred");
    assert_eq!(settings["activeCharacterSlots"], 4);
    assert_eq!(settings["triedDetectingGamePath"], true);
    assert_eq!(settings["shouldDownloadAppUpdates"], false);
}

#[test]
fn updates_settings_without_discarding_other_values() {
    let settings = update_settings_value(
        json!({"triedDetectingGamePath": true}),
        "C:/Sacred".to_string(),
        6,
        false,
    )
    .unwrap();

    assert_eq!(settings["gameInstallationPath"], "C:/Sacred");
    assert_eq!(settings["activeCharacterSlots"], 6);
    assert_eq!(settings["triedDetectingGamePath"], true);
    assert_eq!(settings["shouldDownloadAppUpdates"], false);
}

#[test]
fn rejects_non_object_settings() {
    assert!(apply_defaults(json!([])).is_err());
    assert!(update_settings_value(json!(null), String::new(), 8, true).is_err());
}
