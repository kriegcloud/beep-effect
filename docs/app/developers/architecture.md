# Architecture Overview

This document provides a high-level overview of the universal agent sync architecture.

## Design Philosophy

### Problem
The original implementation only supported Claude Code ↔ GitHub Copilot sync. Adding a third format (Codex) would require writing 4 new conversion functions (Claude→Codex, Codex→Claude, Copilot→Codex, Codex→Copilot). For N formats, this scales as N² converters.

### Solution: Hub-and-Spoke with Canonical Data Model
Instead of direct format-to-format conversions, we use an intermediate "canonical" representation:

```
Format A → Canonical Model ← Format B
                ↓
            Format C
```

For N formats, we need only 2N converters (one to canonical, one from canonical).

**Scaling comparison:**
- 6 formats with direct conversion: 30 converters needed
- 6 formats with canonical model: 12 converters needed (60% reduction)

---

## Core Modules

### 1. Canonical Models (`core/canonical_models.py`)

Universal data structures that all formats convert to/from:

- **CanonicalAgent**: Universal agent representation (name, description, instructions, tools, model).
- **CanonicalPermission**: Universal permission settings.
- **CanonicalSlashCommand**: Universal slash command representation.

**Information Preservation (Metadata):**
Format-specific fields (like Copilot's `handoffs` or Claude's `permissionMode`) are stored in a metadata dictionary. This enables lossless round-trip conversions:
```
Claude → Canonical (stores permissionMode in metadata)
       → Copilot (drops permissionMode, still in metadata)
       → Canonical (retrieves from metadata)
       → Claude (restores permissionMode)
```

### 2. Format Adapter Interface (`core/adapter_interface.py`)

Abstract base class defining the contract for all format converters. Each AI tool implements this interface once, providing a uniform interface and making the system easy to extend and test in isolation.

```python
class FormatAdapter(ABC):
    def to_canonical(self, content: str) -> CanonicalAgent
    def from_canonical(self, agent: CanonicalAgent) -> str
```

### 3. Format Registry (`core/registry.py`)

Central directory of available adapters.
- Registers adapters by name.
- Auto-detects format from file paths (e.g., `.agent.md` for Copilot).
- Validates format support for specific configuration types.

### 4. Sync Orchestrator (`core/orchestrator.py`)

Coordinates the high-level sync operations:
- File discovery and matching (e.g., `planner.md` ↔ `planner.agent.md`).
- Change detection via the State Manager.
- Conflict resolution (interactive prompting or newest-wins with `--force`).
- Format conversion via adapters.
- Statistics tracking and reporting.

### 5. State Manager (`core/state_manager.py`)

Tracks sync history to enable intelligent change detection:
- Stores file modification times and content hashes.
- Tracks the last sync action taken for each file pair.
- Prevents unnecessary syncs of unchanged files.
- Persists state to `~/.agent_sync_state.json`.

---

## Data Flow

### Sync Operation Flow

```
1. Orchestrator discovers file pairs
   └─> Uses registry to detect formats

2. For each pair, determine action needed
   └─> Check state manager for changes
   └─> Detect conflicts

3. Execute conversion
   Source File → Source Adapter.read()
              → to_canonical()
              → Canonical Model
              → from_canonical()
              → Target Adapter.write()
              → Target File

4. Update state manager
   └─> Record modification times & hashes
   └─> Save action taken
```

### Conversion Flow

```
Format-Specific → Parse → Normalize → Canonical
                                          ↓
Canonical → Denormalize → Serialize → Format-Specific
```

Each adapter handles parsing the structure (YAML, JSON, etc.), normalizing field names, mapping model names (e.g., "sonnet" ↔ "Claude Sonnet 4"), and converting tool representations.

---

## Adapter Architecture

### Handler-Based Pattern

Each format adapter uses a handler-based pattern to separate concerns by configuration type (Agent, Permission, Slash Command):

```
FormatAdapter (Coordinator)
    ├── AgentHandler (handles AGENT config type)
    ├── PermissionHandler (handles PERMISSION config type)
    └── SlashCommandHandler (handles SLASH_COMMAND config type)
```

**Benefits:**
- **Single Responsibility**: Each handler focuses on one configuration type.
- **Scalability**: Easy to add new types without bloating adapter files.
- **Testability**: Handlers can be tested in isolation.
- **Reusability**: Shared utilities (like `adapters/shared/frontmatter.py`) reduce duplication.

---

## Key Design Decisions

- **File Matching**: Agents are matched by base name. `debugger.md` (Claude) matches `debugger.agent.md` (Copilot).
- **Layered Validation**:
    - **CLI**: Validates paths exist and are accessible (fail fast).
    - **Orchestrator**: Validates format/type compatibility (business logic).
- **Security**: Pure data conversion with no code execution (`eval`/`exec`). Paths are resolved using `.resolve()` to safely handle symlinks.
- **Performance**: State tracking avoids re-syncing unchanged files; adapters are lazy-loaded only when needed.

---

## Extension Points

### Adding New Config Types
1. Define the canonical model in `core/canonical_models.py`.
2. Add to the `ConfigType` enum.
3. Implement handlers in each existing adapter's `handlers/` directory.
4. Register handlers in each adapter's `__init__()`.

### Adding New Formats
1. Copy the `adapters/example/` directory as a template.
2. Implement the `FormatAdapter` coordinator.
3. Implement handlers for each supported configuration type.
4. Register the new adapter in the application registry.

See [Adding New Formats](./adding-formats.md) for a detailed guide.

---

## Design Patterns Used

1. **Adapter Pattern**: Convert between incompatible interfaces.
2. **Strategy Pattern**: Pluggable conversion strategies.
3. **Registry Pattern**: Central directory of components.
4. **Hub-and-Spoke**: Centralized data model.
5. **Repository Pattern**: State persistence abstraction.