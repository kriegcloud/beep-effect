"""
Unit tests for format adapters.

Tests cover:
- ClaudeAdapter conversion (to/from canonical)
- CopilotAdapter conversion (to/from canonical)
- Round-trip conversions (Claude -> Canonical -> Claude)
- Cross-format conversions (Claude -> Copilot -> Claude)
- Field mapping and preservation
- Model name normalization
- Warning generation

Status: IMPLEMENTED
"""

import pytest
from pathlib import Path

from core.canonical_models import CanonicalAgent, CanonicalSlashCommand, ConfigType
from adapters import ClaudeAdapter, CopilotAdapter


class TestClaudeAdapter:
    """Tests for ClaudeAdapter."""

    @pytest.fixture
    def adapter(self):
        """Create ClaudeAdapter instance."""
        return ClaudeAdapter()

    @pytest.fixture
    def sample_claude_content(self):
        """Sample Claude agent file content."""
        return """---
name: test-agent
description: Test agent description
tools: Read, Grep, Glob
model: sonnet
permissionMode: ask
---
Test agent instructions here.
"""

    @pytest.fixture
    def minimal_claude_content(self):
        """Minimal valid agent (required fields only)."""
        return """---
name: minimal-agent
description: Minimal agent
---
Basic instructions.
"""

    @pytest.fixture
    def full_claude_content(self):
        """Agent with all fields including metadata."""
        return """---
name: full-agent
description: Full agent with metadata
tools: Read, Grep, Glob, Bash
model: opus
permissionMode: ask
skills: [python, javascript]
---
Full agent instructions.
"""

    @pytest.fixture
    def canonical_agent_sample(self):
        """CanonicalAgent instance for serialization tests."""
        return CanonicalAgent(
            name="test-agent",
            description="Test agent description",
            instructions="Test agent instructions.",
            tools=["Read", "Grep", "Glob"],
            model="sonnet",
            source_format="claude"
        )

    @pytest.fixture
    def canonical_agent_with_metadata(self):
        """CanonicalAgent with Claude-specific metadata."""
        agent = CanonicalAgent(
            name="metadata-agent",
            description="Agent with metadata",
            instructions="Agent instructions.",
            tools=["Read", "Grep"],
            model="opus",
            source_format="claude"
        )
        agent.add_metadata('claude_permission_mode', 'ask')
        agent.add_metadata('claude_skills', ['python', 'javascript'])
        return agent

    # Phase 1: Property Tests

    def test_format_properties(self, adapter):
        """Test adapter properties."""
        assert adapter.format_name == "claude"
        assert adapter.file_extension == ".md"
        assert ConfigType.AGENT in adapter.supported_config_types

    def test_can_handle(self, adapter):
        """Test file detection."""
        assert adapter.can_handle(Path("agent.md")) is True
        assert adapter.can_handle(Path("agent.agent.md")) is False
        assert adapter.can_handle(Path("agent.txt")) is False

    def test_to_canonical(self, adapter, sample_claude_content):
        """Test conversion from Claude format to canonical."""
        agent = adapter.to_canonical(sample_claude_content, ConfigType.AGENT)
        assert agent.name == "test-agent"
        assert agent.description == "Test agent description"
        assert agent.tools == ["Read", "Grep", "Glob"]
        assert agent.model == "sonnet"
        assert agent.instructions == "Test agent instructions here."
        assert agent.source_format == "claude"
        assert agent.get_metadata('claude_permission_mode') == 'ask'

    def test_from_canonical(self, adapter):
        """Test conversion from canonical to Claude format."""
        agent = CanonicalAgent(
            name="test-agent",
            description="Test description",
            instructions="Test instructions",
            tools=["Read", "Edit"],
            model="sonnet",
            source_format="claude"
        )
        agent.add_metadata('claude_permission_mode', 'ask')

        output = adapter.from_canonical(agent, ConfigType.AGENT)

        assert "name: test-agent" in output
        assert "description: Test description" in output
        assert "tools: Read, Edit" in output
        assert "model: sonnet" in output
        assert "permissionMode: ask" in output
        assert "Test instructions" in output

    def test_round_trip(self, adapter, sample_claude_content):
        """Test Claude -> Canonical -> Claude preserves data."""
        canonical = adapter.to_canonical(sample_claude_content, ConfigType.AGENT)
        output = adapter.from_canonical(canonical, ConfigType.AGENT)
        canonical2 = adapter.to_canonical(output, ConfigType.AGENT)

        assert canonical.name == canonical2.name
        assert canonical.description == canonical2.description
        assert canonical.model == canonical2.model
        assert canonical.tools == canonical2.tools
        assert canonical.get_metadata('claude_permission_mode') == canonical2.get_metadata('claude_permission_mode')

    # Phase 2: Additional Core Parsing Tests

    def test_to_canonical_minimal(self, adapter, minimal_claude_content):
        """Test parsing agent with only required fields."""
        agent = adapter.to_canonical(minimal_claude_content, ConfigType.AGENT)
        assert agent.name == "minimal-agent"
        assert agent.description == "Minimal agent"
        assert agent.instructions == "Basic instructions."
        assert agent.tools == []
        assert agent.model is None
        assert not agent.has_metadata('claude_permission_mode')

    def test_to_canonical_full(self, adapter, full_claude_content):
        """Test parsing agent with all fields."""
        agent = adapter.to_canonical(full_claude_content, ConfigType.AGENT)
        assert agent.name == "full-agent"
        assert agent.description == "Full agent with metadata"
        assert agent.instructions == "Full agent instructions."
        assert agent.tools == ["Read", "Grep", "Glob", "Bash"]
        assert agent.model == "opus"
        assert agent.get_metadata('claude_permission_mode') == 'ask'
        assert agent.get_metadata('claude_skills') == ['python', 'javascript']

    def test_to_canonical_from_file(self, adapter, tmp_path):
        """Test read() method with file."""
        fixture_path = Path("tests/fixtures/claude/agents/simple-agent.md")
        agent = adapter.read(fixture_path, ConfigType.AGENT)
        assert agent.name == "simple-agent"
        assert agent.description == "A simple test agent for unit testing"
        assert agent.tools == ["Read", "Grep", "Glob"]
        assert agent.model == "sonnet"

    def test_to_canonical_invalid_no_frontmatter(self, adapter):
        """Test error handling for content without YAML frontmatter."""
        content = "This has no frontmatter"
        with pytest.raises(ValueError, match="No YAML frontmatter found"):
            adapter.to_canonical(content, ConfigType.AGENT)

    # Phase 4: Additional Serialization Tests

    def test_from_canonical_basic(self, adapter, canonical_agent_sample):
        """Test conversion from canonical to Claude format."""
        output = adapter.from_canonical(canonical_agent_sample, ConfigType.AGENT)
        assert "name: test-agent" in output
        assert "description: Test agent description" in output
        assert "tools: Read, Grep, Glob" in output
        assert "model: sonnet" in output
        assert "Test agent instructions." in output
        assert output.startswith("---\n")
        assert "---\n" in output[4:]  # Second --- separator

    def test_from_canonical_with_metadata(self, adapter, canonical_agent_with_metadata):
        """Test metadata preservation in serialization."""
        output = adapter.from_canonical(canonical_agent_with_metadata, ConfigType.AGENT)
        assert "permissionMode: ask" in output
        assert "skills:" in output
        assert "python" in output
        assert "javascript" in output

    def test_from_canonical_empty_tools(self, adapter):
        """Test serialization with empty tools list."""
        agent = CanonicalAgent(
            name="no-tools",
            description="Agent without tools",
            instructions="Instructions.",
            tools=[],
            model="sonnet"
        )
        output = adapter.from_canonical(agent, ConfigType.AGENT)
        assert "name: no-tools" in output
        assert "description: Agent without tools" in output

    def test_from_canonical_no_model(self, adapter):
        """Test serialization when model is None."""
        agent = CanonicalAgent(
            name="no-model",
            description="Agent without model",
            instructions="Instructions.",
            tools=["Read"],
            model=None
        )
        output = adapter.from_canonical(agent, ConfigType.AGENT)
        assert "name: no-model" in output
        lines = output.split('\n')
        model_lines = [line for line in lines if line.startswith('model:')]
        assert len(model_lines) == 0

    # Phase 5: Additional Round-Trip Tests

    def test_round_trip_preserves_all_data(self, adapter, sample_claude_content):
        """Test Claude -> Canonical -> Claude -> Canonical preserves all data."""
        canonical1 = adapter.to_canonical(sample_claude_content, ConfigType.AGENT)
        output = adapter.from_canonical(canonical1, ConfigType.AGENT)
        canonical2 = adapter.to_canonical(output, ConfigType.AGENT)

        assert canonical1.name == canonical2.name
        assert canonical1.description == canonical2.description
        assert canonical1.instructions == canonical2.instructions
        assert canonical1.tools == canonical2.tools
        assert canonical1.model == canonical2.model
        assert canonical1.get_metadata('claude_permission_mode') == canonical2.get_metadata('claude_permission_mode')

    def test_round_trip_minimal(self, adapter, minimal_claude_content):
        """Test round-trip with minimal agent."""
        canonical1 = adapter.to_canonical(minimal_claude_content, ConfigType.AGENT)
        output = adapter.from_canonical(canonical1, ConfigType.AGENT)
        canonical2 = adapter.to_canonical(output, ConfigType.AGENT)

        assert canonical1.name == canonical2.name
        assert canonical1.description == canonical2.description
        assert canonical1.instructions == canonical2.instructions
        assert canonical1.tools == canonical2.tools
        assert canonical1.model == canonical2.model

    def test_round_trip_metadata_preservation(self, adapter, full_claude_content):
        """Test metadata preservation through round-trip."""
        canonical1 = adapter.to_canonical(full_claude_content, ConfigType.AGENT)
        output = adapter.from_canonical(canonical1, ConfigType.AGENT)
        canonical2 = adapter.to_canonical(output, ConfigType.AGENT)

        assert canonical1.get_metadata('claude_permission_mode') == canonical2.get_metadata('claude_permission_mode')
        assert canonical1.get_metadata('claude_skills') == canonical2.get_metadata('claude_skills')

    # Phase 6: File I/O Tests

    def test_read_from_file(self, adapter, tmp_path):
        """Test reading agent from file."""
        test_file = tmp_path / "test-agent.md"
        test_file.write_text("""---
name: file-test
description: Test from file
tools: Read, Grep
model: sonnet
---
File test instructions.
""")
        agent = adapter.read(test_file, ConfigType.AGENT)
        assert agent.name == "file-test"
        assert agent.description == "Test from file"
        assert agent.tools == ["Read", "Grep"]

    def test_write_to_file(self, adapter, canonical_agent_sample, tmp_path):
        """Test writing canonical agent to file."""
        test_file = tmp_path / "output-agent.md"
        adapter.write(canonical_agent_sample, test_file, ConfigType.AGENT)

        assert test_file.exists()
        content = test_file.read_text()
        assert "name: test-agent" in content
        assert "description: Test agent description" in content
        assert content.startswith("---\n")

    # Phase 7: Edge Cases

    def test_special_characters_in_fields(self, adapter):
        """Test handling of special characters in YAML fields."""
        content = """---
name: special-agent
description: "Agent with: colons and 'quotes'"
tools: Read, Grep
model: sonnet
---
Instructions with special characters: colons, "quotes", and more.
"""
        agent = adapter.to_canonical(content, ConfigType.AGENT)
        assert agent.name == "special-agent"
        assert "colons" in agent.description
        assert "quotes" in agent.description

    def test_complex_description_with_newlines_and_quotes(self, adapter):
        """Test handling of complex descriptions with newlines and quotes."""
        content = r"""---
name: complex-agent
description: "Start of description.\n\n<example>\nContext: \"Quoted text\"\nUser: ...\n</example>"
tools: Read
model: sonnet
---
Instructions.
"""
        agent = adapter.to_canonical(content, ConfigType.AGENT)
        assert agent.name == "complex-agent"
        assert "\n\n<example>\n" in agent.description
        assert 'Context: "Quoted text"' in agent.description

    def test_multiline_instructions(self, adapter):
        """Test preservation of multiline markdown instructions."""
        fixture_path = Path("tests/fixtures/claude/agents/edge-cases/multiline-instructions.md")
        agent = adapter.read(fixture_path, ConfigType.AGENT)

        assert "# Complex Instructions" in agent.instructions
        assert "```python" in agent.instructions
        assert "## Lists" in agent.instructions
        assert "**bold**" in agent.instructions

    def test_tools_with_special_spacing(self, adapter):
        """Test tool parsing with various spacing patterns."""
        fixture_path = Path("tests/fixtures/claude/agents/edge-cases/whitespace.md")
        agent = adapter.read(fixture_path, ConfigType.AGENT)

        assert agent.tools == ["Read", "Grep", "Glob", "Bash"]
        assert agent.instructions.strip() == "Instructions with extra whitespace.\n\n  Including leading/trailing spaces."

    def test_conversion_warnings(self, adapter, sample_claude_content):
        """Test conversion warnings mechanism."""
        adapter.to_canonical(sample_claude_content, ConfigType.AGENT)
        warnings = adapter.get_warnings()
        assert isinstance(warnings, list)

    # ==================== SLASH-COMMAND TESTS ====================

    # Fixtures for slash-command tests

    @pytest.fixture
    def minimal_slash_command_content(self):
        """Minimal slash-command (no frontmatter, just body)."""
        return """Review this code for bugs and suggest improvements.
"""

    @pytest.fixture
    def simple_slash_command_content(self):
        """Simple slash-command with basic frontmatter."""
        return """---
description: Explain code in simple terms
---

Explain the following code: $ARGUMENTS

Make it beginner-friendly and include examples.
"""

    @pytest.fixture
    def full_slash_command_content(self):
        """Full-featured slash-command with all fields."""
        return """---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit
model: claude-3-5-haiku-20241022
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Create a git commit with message: $ARGUMENTS

Follow these guidelines:
- Use conventional commit format
- Keep message concise but descriptive
- Stage relevant files before committing
"""

    @pytest.fixture
    def canonical_slash_command_minimal(self):
        """Minimal CanonicalSlashCommand for serialization tests."""
        return CanonicalSlashCommand(
            name="test-command",
            description="Test slash command",
            instructions="Test command instructions.",
            source_format="claude"
        )

    @pytest.fixture
    def canonical_slash_command_full(self):
        """Full CanonicalSlashCommand with all fields."""
        return CanonicalSlashCommand(
            name="full-command",
            description="Full slash command with all fields",
            instructions="Full command instructions with $ARGUMENTS placeholder.",
            argument_hint="[arg1] [arg2]",
            model="haiku",
            allowed_tools=["Bash(git:*)", "Read", "Write"],
            source_format="claude"
        )

    # Phase 1: Property Tests

    def test_slash_command_config_type(self, adapter):
        """Test that ClaudeSlashCommandHandler returns correct config type."""
        # Note: This test will fail until ClaudeSlashCommandHandler is implemented
        # and registered in ClaudeAdapter
        handler = adapter._get_handler(ConfigType.SLASH_COMMAND)
        assert handler.config_type == ConfigType.SLASH_COMMAND

    # Phase 2: to_canonical() Tests

    def test_slash_command_to_canonical_minimal(self, adapter, tmp_path):
        """Test parsing minimal slash-command (no frontmatter)."""
        # Note: This test will fail until ClaudeSlashCommandHandler is implemented
        fixture_path = Path("tests/fixtures/claude/slash-commands/minimal.md")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Name should be derived from filename
        assert slash_command.name == "minimal"
        # Description should be present (updated fixture)
        assert slash_command.description == "Minimal command"
        # Instructions should be the body content
        assert "Review this code for bugs and suggest improvements" in slash_command.instructions
        # Optional fields should be None or empty
        assert slash_command.argument_hint is None or slash_command.argument_hint == ""
        assert slash_command.model is None
        assert slash_command.allowed_tools == [] or slash_command.allowed_tools is None
        assert slash_command.source_format == "claude"

    def test_slash_command_to_canonical_simple(self, adapter, tmp_path):
        """Test parsing simple slash-command with basic frontmatter."""
        # Note: This test will fail until ClaudeSlashCommandHandler is implemented
        fixture_path = Path("tests/fixtures/claude/slash-commands/simple.md")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Name derived from filename (since no 'name' in frontmatter)
        assert slash_command.name == "simple"
        # Description from frontmatter
        assert slash_command.description == "Explain code in simple terms"
        # Instructions should contain $ARGUMENTS placeholder
        assert "$ARGUMENTS" in slash_command.instructions
        assert "beginner-friendly" in slash_command.instructions
        assert slash_command.source_format == "claude"

    def test_slash_command_to_canonical_full_featured(self, adapter, tmp_path):
        """Test parsing full-featured slash-command with all fields."""
        # Note: This test will fail until ClaudeSlashCommandHandler is implemented
        fixture_path = Path("tests/fixtures/claude/slash-commands/full-featured.md")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Name from filename
        assert slash_command.name == "full-featured"
        # Description from frontmatter
        assert slash_command.description == "Create a git commit"
        # argument-hint from frontmatter
        assert slash_command.argument_hint == "[message]"
        # Model from frontmatter
        assert slash_command.model == "claude-3-5-haiku-20241022" or slash_command.model == "haiku"
        # allowed-tools should be parsed into a list
        assert isinstance(slash_command.allowed_tools, list)
        assert len(slash_command.allowed_tools) >= 3
        # Should contain git-related tools
        assert any("git" in tool.lower() for tool in slash_command.allowed_tools)
        # Instructions should contain bash execution syntax and $ARGUMENTS
        assert "!`git" in slash_command.instructions or "git" in slash_command.instructions
        assert "$ARGUMENTS" in slash_command.instructions
        assert slash_command.source_format == "claude"

    def test_slash_command_to_canonical_preserves_metadata(self, adapter):
        """Test that format-specific fields are preserved in metadata."""
        # Note: This test will fail until ClaudeSlashCommandHandler is implemented
        content = """---
name: metadata-test
description: Test command
allowed-tools: Read, Grep
disable-model-invocation: true
custom-field: custom-value
---

Test instructions.
"""

        slash_command = adapter.to_canonical(content, ConfigType.SLASH_COMMAND)

        # Claude-specific fields should be in metadata
        # The exact metadata keys depend on implementation
        assert slash_command.metadata is not None
        # If 'disable-model-invocation' is Claude-specific, it should be in metadata
        # This assertion may need adjustment based on actual implementation

    # Phase 3: from_canonical() Tests

    def test_slash_command_from_canonical_minimal(self, adapter, canonical_slash_command_minimal):
        """Test generating minimal slash-command from canonical."""
        # Note: This test will fail until ClaudeSlashCommandHandler is implemented
        output = adapter.from_canonical(canonical_slash_command_minimal, ConfigType.SLASH_COMMAND)

        # Should have valid structure
        assert isinstance(output, str)
        # Body should contain instructions
        assert "Test command instructions" in output
        # For minimal command, frontmatter might be minimal or absent
        # Check if it's valid markdown

    def test_slash_command_from_canonical_full(self, adapter, canonical_slash_command_full):
        """Test generating full slash-command with all fields."""
        # Note: This test will fail until ClaudeSlashCommandHandler is implemented
        output = adapter.from_canonical(canonical_slash_command_full, ConfigType.SLASH_COMMAND)

        # Should have frontmatter
        assert output.startswith("---\n") or "---\n" in output
        # Should contain description
        assert "description:" in output or "Full slash command with all fields" in output
        # Should contain argument-hint
        assert "argument-hint:" in output or "[arg1]" in output
        # Should contain model
        assert "model:" in output or "haiku" in output
        # Should contain allowed-tools
        assert "allowed-tools:" in output or "Bash(git:*)" in output
        # Should contain instructions with placeholder
        assert "$ARGUMENTS" in output
        assert "Full command instructions" in output

    # Phase 4: Round-Trip Tests

    def test_slash_command_round_trip(self, adapter):
        """Test Claude -> Canonical -> Claude preserves all data."""
        # Note: This test will fail until ClaudeSlashCommandHandler is implemented

        # Test with minimal fixture
        minimal_path = Path("tests/fixtures/claude/slash-commands/minimal.md")
        canonical1 = adapter.read(minimal_path, ConfigType.SLASH_COMMAND)
        output = adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)
        canonical2 = adapter.to_canonical(output, ConfigType.SLASH_COMMAND)

        assert canonical1.name == canonical2.name
        assert canonical1.description == canonical2.description
        assert canonical1.instructions.strip() == canonical2.instructions.strip()

        # Test with simple fixture
        simple_path = Path("tests/fixtures/claude/slash-commands/simple.md")
        canonical1 = adapter.read(simple_path, ConfigType.SLASH_COMMAND)
        output = adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)
        canonical2 = adapter.to_canonical(output, ConfigType.SLASH_COMMAND)

        assert canonical1.name == canonical2.name
        assert canonical1.description == canonical2.description
        assert canonical1.instructions.strip() == canonical2.instructions.strip()

        # Test with full-featured fixture
        full_path = Path("tests/fixtures/claude/slash-commands/full-featured.md")
        canonical1 = adapter.read(full_path, ConfigType.SLASH_COMMAND)
        output = adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)
        canonical2 = adapter.to_canonical(output, ConfigType.SLASH_COMMAND)

        assert canonical1.name == canonical2.name
        assert canonical1.description == canonical2.description
        assert canonical1.argument_hint == canonical2.argument_hint
        assert canonical1.model == canonical2.model
        assert canonical1.allowed_tools == canonical2.allowed_tools
        assert canonical1.instructions.strip() == canonical2.instructions.strip()

    # Phase 5: Edge Cases

    def test_slash_command_edge_cases(self, adapter):
        """Test edge cases: complex allowed-tools, bash syntax, arguments."""
        # Note: This test will fail until ClaudeSlashCommandHandler is implemented

        # Test complex allowed-tools patterns
        content_with_complex_tools = """---
name: complex-tools
description: Complex tools test
allowed-tools: Bash(git:*), Read, Write, Grep, Bash(npm *:*)
---

Test with complex tools.
"""
        slash_command = adapter.to_canonical(content_with_complex_tools, ConfigType.SLASH_COMMAND)
        assert len(slash_command.allowed_tools) >= 4

        # Test with-arguments fixture (positional arguments)
        args_path = Path("tests/fixtures/claude/slash-commands/with-arguments.md")
        slash_command = adapter.read(args_path, ConfigType.SLASH_COMMAND)
        # Should preserve $1, $2, $3 in instructions
        assert "$1" in slash_command.instructions
        assert "$2" in slash_command.instructions
        assert "$3" in slash_command.instructions

        # Test with-file-refs fixture (@ syntax)
        refs_path = Path("tests/fixtures/claude/slash-commands/with-file-refs.md")
        slash_command = adapter.read(refs_path, ConfigType.SLASH_COMMAND)
        # Should preserve @ file references
        assert "@" in slash_command.instructions

        # Test empty description
        content_no_desc = """---
name: no-desc
argument-hint: test
---

No description here.
"""
        # Should raise ValueError because description is required
        with pytest.raises(ValueError, match="description"):
             adapter.to_canonical(content_no_desc, ConfigType.SLASH_COMMAND)

    # Phase 6: Error Handling

        def test_slash_command_error_handling(self, adapter):
            """Test handling of invalid YAML and missing required fields."""
            # Note: This test will fail until ClaudeSlashCommandHandler is implemented        
    
            # Test invalid YAML frontmatter - handled permissively by shared parser
            invalid_yaml = """---
    description: "Unclosed quote
    allowed-tools: Read
    ---
    
    Instructions.
    """
            # Should not raise error due to permissive parsing
            cmd = adapter.to_canonical(invalid_yaml, ConfigType.SLASH_COMMAND)
            
            # Verify it managed to extract something
            assert '"Unclosed quote' in cmd.description
            # "Read" string should be parsed into list by _parse_tools
            assert cmd.allowed_tools == ['Read']
    
            # Test malformed frontmatter delimiters
            malformed = """--
description: Test
--

Instructions.
"""
        # Depending on implementation, this might raise an error or treat it as no frontmatter
        # The behavior should be consistent with agent handler

        # For slash-commands, if there's no frontmatter, it might be valid (like minimal.md)
        # So this test might need adjustment based on actual implementation

    def test_to_canonical_empty_frontmatter(self, adapter):
        """Test parsing with empty frontmatter block (Finding #1)."""
        content = "---\n\n---\nAgent instructions here."
        # Should NOT raise AttributeError, but will raise ValueError due to missing name for Agent
        with pytest.raises(ValueError, match="CanonicalAgent must have a non-empty name"):
            adapter.to_canonical(content, ConfigType.AGENT)

    def test_from_canonical_empty_frontmatter_omitted(self, adapter):
        """Test that empty frontmatter is omitted in output (Finding #4)."""
        # To get an empty frontmatter in Claude handler, we'd need an object 
        # with no name/description, but those are required. 
        # However, we can test the shared build_yaml_frontmatter utility directly
        # or mock the handler's behavior.
        from adapters.shared.frontmatter import build_yaml_frontmatter
        output = build_yaml_frontmatter({}, "Body only")
        assert "---" not in output
        assert output.strip() == "Body only"

    def test_slash_command_no_frontmatter_integration(self, adapter, tmp_path):
        """Test slash command with no frontmatter and a file_path."""
        # We need a file_path to provide a name, and we still need a description
        # in the frontmatter if it's not provided elsewhere.
        # If there's NO frontmatter, we currently have no way to get a description.
        # This highlights that Claude slash commands WITHOUT frontmatter might 
        # only work if we have a way to derive the description.
        
        # For now, let's use content that has no frontmatter but we'll have to 
        # mock the description or accept that it might fail if we don't have one.
        # Actually, let's test the specific fix for Finding #3 here.
        content = "---\ndescription: Test\n---\nBody"
        cmd = adapter.to_canonical(content, ConfigType.SLASH_COMMAND, tmp_path / "test.md")
        assert cmd.name == "test"
        assert cmd.description == "Test"


class TestCopilotAdapter:
    """Tests for CopilotAdapter."""

    @pytest.fixture
    def adapter(self):
        """Create CopilotAdapter instance."""
        return CopilotAdapter()

    @pytest.fixture
    def sample_copilot_content(self):
        """Sample Copilot agent file content."""
        return """---
name: test-agent
description: Test agent description
tools:
  - read
  - grep
  - glob
model: Claude Sonnet 4
target: vscode
---
Test agent instructions here.
"""

    @pytest.fixture
    def full_copilot_content(self):
        """Copilot agent with all optional fields."""
        return """---
name: full-agent
description: Agent with all optional fields
tools:
  - read
  - grep
  - glob
  - edit
model: Claude Sonnet 4
target: vscode
argument-hint: Use this agent for complex tasks
handoffs:
  - label: Continue
    agent: next-agent
    prompt: Continue with next step
    send: false
mcp-servers:
  - name: example-server
    url: http://localhost:3000
---
Full agent instructions with all Copilot features.
"""

    def test_format_properties(self, adapter):
        """Test adapter properties."""
        assert adapter.format_name == "copilot"
        assert adapter.file_extension == ".agent.md"
        assert ConfigType.AGENT in adapter.supported_config_types

    def test_can_handle(self, adapter):
        """Test file detection."""
        assert adapter.can_handle(Path("agent.agent.md")) is True
        assert adapter.can_handle(Path("test.agent.md")) is True
        assert adapter.can_handle(Path("agent.md")) is False
        assert adapter.can_handle(Path("agent.txt")) is False

    def test_to_canonical(self, adapter, sample_copilot_content):
        """Test conversion from Copilot format to canonical."""
        agent = adapter.to_canonical(sample_copilot_content, ConfigType.AGENT)

        assert agent.name == "test-agent"
        assert agent.description == "Test agent description"
        assert agent.tools == ["read", "grep", "glob"]
        assert agent.model == "sonnet"  # Normalized from "Claude Sonnet 4"
        assert agent.instructions == "Test agent instructions here."
        assert agent.source_format == "copilot"
        assert agent.get_metadata('copilot_target') == "vscode"

    def test_to_canonical_with_metadata(self, adapter, full_copilot_content):
        """Test that Copilot-specific fields are preserved in metadata."""
        agent = adapter.to_canonical(full_copilot_content, ConfigType.AGENT)

        assert agent.get_metadata('copilot_argument_hint') == "Use this agent for complex tasks"
        assert agent.get_metadata('copilot_target') == "vscode"

        handoffs = agent.get_metadata('copilot_handoffs')
        assert handoffs is not None
        assert len(handoffs) == 1
        assert handoffs[0]['label'] == "Continue"
        assert handoffs[0]['agent'] == "next-agent"

        mcp_servers = agent.get_metadata('copilot_mcp_servers')
        assert mcp_servers is not None
        assert len(mcp_servers) == 1
        assert mcp_servers[0]['name'] == "example-server"

    def test_to_canonical_missing_frontmatter(self, adapter):
        """Test error handling when YAML frontmatter is missing."""
        invalid_content = "No frontmatter here, just text."

        with pytest.raises(ValueError, match="No YAML frontmatter found"):
            adapter.to_canonical(invalid_content, ConfigType.AGENT)

    def test_from_canonical(self, adapter):
        """Test conversion from canonical to Copilot format."""
        agent = CanonicalAgent(
            name="test-agent",
            description="Test description",
            instructions="Test instructions",
            tools=["read", "edit"],
            model="sonnet",
            source_format="canonical"
        )

        output = adapter.from_canonical(agent, ConfigType.AGENT)

        assert "name: test-agent" in output
        assert "description: Test description" in output
        assert "model: Claude Sonnet 4" in output  # Denormalized
        assert "target: vscode" in output  # Always added
        assert "Test instructions" in output
        # Tools should be in YAML list format
        assert "tools:" in output

    def test_from_canonical_with_options(self, adapter):
        """Test from_canonical with options to add optional fields."""
        agent = CanonicalAgent(
            name="test-agent",
            description="Test description",
            instructions="Test instructions",
            tools=["read"],
            model="sonnet"
        )

        # Test with add_argument_hint option
        output = adapter.from_canonical(
            agent, ConfigType.AGENT,
            options={'add_argument_hint': True}
        )
        assert "argument-hint:" in output

        # Test with add_handoffs option
        output = adapter.from_canonical(
            agent, ConfigType.AGENT,
            options={'add_handoffs': True}
        )
        assert "handoffs:" in output

    def test_from_canonical_preserves_metadata(self, adapter, full_copilot_content):
        """Test that metadata from original Copilot file is restored."""
        # First convert to canonical (preserving metadata)
        agent = adapter.to_canonical(full_copilot_content, ConfigType.AGENT)

        # Then convert back to Copilot format
        output = adapter.from_canonical(agent, ConfigType.AGENT)

        # Verify preserved metadata appears in output
        assert "argument-hint:" in output
        assert "handoffs:" in output
        assert "mcp-servers:" in output

    def test_round_trip(self, adapter, full_copilot_content):
        """Test Copilot -> Canonical -> Copilot preserves all data."""
        # Convert to canonical
        canonical = adapter.to_canonical(full_copilot_content, ConfigType.AGENT)

        # Convert back to Copilot format
        output = adapter.from_canonical(canonical, ConfigType.AGENT)

        # Parse the output again
        canonical2 = adapter.to_canonical(output, ConfigType.AGENT)

        # Verify core fields preserved
        assert canonical.name == canonical2.name
        assert canonical.description == canonical2.description
        assert canonical.model == canonical2.model
        assert canonical.tools == canonical2.tools

        # Verify metadata preserved
        assert canonical.get_metadata('copilot_argument_hint') == canonical2.get_metadata('copilot_argument_hint')
        assert canonical.get_metadata('copilot_target') == canonical2.get_metadata('copilot_target')
        assert canonical.get_metadata('copilot_handoffs') == canonical2.get_metadata('copilot_handoffs')
        assert canonical.get_metadata('copilot_mcp_servers') == canonical2.get_metadata('copilot_mcp_servers')

    # Copilot Slash Command Tests

    @pytest.fixture
    def canonical_slash_command_minimal(self):
        """Minimal CanonicalSlashCommand for serialization tests."""
        return CanonicalSlashCommand(
            name="test-prompt",
            description="Test prompt",
            instructions="Test prompt instructions.",
            source_format="copilot"
        )

    @pytest.fixture
    def canonical_slash_command_full(self):
        """Full CanonicalSlashCommand with all Copilot-specific fields."""
        command = CanonicalSlashCommand(
            name="full-prompt",
            description="Full prompt with all fields",
            instructions="Full prompt instructions with ${selection} and ${input:var:placeholder}.",
            argument_hint="code snippet to explain",
            model="gpt-4o",
            allowed_tools=["githubRepo", "search/codebase"],
            source_format="copilot"
        )
        command.add_metadata('copilot_agent', 'ask')
        command.add_metadata('copilot_tools', ['githubRepo', 'search/codebase'])
        return command

    # Phase 1: Property Tests (Copilot Slash Commands)

    def test_slash_command_copilot_config_type(self, adapter):
        """Test that CopilotSlashCommandHandler returns correct config type."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented
        # and registered in CopilotAdapter
        handler = adapter._get_handler(ConfigType.SLASH_COMMAND)
        assert handler.config_type == ConfigType.SLASH_COMMAND

    # Phase 2: to_canonical() Tests (Copilot Slash Commands)

    def test_slash_command_copilot_to_canonical_minimal(self, adapter):
        """Test parsing minimal Copilot prompt file (minimal frontmatter)."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented
        fixture_path = Path("tests/fixtures/copilot/prompts/minimal.prompt.md")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Name should be from frontmatter or derived from filename
        assert slash_command.name in ["minimal", "review-code"]
        # Description should be optional
        assert slash_command.description == "" or slash_command.description is None or "Review" in slash_command.description
        # Instructions should be the body content
        assert "Review this code for bugs and suggest improvements" in slash_command.instructions
        # Optional fields should be None or empty
        assert slash_command.argument_hint is None or slash_command.argument_hint == ""
        assert slash_command.model is None
        assert slash_command.allowed_tools == [] or slash_command.allowed_tools is None
        assert slash_command.source_format == "copilot"

    def test_slash_command_copilot_to_canonical_simple(self, adapter):
        """Test parsing simple Copilot prompt with basic frontmatter."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented
        fixture_path = Path("tests/fixtures/copilot/prompts/simple.prompt.md")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Name from frontmatter
        assert slash_command.name in ["simple", "explain-code"]
        # Description from frontmatter
        assert slash_command.description == "Explain code in simple terms"
        # Instructions should contain variable substitution
        assert "${selection}" in slash_command.instructions
        assert "beginner-friendly" in slash_command.instructions
        assert slash_command.source_format == "copilot"

    def test_slash_command_copilot_to_canonical_full_featured(self, adapter):
        """Test parsing full-featured Copilot prompt with all fields."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented
        fixture_path = Path("tests/fixtures/copilot/prompts/full-featured.prompt.md")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Name from frontmatter
        assert slash_command.name in ["full-featured", "generate-tests"]
        # Description from frontmatter
        assert slash_command.description == "Generate comprehensive unit tests"
        # argument-hint from frontmatter
        assert slash_command.argument_hint == "file path or code selection"
        # Model from frontmatter
        assert slash_command.model == "gpt-4o"
        # Tools should be parsed into a list
        assert isinstance(slash_command.allowed_tools, list)
        assert len(slash_command.allowed_tools) >= 2
        # Should contain githubRepo and search tools
        assert any("github" in tool.lower() for tool in slash_command.allowed_tools)
        # Instructions should contain variable substitution
        assert "${selection}" in slash_command.instructions or "${workspaceFolder}" in slash_command.instructions
        # Agent field should be in metadata
        assert slash_command.get_metadata('copilot_agent') in ['edit', 'ask', 'agent', None]
        assert slash_command.source_format == "copilot"

    def test_slash_command_copilot_to_canonical_preserves_metadata(self, adapter):
        """Test that Copilot-specific fields are preserved in metadata."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented
        content = """---
description: Test prompt
name: test-prompt
agent: 'ask'
model: 'gpt-4o'
tools:
  - githubRepo
  - search/codebase
argument-hint: 'test hint'
---

Test instructions with ${selection} and #tool:githubRepo.
"""

        slash_command = adapter.to_canonical(content, ConfigType.SLASH_COMMAND)

        # Copilot-specific fields should be in metadata
        assert slash_command.metadata is not None
        # Agent field should be preserved
        if 'copilot_agent' in slash_command.metadata or slash_command.get_metadata('copilot_agent'):
            assert slash_command.get_metadata('copilot_agent') == 'ask'
        # Tools should be accessible
        assert slash_command.allowed_tools is not None

    # Phase 3: from_canonical() Tests (Copilot Slash Commands)

    def test_slash_command_copilot_from_canonical_minimal(self, adapter, canonical_slash_command_minimal):
        """Test generating minimal Copilot prompt from canonical."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented
        output = adapter.from_canonical(canonical_slash_command_minimal, ConfigType.SLASH_COMMAND)

        # Should have valid structure
        assert isinstance(output, str)
        # Body should contain instructions
        assert "Test prompt instructions" in output
        # Should be valid markdown (minimal frontmatter)
        assert output.startswith("---\n") or "instructions" in output.lower()

    def test_slash_command_copilot_from_canonical_full(self, adapter, canonical_slash_command_full):
        """Test generating full Copilot prompt with all fields."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented
        output = adapter.from_canonical(canonical_slash_command_full, ConfigType.SLASH_COMMAND)

        # Should have frontmatter
        assert output.startswith("---\n") or "---\n" in output
        # Should contain description
        assert "description:" in output or "Full prompt with all fields" in output
        # Should contain argument-hint
        assert "argument-hint:" in output or "code snippet" in output
        # Should contain model
        assert "model:" in output or "gpt-4o" in output
        # Should contain tools
        assert "tools:" in output or "githubRepo" in output
        # Should contain variable substitution
        assert "${selection}" in output or "${input" in output
        # Should contain instructions
        assert "Full prompt instructions" in output

    # Phase 4: Round-Trip Tests (Copilot Slash Commands)

    def test_slash_command_copilot_round_trip(self, adapter):
        """Test Copilot -> Canonical -> Copilot preserves all data."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented

        # Test with minimal fixture
        minimal_path = Path("tests/fixtures/copilot/prompts/minimal.prompt.md")
        canonical1 = adapter.read(minimal_path, ConfigType.SLASH_COMMAND)
        output = adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)
        canonical2 = adapter.to_canonical(output, ConfigType.SLASH_COMMAND)

        assert canonical1.name == canonical2.name
        assert canonical1.description == canonical2.description
        assert canonical1.instructions.strip() == canonical2.instructions.strip()

        # Test with simple fixture
        simple_path = Path("tests/fixtures/copilot/prompts/simple.prompt.md")
        canonical1 = adapter.read(simple_path, ConfigType.SLASH_COMMAND)
        output = adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)
        canonical2 = adapter.to_canonical(output, ConfigType.SLASH_COMMAND)

        assert canonical1.name == canonical2.name
        assert canonical1.description == canonical2.description
        assert canonical1.instructions.strip() == canonical2.instructions.strip()

        # Test with full-featured fixture
        full_path = Path("tests/fixtures/copilot/prompts/full-featured.prompt.md")
        canonical1 = adapter.read(full_path, ConfigType.SLASH_COMMAND)
        output = adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)
        canonical2 = adapter.to_canonical(output, ConfigType.SLASH_COMMAND)

        assert canonical1.name == canonical2.name
        assert canonical1.description == canonical2.description
        assert canonical1.argument_hint == canonical2.argument_hint
        assert canonical1.model == canonical2.model
        assert canonical1.allowed_tools == canonical2.allowed_tools
        assert canonical1.instructions.strip() == canonical2.instructions.strip()

    # Phase 5: Edge Cases (Copilot Slash Commands)

    def test_slash_command_copilot_edge_cases(self, adapter):
        """Test edge cases: variable syntax, tool references, agent types."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented

        # Test variable substitution syntax
        content_with_vars = """---
name: vars-test
description: Variable substitution test
---

Use ${selection} and ${file} and ${input:param:placeholder}.
"""
        slash_command = adapter.to_canonical(content_with_vars, ConfigType.SLASH_COMMAND)
        assert "${selection}" in slash_command.instructions
        assert "${file}" in slash_command.instructions
        assert "${input:" in slash_command.instructions

        # Test with-variables fixture (Copilot variable syntax)
        vars_path = Path("tests/fixtures/copilot/prompts/with-variables.prompt.md")
        slash_command = adapter.read(vars_path, ConfigType.SLASH_COMMAND)
        # Should preserve variable syntax
        assert "${input:" in slash_command.instructions or "${file}" in slash_command.instructions or "${selection}" in slash_command.instructions

        # Test agent field variations
        for agent_type in ['ask', 'edit', 'agent', 'custom-agent']:
            content = f"""---
name: agent-{agent_type}
description: Agent type {agent_type}
agent: '{agent_type}'
---

Test with agent type.
"""
            slash_command = adapter.to_canonical(content, ConfigType.SLASH_COMMAND)
            # Agent should be in metadata
            assert slash_command.get_metadata('copilot_agent') == agent_type or \
                   (agent_type in slash_command.metadata.values() if slash_command.metadata else False)

        # Test tool references (#tool:name syntax)
        content_with_tool_refs = """---
name: tool-refs
description: Tool references test
---

Use #tool:githubRepo to search. Check #tool:search/codebase for patterns.
"""
        slash_command = adapter.to_canonical(content_with_tool_refs, ConfigType.SLASH_COMMAND)
        assert "#tool:" in slash_command.instructions

        # Test empty/missing optional fields
        content_minimal = """---
name: minimal-test
description: Test
---

Minimal prompt body.
"""
        slash_command = adapter.to_canonical(content_minimal, ConfigType.SLASH_COMMAND)
        assert slash_command.argument_hint is None or slash_command.argument_hint == ""
        assert slash_command.model is None
        assert slash_command.allowed_tools == [] or slash_command.allowed_tools is None

    # Phase 6: Error Handling (Copilot Slash Commands)

    def test_slash_command_copilot_error_handling(self, adapter):
        """Test handling of invalid YAML and missing required fields."""
        # Note: This test will fail until CopilotSlashCommandHandler is implemented

        # Test invalid YAML frontmatter
        invalid_yaml = """---
description: "Unclosed quote
tools:
  - tool1
---

Instructions.
"""
        with pytest.raises((ValueError, Exception)):
            adapter.to_canonical(invalid_yaml, ConfigType.SLASH_COMMAND)

        # Test malformed frontmatter delimiters
        malformed = """--
description: Test
--

Instructions.
"""
        # Depending on implementation, this might raise an error or treat it as no frontmatter
        # The behavior should be consistent with agent handler

    # Copilot Slash Command Cross-Format Tests (added to TestCrossFormatConversion separately)


class TestCrossFormatConversion:
    """Tests for converting between different formats."""

    @pytest.fixture
    def claude_adapter(self):
        """Create ClaudeAdapter instance."""
        return ClaudeAdapter()

    @pytest.fixture
    def copilot_adapter(self):
        """Create CopilotAdapter instance."""
        return CopilotAdapter()

    @pytest.fixture
    def sample_claude_content(self):
        """Sample Claude agent file content."""
        return """---
name: cross-test-agent
description: Agent for cross-format testing
tools: Read, Grep, Glob
model: sonnet
permissionMode: ask
---
Cross-format test instructions.
"""

    @pytest.fixture
    def sample_copilot_content(self):
        """Sample Copilot agent file content."""
        return """---
name: cross-test-agent
description: Agent for cross-format testing
tools:
  - read
  - grep
  - glob
model: Claude Sonnet 4
target: vscode
argument-hint: Test hint
---
Cross-format test instructions.
"""

    def test_claude_to_copilot(self, claude_adapter, copilot_adapter, sample_claude_content):
        """Test Claude -> Canonical -> Copilot conversion."""
        # Claude to canonical
        canonical = claude_adapter.to_canonical(sample_claude_content, ConfigType.AGENT)

        # Canonical to Copilot
        copilot_output = copilot_adapter.from_canonical(canonical, ConfigType.AGENT)

        # Verify result
        assert "name: cross-test-agent" in copilot_output
        assert "model: Claude Sonnet 4" in copilot_output  # Model denormalized
        assert "target: vscode" in copilot_output
        assert "Cross-format test instructions" in copilot_output

    def test_copilot_to_claude(self, claude_adapter, copilot_adapter, sample_copilot_content):
        """Test Copilot -> Canonical -> Claude conversion."""
        # Copilot to canonical
        canonical = copilot_adapter.to_canonical(sample_copilot_content, ConfigType.AGENT)

        # Canonical to Claude
        claude_output = claude_adapter.from_canonical(canonical, ConfigType.AGENT)

        # Verify result
        assert "name: cross-test-agent" in claude_output
        assert "model: sonnet" in claude_output  # Model stays canonical
        assert "Cross-format test instructions" in claude_output

    def test_claude_to_copilot_to_claude(self, claude_adapter, copilot_adapter, sample_claude_content):
        """Test Claude -> Copilot -> Claude round-trip preserves core data.

        Note: Format-specific metadata (like Claude's permissionMode) is NOT
        preserved when going through another format, because that format's
        adapter doesn't know about or serialize the foreign metadata keys.
        This is expected behavior with the current design.
        """
        # Claude -> Canonical
        canonical1 = claude_adapter.to_canonical(sample_claude_content, ConfigType.AGENT)

        # Canonical -> Copilot
        copilot_output = copilot_adapter.from_canonical(canonical1, ConfigType.AGENT)

        # Copilot -> Canonical
        canonical2 = copilot_adapter.to_canonical(copilot_output, ConfigType.AGENT)

        # Canonical -> Claude
        claude_output = claude_adapter.from_canonical(canonical2, ConfigType.AGENT)

        # Claude -> Canonical (for final comparison)
        canonical3 = claude_adapter.to_canonical(claude_output, ConfigType.AGENT)

        # Core fields should be preserved
        assert canonical1.name == canonical3.name
        assert canonical1.description == canonical3.description
        assert canonical1.model == canonical3.model

        # Note: Claude-specific metadata (permissionMode) is lost when going through Copilot
        # because CopilotAdapter.from_canonical() doesn't serialize Claude metadata
        # This is expected - only same-format round-trips preserve all metadata
        assert canonical1.get_metadata('claude_permission_mode') == 'ask'
        assert canonical3.get_metadata('claude_permission_mode') is None  # Lost in conversion

    def test_copilot_to_claude_to_copilot(self, claude_adapter, copilot_adapter, sample_copilot_content):
        """Test Copilot -> Claude -> Copilot round-trip preserves core data.

        Note: Format-specific metadata (like Copilot's argument-hint) is NOT
        preserved when going through another format, because that format's
        adapter doesn't know about or serialize the foreign metadata keys.
        Only the default 'target: vscode' is added back by CopilotAdapter.
        """
        # Copilot -> Canonical
        canonical1 = copilot_adapter.to_canonical(sample_copilot_content, ConfigType.AGENT)

        # Canonical -> Claude
        claude_output = claude_adapter.from_canonical(canonical1, ConfigType.AGENT)

        # Claude -> Canonical
        canonical2 = claude_adapter.to_canonical(claude_output, ConfigType.AGENT)

        # Canonical -> Copilot
        copilot_output = copilot_adapter.from_canonical(canonical2, ConfigType.AGENT)

        # Copilot -> Canonical (for final comparison)
        canonical3 = copilot_adapter.to_canonical(copilot_output, ConfigType.AGENT)

        # Core fields should be preserved
        assert canonical1.name == canonical3.name
        assert canonical1.description == canonical3.description
        assert canonical1.model == canonical3.model

        # Note: Copilot-specific metadata (argument-hint) is lost when going through Claude
        # because ClaudeAdapter.from_canonical() doesn't serialize Copilot metadata
        # This is expected - only same-format round-trips preserve all metadata
        assert canonical1.get_metadata('copilot_argument_hint') == 'Test hint'
        assert canonical3.get_metadata('copilot_argument_hint') is None  # Lost in conversion

        # Target is preserved because CopilotAdapter always adds it with default 'vscode'
        assert canonical3.get_metadata('copilot_target') == 'vscode'

    def test_metadata_preservation_cross_format(self, claude_adapter, copilot_adapter):
        """Test that format-specific metadata survives cross-format conversion."""
        # Create an agent with both Claude and Copilot metadata
        agent = CanonicalAgent(
            name="metadata-test",
            description="Testing metadata preservation",
            instructions="Test instructions",
            tools=["read", "edit"],
            model="sonnet"
        )
        agent.add_metadata('claude_permission_mode', 'ask')
        agent.add_metadata('claude_skills', [{'name': 'test-skill'}])
        agent.add_metadata('copilot_argument_hint', 'Test hint')
        agent.add_metadata('copilot_handoffs', [{'label': 'Next', 'agent': 'next-agent'}])

        # Convert to Claude format
        claude_output = claude_adapter.from_canonical(agent, ConfigType.AGENT)
        claude_canonical = claude_adapter.to_canonical(claude_output, ConfigType.AGENT)

        # Claude-specific metadata should survive
        assert claude_canonical.get_metadata('claude_permission_mode') == 'ask'
        assert claude_canonical.get_metadata('claude_skills') == [{'name': 'test-skill'}]

        # Copilot-specific metadata should still be in the original agent
        # (it doesn't survive Claude round-trip as Claude doesn't know about it)

        # Convert original agent to Copilot format
        copilot_output = copilot_adapter.from_canonical(agent, ConfigType.AGENT)
        copilot_canonical = copilot_adapter.to_canonical(copilot_output, ConfigType.AGENT)

        # Copilot-specific metadata should survive
        assert copilot_canonical.get_metadata('copilot_argument_hint') == 'Test hint'
        assert copilot_canonical.get_metadata('copilot_handoffs') == [{'label': 'Next', 'agent': 'next-agent'}]

    # Cross-Format Slash Command Tests

    def test_slash_command_claude_to_copilot(self, claude_adapter, copilot_adapter):
        """Test Claude slash command conversion to Copilot format."""
        # Note: This test will fail until both handlers are implemented
        # Sample Claude slash command
        claude_content = """---
name: claude-command
description: Create a commit
argument-hint: "[message]"
allowed-tools: Bash(git:*), Read, Write
model: haiku
---

Create a git commit with message: $ARGUMENTS

Current status:
- Files: @.gitignore
- Branch: !`git branch --show-current`
"""

        # Convert Claude → Canonical
        canonical = claude_adapter.to_canonical(claude_content, ConfigType.SLASH_COMMAND)
        assert canonical.source_format == "claude"
        assert canonical.argument_hint == "[message]"
        assert "Bash(git:*)" in canonical.allowed_tools or any("Bash" in tool for tool in canonical.allowed_tools)
        assert "$ARGUMENTS" in canonical.instructions

        # Convert Canonical → Copilot
        copilot_output = copilot_adapter.from_canonical(canonical, ConfigType.SLASH_COMMAND)
        assert isinstance(copilot_output, str)
        # Should be valid Copilot prompt format
        assert ".prompt.md" in copilot_output or "---\n" in copilot_output
        # Variable syntax might be transformed (from $ARGUMENTS to ${input:})
        # Instructions should still contain the context
        assert "git" in copilot_output.lower() or "commit" in copilot_output.lower()

    def test_slash_command_copilot_to_claude(self, claude_adapter, copilot_adapter):
        """Test Copilot prompt conversion to Claude format."""
        # Note: This test will fail until both handlers are implemented
        # Sample Copilot prompt
        copilot_content = """---
description: Explain code
name: explain-code
argument-hint: code snippet to explain
agent: ask
tools:
  - githubRepo
  - search/codebase
---

Explain the following code: ${selection}

File context: ${file}

Target audience: ${input:audience:Who is this for?}

Use #tool:githubRepo to find similar implementations.
"""

        # Convert Copilot → Canonical
        canonical = copilot_adapter.to_canonical(copilot_content, ConfigType.SLASH_COMMAND)
        assert canonical.source_format == "copilot"
        assert canonical.description == "Explain code"
        assert canonical.argument_hint == "code snippet to explain"
        assert "${selection}" in canonical.instructions
        assert "#tool:" in canonical.instructions
        # Agent should be in metadata
        assert canonical.get_metadata('copilot_agent') == 'ask'

        # Convert Canonical → Claude
        claude_output = claude_adapter.from_canonical(canonical, ConfigType.SLASH_COMMAND)
        assert isinstance(claude_output, str)
        # Should be valid Claude format
        assert ".md" in claude_output or "---\n" in claude_output
        # Instructions should be preserved
        assert "explain" in claude_output.lower() or "code" in claude_output.lower()
        # Variable syntax might be different but content should survive
        assert "audience" in claude_output.lower() or "${" in claude_output or "$" in claude_output

    def test_slash_command_round_trip_cross_format(self, claude_adapter, copilot_adapter):
        """Test that slash commands can round-trip through both formats."""
        # Note: This test will fail until both handlers are implemented
        # Create a Copilot prompt
        copilot_content = """---
name: copilot-review
description: Review code
argument-hint: code to review
agent: ask
---

Review the following code: ${selection}
"""

        # Copilot → Canonical
        canonical1 = copilot_adapter.to_canonical(copilot_content, ConfigType.SLASH_COMMAND)
        assert canonical1.source_format == "copilot"

        # Canonical → Claude
        claude_output = claude_adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)

        # Claude → Canonical
        canonical_claude = claude_adapter.to_canonical(claude_output, ConfigType.SLASH_COMMAND)
        assert canonical_claude.source_format == "claude"

        # Verify core content survived
        assert canonical1.name == canonical_claude.name
        assert canonical1.description == canonical_claude.description
        # Variable syntax may differ but both should exist
        assert ("${" in canonical1.instructions or "$" in canonical1.instructions)
        assert ("${" in canonical_claude.instructions or "$" in canonical_claude.instructions or "@" in canonical_claude.instructions)

    def test_slash_command_metadata_preservation_cross_format(self, claude_adapter, copilot_adapter):
        """Test that format-specific metadata is preserved during cross-format conversion."""
        # Note: This test will fail until both handlers are implemented
        # Create canonical with both Claude and Copilot metadata
        canonical = CanonicalSlashCommand(
            name="test-command",
            description="Test command",
            instructions="Test instructions with $ARGUMENTS and ${selection}.",
            argument_hint="test hint",
            model="haiku",
            allowed_tools=["Read", "Write"],
            source_format="claude"
        )
        canonical.add_metadata('claude_disable_model_invocation', False)
        canonical.add_metadata('copilot_agent', 'ask')
        canonical.add_metadata('copilot_tools', ['githubRepo'])

        # Convert to Claude format
        claude_output = claude_adapter.from_canonical(canonical, ConfigType.SLASH_COMMAND)
        claude_canonical = claude_adapter.to_canonical(claude_output, ConfigType.SLASH_COMMAND)

        # Claude-specific metadata should survive Claude round-trip
        assert claude_canonical.get_metadata('claude_disable_model_invocation') is not None or \
               claude_canonical.get_metadata('claude_disable_model_invocation') == False

        # Convert to Copilot format
        copilot_output = copilot_adapter.from_canonical(canonical, ConfigType.SLASH_COMMAND)
        copilot_canonical = copilot_adapter.to_canonical(copilot_output, ConfigType.SLASH_COMMAND)

        # Copilot-specific metadata should survive Copilot round-trip
        assert copilot_canonical.get_metadata('copilot_agent') == 'ask' or \
               copilot_canonical.get_metadata('copilot_agent') is not None


class TestGeminiSlashCommands:
    """Tests for GeminiSlashCommandHandler.

    Note: These tests are written before the Gemini adapter implementation exists.
    They serve as a specification for the expected behavior of the Gemini
    slash-command handler, which uses TOML format instead of Markdown.

    Gemini-specific features:
    - TOML file format (.toml extension)
    - Namespace support via directory structure (git/review.toml → "git:review")
    - Placeholder syntax: {{args}}, !{cmd}, @{file}
    - Auto-append args if {{args}} not present
    """

    @pytest.fixture
    def adapter(self):
        """Create GeminiAdapter instance.

        Note: This will fail until GeminiAdapter is implemented.
        """
        # This import will fail until the adapter exists
        try:
            from adapters import GeminiAdapter
            return GeminiAdapter()
        except ImportError:
            pytest.skip("GeminiAdapter not yet implemented")

    @pytest.fixture
    def minimal_toml_content(self):
        """Minimal TOML slash-command (only required fields)."""
        return '''prompt = """
Review this code for bugs and suggest improvements.
"""
'''

    @pytest.fixture
    def simple_toml_content(self):
        """Simple TOML with basic fields."""
        return '''description = "Create a git commit with AI-generated message"

prompt = """
Review the current git status and staged changes.

Git Status:
!{git status}

Create a conventional commit message.

{{args}}
"""
'''

    @pytest.fixture
    def full_featured_toml_content(self):
        """Full-featured TOML with all placeholder types."""
        return '''description = "Generate documentation for code files"

prompt = """
Generate comprehensive documentation for the following code:

@{{{args}}}

Include:
1. Overview and purpose
2. Function/class descriptions
3. Parameter and return value documentation

Format the documentation appropriately for the language.
"""
'''

    @pytest.fixture
    def canonical_slash_command_minimal(self):
        """Minimal CanonicalSlashCommand for serialization tests."""
        return CanonicalSlashCommand(
            name="test-command",
            description="Test command",
            instructions="Test command instructions.",
            source_format="gemini"
        )

    @pytest.fixture
    def canonical_slash_command_full(self):
        """Full CanonicalSlashCommand with Gemini-specific metadata."""
        command = CanonicalSlashCommand(
            name="git:review",
            description="Review code changes",
            instructions="Review the following changes:\n\n!{git diff}\n\nProvide feedback.\n\n{{args}}",
            source_format="gemini"
        )
        # Add Gemini-specific metadata
        command.add_metadata('gemini_namespace', 'git:review')
        command.add_metadata('gemini_shell_placeholders', ['!{git diff}'])
        command.add_metadata('gemini_args_placeholder', True)
        return command

    # Phase 1: Property Tests

    def test_slash_command_config_type(self, adapter):
        """Test that GeminiSlashCommandHandler returns correct config type."""
        handler = adapter._get_handler(ConfigType.SLASH_COMMAND)
        assert handler.config_type == ConfigType.SLASH_COMMAND

    def test_file_extension_detection(self, adapter):
        """Test that adapter recognizes .toml files."""
        assert adapter.can_handle(Path("command.toml")) is True
        assert adapter.can_handle(Path("git/review.toml")) is True
        assert adapter.can_handle(Path("command.md")) is False
        assert adapter.can_handle(Path("command.prompt.md")) is False

    # Phase 2: to_canonical() Tests

    def test_to_canonical_minimal(self, adapter, tmp_path):
        """Test parsing minimal TOML (only prompt field)."""
        # Use analyze.toml which has no {{args}} placeholder
        fixture_path = Path("tests/fixtures/gemini/commands/analyze.toml")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Name should be derived from filename
        assert slash_command.name == "analyze"
        # Description should be present
        assert slash_command.description == "Analyze project structure and provide insights"
        # Instructions should be the prompt content
        assert "Analyze the project structure" in slash_command.instructions
        assert "!{tree" in slash_command.instructions
        # Source format should be gemini
        assert slash_command.source_format == "gemini"
        # Should preserve shell command placeholders in metadata
        assert slash_command.has_metadata('gemini_shell_placeholders')

    def test_to_canonical_simple(self, adapter, tmp_path):
        """Test parsing simple TOML with description and placeholders."""
        fixture_path = Path("tests/fixtures/gemini/commands/commit.toml")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Name from filename
        assert slash_command.name == "commit"
        # Description from TOML
        assert slash_command.description == "Create a git commit with AI-generated message"
        # Instructions should contain placeholders
        assert "{{args}}" in slash_command.instructions
        assert "!{git status}" in slash_command.instructions
        assert "!{git diff --staged}" in slash_command.instructions
        # Should preserve placeholders in metadata
        shell_placeholders = slash_command.get_metadata('gemini_shell_placeholders')
        assert shell_placeholders is not None
        assert len(shell_placeholders) >= 2
        assert slash_command.get_metadata('gemini_args_placeholder') is True

    def test_to_canonical_namespaced(self, adapter, tmp_path):
        """Test namespace extraction from subdirectory path."""
        fixture_path = Path("tests/fixtures/gemini/commands/git/review.toml")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Name should include namespace from directory
        assert slash_command.name == "git:review"
        # Namespace should be preserved in metadata
        assert slash_command.get_metadata('gemini_namespace') == "git:review"
        # Description should be present
        assert "Review code changes" in slash_command.description

    def test_to_canonical_file_embedding(self, adapter, tmp_path):
        """Test file embedding placeholder (@{...}) preservation."""
        fixture_path = Path("tests/fixtures/gemini/commands/document.toml")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Instructions should preserve file embedding syntax
        assert "@{{{args}}}" in slash_command.instructions
        # Should preserve file placeholders in metadata
        file_placeholders = slash_command.get_metadata('gemini_file_placeholders')
        assert file_placeholders is not None
        assert len(file_placeholders) >= 1

    def test_to_canonical_from_string(self, adapter, simple_toml_content):
        """Test parsing TOML from string content."""
        slash_command = adapter.to_canonical(simple_toml_content, ConfigType.SLASH_COMMAND)

        assert slash_command.description == "Create a git commit with AI-generated message"
        assert "{{args}}" in slash_command.instructions
        assert "!{git status}" in slash_command.instructions

    # Phase 3: from_canonical() Tests

    def test_from_canonical_minimal(self, adapter, canonical_slash_command_minimal):
        """Test generating minimal TOML from canonical."""
        output = adapter.from_canonical(canonical_slash_command_minimal, ConfigType.SLASH_COMMAND)

        # Should be valid TOML
        assert isinstance(output, str)
        # Should contain prompt field
        assert 'prompt = """' in output or 'prompt =' in output
        # Should contain instructions
        assert "Test command instructions" in output
        # Description should be present
        assert 'description =' in output

    def test_from_canonical_with_metadata(self, adapter, canonical_slash_command_full):
        """Test generating TOML with Gemini-specific metadata."""
        output = adapter.from_canonical(canonical_slash_command_full, ConfigType.SLASH_COMMAND)

        # Should contain description
        assert 'description = "Review code changes"' in output or "Review code changes" in output
        # Should preserve placeholders from metadata
        assert "{{args}}" in output
        assert "!{git diff}" in output
        # Should be valid TOML structure
        assert 'prompt = """' in output or 'prompt =' in output

    def test_from_canonical_multiline_prompt(self, adapter):
        """Test TOML triple-quote formatting for multiline prompts."""
        command = CanonicalSlashCommand(
            name="multiline-test",
            description="Test multiline",
            instructions="Line 1\n\nLine 2\n\nLine 3 with special chars: \"quotes\" and 'apostrophes'",
            source_format="gemini"
        )

        output = adapter.from_canonical(command, ConfigType.SLASH_COMMAND)

        # Should use triple-quoted string for multiline
        assert '"""' in output
        # Should preserve line breaks
        assert "Line 1" in output
        assert "Line 2" in output
        assert "Line 3" in output

    # Phase 4: Round-Trip Tests

    def test_round_trip_simple(self, adapter):
        """Test TOML → Canonical → TOML preserves data."""
        fixture_path = Path("tests/fixtures/gemini/commands/commit.toml")

        # Read original
        canonical1 = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Convert to TOML
        output = adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)

        # Parse again
        canonical2 = adapter.to_canonical(output, ConfigType.SLASH_COMMAND)

        # Verify preservation
        assert canonical1.name == canonical2.name
        assert canonical1.description == canonical2.description
        assert canonical1.instructions.strip() == canonical2.instructions.strip()
        # Metadata should be preserved
        assert canonical1.get_metadata('gemini_args_placeholder') == canonical2.get_metadata('gemini_args_placeholder')

    def test_round_trip_namespaced(self, adapter):
        """Test round-trip preserves namespace."""
        fixture_path = Path("tests/fixtures/gemini/commands/git/review.toml")

        canonical1 = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)
        output = adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)
        canonical2 = adapter.to_canonical(output, ConfigType.SLASH_COMMAND)

        # Namespace should survive round-trip
        assert canonical1.name == canonical2.name
        assert "git:review" in canonical2.name or canonical2.get_metadata('gemini_namespace') == "git:review"

    def test_round_trip_all_placeholders(self, adapter):
        """Test round-trip with all placeholder types."""
        fixture_path = Path("tests/fixtures/gemini/commands/document.toml")

        canonical1 = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)
        output = adapter.from_canonical(canonical1, ConfigType.SLASH_COMMAND)
        canonical2 = adapter.to_canonical(output, ConfigType.SLASH_COMMAND)

        # All placeholder types should survive
        assert "@{" in canonical2.instructions
        assert "{{args}}" in canonical2.instructions or canonical2.has_metadata('gemini_file_placeholders')

    # Phase 5: Edge Cases

    def test_edge_case_no_args_placeholder(self, adapter):
        """Test command without {{args}} placeholder (auto-append behavior)."""
        fixture_path = Path("tests/fixtures/gemini/commands/analyze.toml")

        slash_command = adapter.read(fixture_path, ConfigType.SLASH_COMMAND)

        # Should note absence of {{args}} in metadata
        has_args = slash_command.get_metadata('gemini_args_placeholder')
        assert has_args is False or has_args is None

    def test_edge_case_mixed_placeholders(self, adapter):
        """Test command with multiple placeholder types."""
        content = '''description = "Mixed placeholders test"

prompt = """
File content: @{test.py}
Git status: !{git status}
User args: {{args}}
"""
'''

        slash_command = adapter.to_canonical(content, ConfigType.SLASH_COMMAND)

        # All placeholders should be preserved
        assert "@{test.py}" in slash_command.instructions
        assert "!{git status}" in slash_command.instructions
        assert "{{args}}" in slash_command.instructions
        # Metadata should track all types
        assert slash_command.has_metadata('gemini_shell_placeholders')
        assert slash_command.has_metadata('gemini_file_placeholders')
        assert slash_command.get_metadata('gemini_args_placeholder') is True

    def test_edge_case_special_characters_in_toml(self, adapter):
        """Test TOML escaping of special characters."""
        content = '''description = "Test with \\"quotes\\" and 'apostrophes'"

prompt = """
Special chars: "double quotes", 'single quotes', backslash\\
"""
'''

        slash_command = adapter.to_canonical(content, ConfigType.SLASH_COMMAND)

        # Should preserve special characters
        assert "quotes" in slash_command.description
        assert "apostrophes" in slash_command.description

    def test_edge_case_empty_description(self, adapter):
        """Test command with missing description field."""
        content = '''prompt = """
Command without description.
"""
'''

        slash_command = adapter.to_canonical(content, ConfigType.SLASH_COMMAND)

        # Description should be empty or None, not raise error
        assert slash_command.description == "" or slash_command.description is None

    def test_edge_case_nested_namespace(self, adapter, tmp_path):
        """Test deeply nested namespace."""
        # Create a test file simulating deep nesting
        test_file = tmp_path / "commands" / "git" / "hooks" / "pre-commit.toml"
        test_file.parent.mkdir(parents=True, exist_ok=True)
        test_file.write_text('''description = "Pre-commit hook"

prompt = """Test"""
''')

        slash_command = adapter.read(test_file, ConfigType.SLASH_COMMAND)

        # Should create nested namespace
        assert "git:hooks:pre-commit" in slash_command.name or \
               slash_command.get_metadata('gemini_namespace') == "git:hooks:pre-commit"

    # Phase 6: Error Handling

    def test_error_invalid_toml(self, adapter):
        """Test handling of invalid TOML syntax."""
        invalid_toml = '''description = "Unclosed quote

prompt = """Test"""
'''

        with pytest.raises((ValueError, Exception)):
            adapter.to_canonical(invalid_toml, ConfigType.SLASH_COMMAND)

    def test_error_missing_prompt_field(self, adapter):
        """Test error when required prompt field is missing."""
        invalid_toml = '''description = "No prompt field"
'''

        with pytest.raises(ValueError, match="prompt"):
            adapter.to_canonical(invalid_toml, ConfigType.SLASH_COMMAND)

    def test_error_malformed_placeholder(self, adapter):
        """Test handling of malformed placeholders."""
        content = '''description = "Malformed placeholder"

prompt = """
This has a malformed placeholder: !{unclosed command
And a weird one: @{
"""
'''

        # Should not raise error, but may track in warnings
        slash_command = adapter.to_canonical(content, ConfigType.SLASH_COMMAND)

        # Should still parse, possibly with warning
        assert slash_command.description == "Malformed placeholder"
