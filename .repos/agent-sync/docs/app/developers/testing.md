# Testing Guide

## Philosophy

Integration-style testing over heavily mocked unit tests:
- Real adapter implementations (no adapter mocks)
- Real file I/O with pytest's `tmp_path` fixture
- Full pipeline verification (file → adapter → canonical → adapter → file)
- Minimal mocking (only external dependencies like `input()`)

This catches real integration issues that mocked tests miss:
- Format parsing errors
- File extension handling
- Encoding problems
- Round-trip conversion fidelity

## Running Tests

```bash
# All tests
pytest tests/

# Specific module
pytest tests/test_adapters.py -v

# Pattern matching
pytest tests/ -k "test_claude"

# With coverage
pytest tests/ --cov=. --cov-report=html
```

## Test Structure

```
tests/
├── test_adapters.py          # Adapter conversion tests
├── test_registry.py          # Format registry tests
├── test_orchestrator.py      # Sync orchestration tests
├── test_state_manager.py     # State tracking tests
├── test_cli.py               # CLI interface tests
└── fixtures/                 # Test data
    ├── claude/
    │   ├── agents/
    │   └── permissions/
    └── copilot/
        ├── agents/
        └── permissions/
```

## Writing Adapter Tests

### Test to_canonical()

Verify format → canonical conversion:

```python
def test_claude_agent_to_canonical(tmp_path):
    adapter = ClaudeAdapter()

    # Create input file
    input_file = tmp_path / "test.md"
    input_file.write_text("""
# Agent Name

Description here

## Instructions
Do this and that
""")

    # Convert to canonical
    canonical = adapter.read(str(input_file), "agent")

    # Verify canonical model
    assert isinstance(canonical, CanonicalAgent)
    assert canonical.name == "Agent Name"
    assert canonical.description == "Description here"
    assert "Do this and that" in canonical.instructions
```

### Test from_canonical()

Verify canonical → format conversion:

```python
def test_claude_agent_from_canonical(tmp_path):
    adapter = ClaudeAdapter()

    # Create canonical model
    canonical = CanonicalAgent(
        name="Test Agent",
        description="Test description",
        instructions="Test instructions",
        model="claude-sonnet-4",
        tools=["read", "write"]
    )

    # Convert to format
    output_file = tmp_path / "output.md"
    adapter.write(canonical, str(output_file), "agent")

    # Verify output
    content = output_file.read_text()
    assert "# Test Agent" in content
    assert "Test description" in content
    assert "Test instructions" in content
```

### Test Round-Trip Conversion

Verify no data loss:

```python
def test_claude_agent_roundtrip(tmp_path):
    adapter = ClaudeAdapter()

    # Original file
    original = tmp_path / "original.md"
    original.write_text("...")

    # Convert to canonical and back
    canonical = adapter.read(str(original), "agent")
    output = tmp_path / "output.md"
    adapter.write(canonical, str(output), "agent")

    # Verify equivalence (may need normalization)
    assert normalize(output.read_text()) == normalize(original.read_text())
```

## Writing Orchestrator Tests

Test sync operations:

```python
def test_orchestrator_sync_creates_missing(tmp_path):
    source_dir = tmp_path / "source"
    target_dir = tmp_path / "target"
    source_dir.mkdir()
    target_dir.mkdir()

    # Create source file
    (source_dir / "agent.md").write_text("...")

    # Sync
    orchestrator = UniversalSyncOrchestrator(
        source_dir=str(source_dir),
        target_dir=str(target_dir),
        source_format="claude",
        target_format="copilot",
        config_type="agent"
    )
    orchestrator.sync(dry_run=False)

    # Verify target created
    assert (target_dir / "agent.agent.md").exists()
```

## Writing CLI Tests

Test command-line interface:

```python
def test_cli_directory_sync(tmp_path, monkeypatch):
    source_dir = tmp_path / "source"
    target_dir = tmp_path / "target"
    source_dir.mkdir()
    target_dir.mkdir()

    # Mock sys.argv
    monkeypatch.setattr(sys, "argv", [
        "cli",
        "--source-dir", str(source_dir),
        "--target-dir", str(target_dir),
        "--source-format", "claude",
        "--target-format", "copilot",
        "--config-type", "agent",
        "--dry-run"
    ])

    # Run CLI
    main()

    # Verify output (capture with capsys fixture)
```

## Mocking Guidelines

Only mock external dependencies:

```python
# Mock user input
def test_conflict_resolution(tmp_path, monkeypatch):
    monkeypatch.setattr('builtins.input', lambda _: '1')
    # Test conflict resolution with mocked user input

# Mock network requests (if applicable)
def test_fetch_documentation(monkeypatch):
    def mock_get(*args, **kwargs):
        class MockResponse:
            def __init__(self):
                self.text = "<html>...</html>"
        return MockResponse()

    monkeypatch.setattr(requests, "get", mock_get)
    # Test with mocked HTTP request
```

## Fixtures

Create reusable test data in `tests/fixtures/`:

```
fixtures/
├── claude/
│   ├── agents/
│   │   ├── planner.md
│   │   └── debugger.md
│   └── permissions/
│       └── default.md
└── copilot/
    ├── agents/
    │   ├── planner.agent.md
    │   └── debugger.agent.md
    └── permissions/
        └── default.json
```

Use fixtures in tests:

```python
def test_with_fixture(tmp_path):
    fixture_path = "tests/fixtures/claude/agents/planner.md"
    with open(fixture_path) as f:
        content = f.read()

    # Use fixture content in test
    input_file = tmp_path / "test.md"
    input_file.write_text(content)
```

## Best Practices

1. **Use tmp_path for file operations**: Isolates test files
2. **Test real pipelines**: Verify end-to-end conversions
3. **Test error cases**: Invalid input, missing fields, malformed data
4. **Test edge cases**: Empty files, special characters, unicode
5. **Keep tests fast**: Avoid unnecessary I/O or setup
6. **Clear test names**: `test_<what>_<condition>_<expected>`
7. **Single assertion focus**: Each test verifies one behavior
8. **Arrange-Act-Assert**: Clear test structure

## Coverage

Aim for high coverage of critical paths:
- Adapter conversions (to/from canonical)
- Orchestrator sync logic
- Conflict resolution
- State management
- CLI argument parsing

Use pytest-cov:

```bash
pytest tests/ --cov=. --cov-report=html
open htmlcov/index.html
```
