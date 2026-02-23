# Code Structure

## Project Layout

```
agent-sync/
├── core/                      # Core architecture
│   ├── canonical_models.py    # Universal data models
│   ├── adapter_interface.py   # Adapter contract
│   ├── registry.py            # Format registry
│   ├── orchestrator.py        # Sync orchestrator
│   └── state_manager.py       # State tracking
├── adapters/                  # Format adapters
│   ├── shared/               # Shared utilities
│   │   ├── handler_interface.py
│   │   └── utils.py
│   ├── claude/               # Claude Code adapter
│   │   ├── adapter.py        # Coordinator
│   │   └── handlers/         # Config type handlers
│   │       ├── agent_handler.py
│   │       ├── perm_handler.py
│   │       └── slash_cmd_handler.py
│   ├── copilot/              # GitHub Copilot adapter
│   │   ├── adapter.py
│   │   └── handlers/
│   └── example/              # Template adapter
├── cli/                       # Command-line interface
│   └── main.py
├── scripts/                   # Utility scripts
│   └── sync_docs.py
├── docs/                      # Documentation
│   ├── formats/              # Tool format specs
│   │   ├── agents/
│   │   ├── permissions/
│   │   └── slash-commands/
│   └── app/                  # Application docs
│       ├── users/
│       └── developers/
├── tests/                     # Test suite
│   ├── fixtures/             # Test data
│   ├── test_adapters.py
│   ├── test_registry.py
│   ├── test_orchestrator.py
│   ├── test_state_manager.py
│   └── test_cli.py
├── requirements.txt
├── CLAUDE.md                  # Claude Code instructions
└── README.md
```

## Module Responsibilities

### core/canonical_models.py

Defines universal data models:
- `CanonicalAgent`
- `CanonicalPermission`
- `CanonicalSlashCommand`

Each model includes:
- Standard fields (common across formats)
- Metadata dictionary (format-specific fields)
- Validation logic

### core/adapter_interface.py

Abstract base class for format adapters:
- `FormatAdapter`: Base class
- `read()`: Read file and convert to canonical
- `write()`: Convert canonical and write file
- Handler registration and delegation

### core/registry.py

Format adapter registry:
- Registers available adapters
- Auto-detects format from file paths
- Validates format/config-type support
- Provides adapter lookup

### core/orchestrator.py

Sync orchestration:
- Compares source and target directories
- Identifies create/update/conflict operations
- Delegates to adapters for conversions
- Handles dry-run mode
- Integrates with state manager

### core/state_manager.py

State tracking:
- Stores sync history in `~/.agent_sync_state.json`
- Tracks last sync time and content hashes
- Enables intelligent change detection
- Cross-project state sharing

### adapters/shared/

Shared utilities for adapters:
- `ConfigHandler`: Base class for config type handlers
- Frontmatter parsing/building
- Common field extraction
- Model name mapping utilities

### adapters/{format}/

Format-specific adapters:
- `adapter.py`: Coordinator that delegates to handlers
- `handlers/`: Config type handlers (agent, permission, etc.)

Each handler implements:
- `to_canonical()`: Format → canonical conversion
- `from_canonical()`: Canonical → format conversion

### cli/main.py

Command-line interface:
- Argument parsing
- Path validation
- Orchestrator initialization
- Output formatting

### scripts/

Utility scripts:
- Documentation sync
- Migration tools
- Maintenance tasks

## Coding Conventions

### Import Order

1. Standard library
2. Third-party packages
3. Local modules

```python
import os
from pathlib import Path

import yaml

from core.canonical_models import CanonicalAgent
from adapters.shared.utils import extract_frontmatter
```

### Naming Conventions

- Classes: `PascalCase` (e.g., `ClaudeAdapter`)
- Functions/methods: `snake_case` (e.g., `to_canonical`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MODEL_MAPPING`)
- Private: Leading underscore (e.g., `_internal_method`)

### File Organization

```python
# Imports
import ...

# Constants
CONSTANT_NAME = ...

# Classes
class MyClass:
    pass

# Functions
def my_function():
    pass

# Main execution
if __name__ == "__main__":
    main()
```

### Docstrings

Use concise docstrings for public APIs:

```python
def to_canonical(self, content, file_path):
    """Convert format-specific content to CanonicalAgent."""
    pass
```

### Error Handling

Raise specific exceptions with clear messages:

```python
if not self.can_handle(file_path):
    raise ValueError(f"Unsupported file format: {file_path}")
```

### Type Hints

Use type hints where helpful:

```python
def read(self, file_path: str, config_type: str) -> CanonicalAgent:
    pass
```

## Dependencies

### Required

- Python 3.x
- PyYAML: YAML frontmatter parsing
- requests: HTTP fetching
- beautifulsoup4: HTML parsing
- html2text: HTML to markdown

### Development

- pytest: Testing framework
- pytest-cov: Coverage reporting

## Configuration

### State File

Location: `~/.agent_sync_state.json`

Format:
```json
{
  "syncs": {
    "source_dir|target_dir|format_pair": {
      "last_sync": "2024-01-15T10:30:00",
      "files": {
        "agent.md": {
          "source_hash": "abc123",
          "target_hash": "def456"
        }
      }
    }
  }
}
```

### Claude Code Settings

Location: `.claude/CLAUDE.md` or `CLAUDE.md`

Project-specific instructions for Claude Code.

## Extension Points

### New Config Types

1. Add canonical model in `core/canonical_models.py`
2. Create handler in each adapter's `handlers/`
3. Register in adapter coordinator

### New Formats

1. Copy `adapters/example/` template
2. Implement coordinator and handlers
3. Register in `core/registry.py`

### New CLI Commands

1. Add argument parser in `cli/main.py`
2. Implement command logic
3. Add tests in `tests/test_cli.py`

## Best Practices

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Injection**: Pass dependencies rather than hardcoding
3. **Interface Segregation**: Small, focused interfaces
4. **DRY**: Use shared utilities to avoid duplication
5. **Testability**: Design for easy testing with real objects
6. **Documentation**: Concise docs for engineers, not users
