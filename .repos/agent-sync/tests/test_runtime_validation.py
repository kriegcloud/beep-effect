"""
Runtime validation tests for generated agents.
Ensures that agents converted by the orchestrator can be successfully loaded by the real Claude CLI.
"""

import pytest
import shutil
import subprocess
from pathlib import Path
from core.registry import FormatRegistry
from core.orchestrator import UniversalSyncOrchestrator
from core.state_manager import SyncStateManager
from core.canonical_models import ConfigType
from adapters import ClaudeAdapter, CopilotAdapter

# Define the local .claude/agents directory
LOCAL_CLAUDE_AGENTS_DIR = Path(".claude/agents")

@pytest.fixture
def setup_claude_env():
    """Ensure .claude/agents exists and clean up after test."""
    LOCAL_CLAUDE_AGENTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Store list of existing files to avoid deleting pre-existing agents
    existing_files = set(LOCAL_CLAUDE_AGENTS_DIR.glob("*" ))
    
    yield
    
    # Cleanup: remove any new files created during test
    for file in LOCAL_CLAUDE_AGENTS_DIR.glob("*" ):
        if file not in existing_files:
            file.unlink()

def test_claude_cli_loads_converted_agent(setup_claude_env, tmp_path):
    """
    End-to-end validation:
    1. Convert Copilot agent -> Claude agent
    2. Place in .claude/agents/
    3. Run 'claude -p' to verify it loads
    """
    
    # 1. Prepare conversion
    registry = FormatRegistry()
    registry.register(ClaudeAdapter())
    registry.register(CopilotAdapter())
    
    state_manager = SyncStateManager(tmp_path / "state.json")
    
    # Source: The official Copilot fixture
    source_file = Path("tests/fixtures/copilot/agents/official-pr-reviewer.agent.md")
    if not source_file.exists():
        pytest.skip("Source fixture not found")
        
    source_dir = tmp_path / "source"
    source_dir.mkdir()
    shutil.copy(source_file, source_dir / "official-pr-reviewer.agent.md")
    
    # Target: The real .claude/agents directory
    # Note: We use the orchestrator to sync directly to the real folder
    orchestrator = UniversalSyncOrchestrator(
        source_dir=source_dir,
        target_dir=LOCAL_CLAUDE_AGENTS_DIR,
        source_format='copilot',
        target_format='claude',
        config_type=ConfigType.AGENT,
        format_registry=registry,
        state_manager=state_manager,
        dry_run=False
    )
    
    orchestrator.sync()
    
    # Verify file exists
    expected_file = LOCAL_CLAUDE_AGENTS_DIR / "official-pr-reviewer.md"
    assert expected_file.exists(), "Converted agent file should exist in .claude/agents"
    
    # 2. Validation with Claude CLI
    # We ask Claude to list agents. It should include 'pr-reviewer' (the name in the yaml)
    try:
        result = subprocess.run(
            ["claude", "-p", "List all available agents. Check if 'pr-reviewer' is available."],
            capture_output=True,
            text=True,
            check=True
        )
        output = result.stdout
        
        # 3. Assertions
        assert "pr-reviewer" in output, \
            f"The converted agent 'pr-reviewer' was not found in Claude's agent list.\nOutput:\n{output}"
            
    except subprocess.CalledProcessError as e:
        pytest.fail(f"Claude CLI command failed: {e.stderr}")
    except FileNotFoundError:
        pytest.skip("Claude CLI not installed or not in PATH")
