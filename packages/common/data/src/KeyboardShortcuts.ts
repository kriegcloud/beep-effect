/**
 * Common keyboard shortcuts for productivity.
 *
 * @see {@link https://jsonlint.com/datasets/keyboard-shortcuts | Keyboard Shortcuts JSON Dataset}
 *
 * @category Constants
 * @module @beep/data/KeyboardShortcuts
 * @since 0.0.0
 */
/**
 * @since 0.0.0
 */
export const KeyboardShortcuts = [
  {
    action: "Copy",
    windows: "Ctrl+C",
    mac: "Cmd+C",
    category: "Clipboard",
    universal: true,
  },
  {
    action: "Cut",
    windows: "Ctrl+X",
    mac: "Cmd+X",
    category: "Clipboard",
    universal: true,
  },
  {
    action: "Paste",
    windows: "Ctrl+V",
    mac: "Cmd+V",
    category: "Clipboard",
    universal: true,
  },
  {
    action: "Undo",
    windows: "Ctrl+Z",
    mac: "Cmd+Z",
    category: "Edit",
    universal: true,
  },
  {
    action: "Redo",
    windows: "Ctrl+Y",
    mac: "Cmd+Shift+Z",
    category: "Edit",
    universal: true,
  },
  {
    action: "Select All",
    windows: "Ctrl+A",
    mac: "Cmd+A",
    category: "Selection",
    universal: true,
  },
  {
    action: "Find",
    windows: "Ctrl+F",
    mac: "Cmd+F",
    category: "Search",
    universal: true,
  },
  {
    action: "Find and Replace",
    windows: "Ctrl+H",
    mac: "Cmd+Option+F",
    category: "Search",
    universal: true,
  },
  {
    action: "Save",
    windows: "Ctrl+S",
    mac: "Cmd+S",
    category: "File",
    universal: true,
  },
  {
    action: "Save As",
    windows: "Ctrl+Shift+S",
    mac: "Cmd+Shift+S",
    category: "File",
    universal: true,
  },
  {
    action: "New",
    windows: "Ctrl+N",
    mac: "Cmd+N",
    category: "File",
    universal: true,
  },
  {
    action: "Open",
    windows: "Ctrl+O",
    mac: "Cmd+O",
    category: "File",
    universal: true,
  },
  {
    action: "Print",
    windows: "Ctrl+P",
    mac: "Cmd+P",
    category: "File",
    universal: true,
  },
  {
    action: "Close Tab",
    windows: "Ctrl+W",
    mac: "Cmd+W",
    category: "Window",
    universal: true,
  },
  {
    action: "Close Window",
    windows: "Alt+F4",
    mac: "Cmd+Q",
    category: "Window",
    universal: false,
  },
  {
    action: "New Tab",
    windows: "Ctrl+T",
    mac: "Cmd+T",
    category: "Window",
    universal: true,
  },
  {
    action: "Switch Tab",
    windows: "Ctrl+Tab",
    mac: "Cmd+Option+Right",
    category: "Window",
    universal: false,
  },
  {
    action: "Bold",
    windows: "Ctrl+B",
    mac: "Cmd+B",
    category: "Format",
    universal: true,
  },
  {
    action: "Italic",
    windows: "Ctrl+I",
    mac: "Cmd+I",
    category: "Format",
    universal: true,
  },
  {
    action: "Underline",
    windows: "Ctrl+U",
    mac: "Cmd+U",
    category: "Format",
    universal: true,
  },
  {
    action: "Zoom In",
    windows: "Ctrl++",
    mac: "Cmd++",
    category: "View",
    universal: true,
  },
  {
    action: "Zoom Out",
    windows: "Ctrl+-",
    mac: "Cmd+-",
    category: "View",
    universal: true,
  },
  {
    action: "Reset Zoom",
    windows: "Ctrl+0",
    mac: "Cmd+0",
    category: "View",
    universal: true,
  },
  {
    action: "Refresh",
    windows: "F5",
    mac: "Cmd+R",
    category: "Browser",
    universal: false,
  },
  {
    action: "Hard Refresh",
    windows: "Ctrl+F5",
    mac: "Cmd+Shift+R",
    category: "Browser",
    universal: false,
  },
] as const;
