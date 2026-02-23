"""
Unit tests for canonical data models.

Tests cover:
- CanonicalAgent creation and manipulation
- CanonicalPermission creation
- CanonicalSlashCommand creation
- Metadata handling
- ConfigType enum
- Validation logic
"""

import pytest
from core.canonical_models import CanonicalAgent, CanonicalPermission, CanonicalSlashCommand, ConfigType


class TestCanonicalAgent:
    """Tests for CanonicalAgent model."""

    def test_create_minimal_agent(self):
        """Test creating agent with minimal required fields."""
        agent = CanonicalAgent(
            name="test-agent",
            description="Test Description",
            instructions="Test Instructions"
        )
        assert agent.name == "test-agent"
        assert agent.description == "Test Description"
        assert agent.instructions == "Test Instructions"
        assert agent.tools == []
        assert agent.model is None
        assert agent.metadata == {}

    def test_create_full_agent(self):
        """Test creating agent with all fields."""
        agent = CanonicalAgent(
            name="full-agent",
            description="Full Description",
            instructions="Full Instructions",
            tools=["tool1", "tool2"],
            model="gpt-4",
            metadata={"key": "value"},
            source_format="test",
            version="2.0"
        )
        assert agent.name == "full-agent"
        assert agent.tools == ["tool1", "tool2"]
        assert agent.model == "gpt-4"
        assert agent.metadata == {"key": "value"}
        assert agent.source_format == "test"
        assert agent.version == "2.0"

    def test_metadata_operations(self):
        """Test adding, getting, and checking metadata."""
        agent = CanonicalAgent(
            name="meta-agent",
            description="Desc",
            instructions="Inst"
        )
        
        # Test add
        agent.add_metadata('custom_field', 123)
        assert agent.metadata['custom_field'] == 123
        
        # Test get
        assert agent.get_metadata('custom_field') == 123
        assert agent.get_metadata('missing', 'default') == 'default'
        
        # Test has
        assert agent.has_metadata('custom_field')
        assert not agent.has_metadata('missing')

    def test_tools_list(self):
        """Test tools list handling."""
        agent = CanonicalAgent(
            name="tools-agent",
            description="Desc",
            instructions="Inst",
            tools=["read", "write"]
        )
        assert "read" in agent.tools
        agent.tools.append("execute")
        assert "execute" in agent.tools

    def test_validation_empty_fields(self):
        """Test that validation fails for empty required fields."""
        # Empty name
        with pytest.raises(ValueError, match="name"):
            CanonicalAgent(name="", description="desc", instructions="inst")
        
        # Empty description
        with pytest.raises(ValueError, match="description"):
            CanonicalAgent(name="name", description="", instructions="inst")
            
        # Empty instructions
        with pytest.raises(ValueError, match="instructions"):
            CanonicalAgent(name="name", description="desc", instructions="")


class TestCanonicalPermission:
    """Tests for CanonicalPermission model."""

    def test_create_permission(self):
        """Test creating permission configuration."""
        perm = CanonicalPermission(
            allow=["read"],
            deny=["write"],
            ask=["execute"],
            default_mode="ask"
        )
        assert perm.allow == ["read"]
        assert perm.deny == ["write"]
        assert perm.ask == ["execute"]
        assert perm.default_mode == "ask"

    def test_permission_metadata(self):
        """Test metadata operations on permissions."""
        perm = CanonicalPermission()
        perm.add_metadata('special_perm', True)
        assert perm.get_metadata('special_perm') is True


class TestCanonicalSlashCommand:
    """Tests for CanonicalSlashCommand model."""

    def test_create_slash_command(self):
        """Test creating slash command."""
        cmd = CanonicalSlashCommand(
            name="test-cmd",
            description="Test Command",
            instructions="Do this",
            allowed_tools=["tool1"]
        )
        assert cmd.name == "test-cmd"
        assert cmd.description == "Test Command"
        assert cmd.allowed_tools == ["tool1"]

    def test_allowed_tools_defaults(self):
        """Test allowed_tools handling."""
        # Test default is list
        cmd = CanonicalSlashCommand(
            name="cmd",
            description="desc",
            instructions="inst"
        )
        assert cmd.allowed_tools == []
        
        # Test None conversion (handled in __post_init__)
        cmd2 = CanonicalSlashCommand(
            name="cmd",
            description="desc",
            instructions="inst",
            allowed_tools=None
        )
        assert cmd2.allowed_tools == []

    def test_validation_empty_fields(self):
        """Test that validation fails for empty required fields."""
        with pytest.raises(ValueError, match="name"):
            CanonicalSlashCommand(name="", description="desc", instructions="inst")

        # Note: description is optional in some formats (e.g., Gemini)
        # Format-specific adapters can validate it if needed

        with pytest.raises(ValueError, match="instructions"):
            CanonicalSlashCommand(name="name", description="", instructions="")


class TestConfigType:
    """Tests for ConfigType enum."""

    def test_enum_values(self):
        """Test ConfigType enum has expected values."""
        assert ConfigType.AGENT.value == "agent"
        assert ConfigType.PERMISSION.value == "permission"
        assert ConfigType.SLASH_COMMAND.value == "slash_command"