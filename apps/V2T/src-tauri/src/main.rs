#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "linux")]
fn configure_linux_wayland_workarounds() {
  let session_type = std::env::var("XDG_SESSION_TYPE").ok();
  let has_wayland_display = std::env::var_os("WAYLAND_DISPLAY").is_some();
  let is_wayland_session = session_type.as_deref() == Some("wayland") || has_wayland_display;

  if is_wayland_session && std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
    // WebKitGTK can hit a Wayland protocol error on startup when DMABUF rendering is enabled.
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
  }
}

#[cfg(not(target_os = "linux"))]
fn configure_linux_wayland_workarounds() {}

fn main() {
  configure_linux_wayland_workarounds();
  beep_v2t_lib::run();
}
