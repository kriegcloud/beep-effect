# Adding New Format Support

## Quick Start

1. Copy template:
```bash
cp -r adapters/example adapters/newformat
```

2. Implement adapter coordinator
3. Implement handlers for config types
4. Register adapter
5. Add tests and fixtures

## Step-by-Step Guide

### 1. Create Adapter Structure

```bash
adapters/newformat/
├── __init__.py          # Export adapter
├── adapter.py           # Adapter coordinator
└── handlers/
    ├── __init__.py
    ├── agent_handler.py
    ├── perm_handler.py
    └── slash_cmd_handler.py
```

### 2. Implement Adapter Coordinator

In `adapters/newformat/adapter.py`:

```python
from core.adapter_interface import FormatAdapter
from .handlers.agent_handler import NewFormatAgentHandler

class NewFormatAdapter(FormatAdapter):
    def __init__(self):
        super().__init__()
        self.format_name = "newformat"
        self.file_extension = ".new"

        # Register handlers for each config type
        self.register_handler("agent", NewFormatAgentHandler())
        # Add more handlers as needed

    def can_handle(self, file_path):
        return file_path.endswith(self.file_extension)
```

### 3. Implement Handlers

Each handler converts between format-specific and canonical models.

In `adapters/newformat/handlers/agent_handler.py`:

```python
from adapters.shared.handler_interface import ConfigHandler
from core.canonical_models import CanonicalAgent

class NewFormatAgentHandler(ConfigHandler):
    def to_canonical(self, content, file_path):
        """Convert format-specific content to CanonicalAgent"""
        # Parse format-specific structure
        # Extract standard fields
        # Store format-specific fields in metadata

        return CanonicalAgent(
            name=parsed_name,
            description=parsed_description,
            instructions=parsed_instructions,
            model=parsed_model,
            tools=parsed_tools,
            metadata={"newformat_specific_field": value}
        )

    def from_canonical(self, canonical, file_path):
        """Convert CanonicalAgent to format-specific content"""
        # Convert canonical fields to format structure
        # Retrieve format-specific fields from metadata
        # Generate format-specific content

        return formatted_content
```

### 4. Register Adapter

In application initialization or `core/registry.py`:

```python
from adapters.newformat import NewFormatAdapter

registry = FormatRegistry()
registry.register(NewFormatAdapter())
```

### 5. Add Tests

In `tests/test_adapters.py`:

```python
def test_newformat_to_canonical(tmp_path):
    adapter = NewFormatAdapter()

    # Create test input file
    input_file = tmp_path / "test.new"
    input_file.write_text("...")

    # Convert to canonical
    canonical = adapter.read(str(input_file), "agent")

    # Verify canonical model
    assert canonical.name == "expected_name"
    assert canonical.description == "expected_description"

def test_newformat_from_canonical(tmp_path):
    adapter = NewFormatAdapter()

    # Create canonical model
    canonical = CanonicalAgent(...)

    # Convert from canonical
    output_file = tmp_path / "output.new"
    adapter.write(canonical, str(output_file), "agent")

    # Verify output format
    content = output_file.read_text()
    assert "expected_content" in content
```

### 6. Add Fixtures

In `tests/fixtures/newformat/agents/`:

```
sample-agent.new       # Example agent file
another-agent.new      # Another example
```

## Handler Implementation Guidelines

### Use Shared Utilities

Leverage utilities from `adapters/shared/`:

```python
from adapters.shared.utils import extract_frontmatter, build_frontmatter
```

### Preserve Format-Specific Fields

Use metadata dictionary:

```python
# In to_canonical()
metadata = {
    "newformat_custom_field": parsed_value,
    "newformat_setting": parsed_setting
}

canonical = CanonicalAgent(..., metadata=metadata)

# In from_canonical()
custom_field = canonical.metadata.get("newformat_custom_field")
```

### Map Model Names

Convert between format-specific and canonical model names:

```python
MODEL_MAPPING = {
    "newformat-fast": "claude-sonnet-4",
    "newformat-smart": "claude-opus-4"
}

# In to_canonical()
canonical_model = MODEL_MAPPING.get(format_model, format_model)

# In from_canonical()
format_model = reverse_lookup(canonical.model, MODEL_MAPPING)
```

### Handle Missing Fields

Provide sensible defaults:

```python
description = parsed_data.get("description", "")
tools = parsed_data.get("tools", [])
```

## Testing Philosophy

Use integration-style tests:
- Real adapter implementations (no mocks)
- Real file I/O with `tmp_path` fixture
- Full pipeline verification
- Minimal mocking (only external dependencies)

This catches real issues like parsing errors, file extension handling, encoding problems.

## Checklist

- [ ] Adapter coordinator implemented
- [ ] Handler for each config type implemented
- [ ] Adapter registered in application
- [ ] Tests added for to_canonical()
- [ ] Tests added for from_canonical()
- [ ] Fixture files added
- [ ] Documentation updated
