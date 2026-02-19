# @effect/ai-anthropic/AnthropicTool Surface

Total exports: 63

| Export | Kind | Overview |
|---|---|---|
| `AnthropicTool` | `type` | Union of all Anthropic provider-defined tools. |
| `Bash_20241022` | `const` | Anthropic Bash tool (2024-10-22 version). |
| `Bash_20250124` | `const` | Anthropic Bash tool (2025-01-24 version). |
| `CodeExecution_20250522` | `const` | Anthropic Code Execution tool (2025-05-22 version). |
| `CodeExecution_20250825` | `const` | Anthropic Code Execution tool (2025-08-25 version). |
| `CodeExecution_20250825_Parameters` | `const` | Simple code execution parameter. |
| `CodeExecutionBashCommand` | `const` | Bash code execution parameter. |
| `CodeExecutionProgrammaticToolCall` | `const` | Programmatic tool call execution parameter. |
| `CodeExecutionTextEditorCreate` | `const` | Text editor create command for code execution. |
| `CodeExecutionTextEditorStrReplace` | `const` | Text editor str_replace command for code execution. |
| `CodeExecutionTextEditorView` | `const` | Text editor view command for code execution. |
| `ComputerUse_20241022` | `const` | Computer use tool for Claude 3.5 Sonnet v2 (deprecated). |
| `ComputerUse_20250124` | `const` | Computer use tool for Claude 4 models and Claude Sonnet 3.7. |
| `ComputerUse_20251124` | `const` | Computer use tool for Claude Opus 4.5 only. |
| `ComputerUseDoubleClickAction` | `const` | Perform a double click. |
| `ComputerUseHoldKeyAction` | `const` | Holds a key while performing other actions. |
| `ComputerUseKeyAction` | `const` | Press a key or key combination (e.g. `"Return"`, `"ctrl+c"`, `"ctrl+s"`). |
| `ComputerUseLeftClickAction` | `const` | Perform a left click at the current mouse position or the specified coordinates. |
| `ComputerUseLeftClickDragAction` | `const` | Click and drag from start coordinate to end coordinate. |
| `ComputerUseLeftMouseDownAction` | `const` | Press the left mouse button down (without releasing). |
| `ComputerUseLeftMouseUpAction` | `const` | Release the left mouse button. |
| `ComputerUseMiddleClickAction` | `const` | Perform a middle click. |
| `ComputerUseMouseMoveAction` | `const` | Move the mouse cursor to the specified coordinates. |
| `ComputerUseRightClickAction` | `const` | Perform a right click. |
| `ComputerUseScreenshotAction` | `const` | Capture the current display. |
| `ComputerUseScrollAction` | `const` | Scroll a given amount in a specified direction. |
| `ComputerUseTripleClickAction` | `const` | Perform a triple click. |
| `ComputerUseWaitAction` | `const` | Pause between performing actions. |
| `ComputerUseZoomAction` | `const` | Zoom into a specific region of the screen at full resolution. |
| `Coordinate` | `const` | An `[x, y]` pixel position. |
| `Memory_20250818` | `const` | Memory tool for persistent file operations across conversations. |
| `MemoryCreateCommand` | `const` | Creates a new file. |
| `MemoryDeleteCommand` | `const` | Delete a file or directory. |
| `MemoryInsertCommand` | `const` | Insert text at a specific line. |
| `MemoryRenameCommand` | `const` | Rename or move a file or directory. |
| `MemoryStrReplaceCommand` | `const` | Replace text in a file. |
| `MemoryViewCommand` | `const` | Shows directory contents or file contents with optional line ranges. |
| `ModifierKey` | `const` | Modifier keys that can be held during click/scroll actions. |
| `Region` | `const` | A `[x1, y1, x2, y2]` position defining top-left and bottom-right corners. |
| `ScrollDirection` | `const` | The direction of the scroll for scroll actions. |
| `TextEditor_20241022` | `const` | Text editor tool for Claude 3.5 Sonnet (deprecated). |
| `TextEditor_20250124` | `const` | Text editor tool for Claude Sonnet 3.7 (deprecated model). |
| `TextEditor_20250429` | `const` | Text editor tool for Claude 4 models. |
| `TextEditor_20250728` | `const` | Text editor tool for Claude 4 models. |
| `TextEditorCreateCommand` | `const` | Create a new file with specified content. |
| `TextEditorInsertCommand` | `const` | Insert text at a specific line number in a file. |
| `TextEditorStrReplaceCommand` | `const` | Replace a specific string in a file with a new string. |
| `TextEditorUndoEditCommand` | `const` | Undo the last edit made to a file. |
| `TextEditorViewCommand` | `const` | View the contents of a file or list directory contents. |
| `ToolSearchBM25_20251119` | `const` | BM25/natural language tool search for Claude models. |
| `ToolSearchBM25Parameters` | `const` | Input parameters for BM25/natural language tool search. |
| `ToolSearchRegex_20251119` | `const` | Regex-based tool search for Claude models. |
| `ToolSearchRegexParameters` | `const` | Input parameters for regex-based tool search. |
| `TypeAction` | `const` | Type a text string. |
| `ViewRange` | `const` | A `[start, end]` line range for viewing file contents. |
| `WebFetch_20250910` | `const` | Web fetch tool for Claude models. |
| `WebFetch_20250910_Args` | `const` | Configuration arguments for the web fetch tool. |
| `WebFetchCitationsConfig` | `const` | Citation configuration for web fetch. |
| `WebFetchParameters` | `const` | Input parameters for a web fetch. |
| `WebSearch_20250305` | `const` | Web search tool for Claude models. |
| `WebSearch_20250305_Args` | `const` | Configuration arguments for the web search tool. |
| `WebSearchParameters` | `const` | Input parameters for a web search. |
| `WebSearchUserLocation` | `const` | User location for localizing search results. |
