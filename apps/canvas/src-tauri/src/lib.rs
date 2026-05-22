use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Component, Path, PathBuf};
use tauri::{AppHandle, Manager, Runtime};

type CommandResult<A> = Result<A, CanvasCommandError>;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CanvasCommandError {
    tag: &'static str,
    message: String,
}

impl CanvasCommandError {
    fn invalid_request(message: impl Into<String>) -> Self {
        Self {
            tag: "CanvasCommandInvalidRequest",
            message: message.into(),
        }
    }

    fn unavailable(message: impl Into<String>) -> Self {
        Self {
            tag: "CanvasCommandUnavailable",
            message: message.into(),
        }
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct CanvasHealth {
    app: &'static str,
    command_surface: [&'static str; 9],
    native_command_surface: [&'static str; 3],
    persistence: &'static str,
    status: &'static str,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct CanvasNode {
    id: String,
    kind: String,
    label: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct CanvasScene {
    id: String,
    title: String,
    status: String,
    nodes: Vec<CanvasNode>,
}

#[derive(Deserialize)]
struct SceneSaveRequest {
    path: String,
    scene: CanvasScene,
}

#[derive(Deserialize)]
struct SceneLoadRequest {
    path: String,
}

fn validate_scene(scene: &CanvasScene) -> CommandResult<()> {
    if scene.id.trim().is_empty() {
        return Err(CanvasCommandError::invalid_request("Scene id must be non-empty."));
    }
    if scene.title.trim().is_empty() {
        return Err(CanvasCommandError::invalid_request("Scene title must be non-empty."));
    }
    if scene.status != "open" && scene.status != "archived" {
        return Err(CanvasCommandError::invalid_request("Scene status must be open or archived."));
    }
    for node in &scene.nodes {
        if node.id.trim().is_empty() {
            return Err(CanvasCommandError::invalid_request("Node id must be non-empty."));
        }
        if node.label.trim().is_empty() {
            return Err(CanvasCommandError::invalid_request("Node label must be non-empty."));
        }
        if node.kind != "note" && node.kind != "shape" && node.kind != "asset" {
            return Err(CanvasCommandError::invalid_request(
                "Node kind must be note, shape, or asset.",
            ));
        }
    }
    Ok(())
}

fn ensure_local_scene_name(path: &str) -> CommandResult<&str> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err(CanvasCommandError::invalid_request("Scene path must be non-empty."));
    }
    let requested = Path::new(trimmed);
    if requested.is_absolute()
        || requested
            .components()
            .any(|component| !matches!(component, Component::Normal(_)))
    {
        return Err(CanvasCommandError::invalid_request(
            "Scene path must be a local file name, not an absolute or nested path.",
        ));
    }
    if requested.extension().and_then(|extension| extension.to_str()) != Some("json") {
        return Err(CanvasCommandError::invalid_request(
            "Scene path must use the .json extension.",
        ));
    }
    Ok(trimmed)
}

fn scene_storage_dir<R: Runtime>(app: &AppHandle<R>) -> CommandResult<PathBuf> {
    app.path()
        .app_data_dir()
        .map(|path| path.join("scenes"))
        .map_err(|_| CanvasCommandError::unavailable("Unable to resolve canvas app data directory."))
}

fn resolve_scene_path_in_dir(base_dir: &Path, path: &str) -> CommandResult<PathBuf> {
    let file_name = ensure_local_scene_name(path)?;
    Ok(base_dir.join(file_name))
}

#[tauri::command]
fn canvas_health() -> CanvasHealth {
    CanvasHealth {
        app: "@beep/canvas",
        command_surface: [
            "canvas_health",
            "scene_create",
            "scene_list",
            "scene_get",
            "scene_archive",
            "scene_node_add",
            "scene_node_remove",
            "scene_save",
            "scene_load",
        ],
        native_command_surface: ["canvas_health", "scene_save", "scene_load"],
        persistence: "app-local-json",
        status: "ready",
    }
}

#[tauri::command]
fn scene_save(app: AppHandle, request: SceneSaveRequest) -> CommandResult<CanvasScene> {
    save_scene_with_app(&app, request)
}

fn save_scene_with_app<R: Runtime>(app: &AppHandle<R>, request: SceneSaveRequest) -> CommandResult<CanvasScene> {
    validate_scene(&request.scene)?;
    let storage_dir = scene_storage_dir(app)?;
    save_scene_in_dir(&storage_dir, request)
}

fn save_scene_in_dir(storage_dir: &Path, request: SceneSaveRequest) -> CommandResult<CanvasScene> {
    validate_scene(&request.scene)?;
    let path = resolve_scene_path_in_dir(storage_dir, &request.path)?;
    fs::create_dir_all(storage_dir)
        .map_err(|_| CanvasCommandError::unavailable("Unable to prepare canvas scene storage."))?;
    let json =
        serde_json::to_string_pretty(&request.scene).map_err(|_| CanvasCommandError::unavailable("Unable to encode canvas scene JSON."))?;
    fs::write(path, format!("{json}\n"))
        .map_err(|_| CanvasCommandError::unavailable("Unable to save canvas scene JSON."))?;
    Ok(request.scene)
}

#[tauri::command]
fn scene_load(app: AppHandle, request: SceneLoadRequest) -> CommandResult<CanvasScene> {
    load_scene_with_app(&app, request)
}

fn load_scene_with_app<R: Runtime>(app: &AppHandle<R>, request: SceneLoadRequest) -> CommandResult<CanvasScene> {
    load_scene_from_dir(&scene_storage_dir(app)?, request)
}

fn load_scene_from_dir(storage_dir: &Path, request: SceneLoadRequest) -> CommandResult<CanvasScene> {
    let path = resolve_scene_path_in_dir(storage_dir, &request.path)?;
    let json = fs::read_to_string(path)
        .map_err(|_| CanvasCommandError::unavailable("Unable to load canvas scene JSON."))?;
    let scene: CanvasScene =
        serde_json::from_str(&json).map_err(|_| CanvasCommandError::invalid_request("Unable to decode canvas scene JSON."))?;
    validate_scene(&scene)?;
    Ok(scene)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scene() -> CanvasScene {
        CanvasScene {
            id: "scene-test".to_string(),
            title: "Scene Test".to_string(),
            status: "open".to_string(),
            nodes: vec![CanvasNode {
                id: "node-test".to_string(),
                kind: "note".to_string(),
                label: "Node Test".to_string(),
            }],
        }
    }

    #[test]
    fn confines_scene_paths_to_local_json_file_names() {
        let storage_dir = std::env::temp_dir().join("beep-canvas-test");

        assert!(resolve_scene_path_in_dir(&storage_dir, "scene-test.json").is_ok());
        assert!(resolve_scene_path_in_dir(&storage_dir, "../scene-test.json").is_err());
        assert!(resolve_scene_path_in_dir(&storage_dir, "/tmp/scene-test.json").is_err());
        assert!(resolve_scene_path_in_dir(&storage_dir, "scene-test.txt").is_err());
    }

    #[test]
    fn save_rejects_invalid_scene_with_typed_error() {
        let storage_dir = std::env::temp_dir().join("beep-canvas-test-invalid");
        let result = save_scene_in_dir(
            &storage_dir,
            SceneSaveRequest {
                path: "invalid-scene.json".to_string(),
                scene: CanvasScene {
                    title: String::new(),
                    ..scene()
                },
            },
        );
        let error = result.expect_err("invalid scene should fail");

        assert_eq!(error.tag, "CanvasCommandInvalidRequest");
    }

    #[test]
    fn save_and_load_roundtrip_uses_confined_storage() {
        let storage_dir = std::env::temp_dir().join("beep-canvas-test-roundtrip");
        let saved = save_scene_in_dir(
            &storage_dir,
            SceneSaveRequest {
                path: "roundtrip-scene.json".to_string(),
                scene: scene(),
            },
        )
        .expect("scene should save");
        let path = resolve_scene_path_in_dir(&storage_dir, "roundtrip-scene.json").expect("path should resolve");
        let loaded_json = fs::read_to_string(path).expect("saved file should exist");
        let loaded: CanvasScene = serde_json::from_str(&loaded_json).expect("saved scene should decode");
        let loaded_through_command = load_scene_from_dir(
            &storage_dir,
            SceneLoadRequest {
                path: "roundtrip-scene.json".to_string(),
            },
        )
        .expect("scene should load");

        assert_eq!(saved.id, loaded.id);
        assert_eq!(loaded.nodes.len(), 1);
        assert_eq!(loaded_through_command.id, loaded.id);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![canvas_health, scene_save, scene_load])
        .run(tauri::generate_context!())
        .expect("error while running canvas");
}
