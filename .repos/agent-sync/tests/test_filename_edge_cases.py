"""
Tests for filename edge cases, case sensitivity, and special characters.
"""

import pytest
from pathlib import Path
from unittest.mock import patch
from core.orchestrator import UniversalSyncOrchestrator
from core.registry import FormatRegistry
from core.state_manager import SyncStateManager
from adapters import ClaudeAdapter, CopilotAdapter
from core.canonical_models import ConfigType

class TestFilenameEdgeCases:
    @pytest.fixture
    def setup_orchestrator(self, tmp_path):
        """Setup orchestrator with temp directories."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()
        
        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())
        
        state_file = tmp_path / "state.json"
        state_manager = SyncStateManager(state_file)
        
        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager
        )
        
        return orchestrator, source_dir, target_dir

    def test_case_insensitive_matching(self, setup_orchestrator):
        """Test that files with different casing are matched correctly (Finding 4)."""
        orchestrator, source_dir, target_dir = setup_orchestrator
        
        # Create Agent.md in source and agent.agent.md in target
        (source_dir / "Agent.md").write_text("source content")
        (target_dir / "agent.agent.md").write_text("target content")
        
        pairs = orchestrator._discover_file_pairs()
        
        # Should be matched if we implement case-insensitive matching
        assert len(pairs) == 1
        assert pairs[0].base_name.lower() == "agent"
        assert pairs[0].source_path is not None
        assert pairs[0].target_path is not None

    def test_special_characters_in_filenames(self, setup_orchestrator):
        """Test that special characters in filenames are handled correctly (Finding 5)."""
        orchestrator, source_dir, target_dir = setup_orchestrator
        
        filenames = [
            "my agent.md",
            "agent-ñoño.md",
            "agent@v2.md",
            "agent(1).md",
            "very.many.dots.md"
        ]
        
        for name in filenames:
            (source_dir / name).write_text("content")
            
        pairs = orchestrator._discover_file_pairs()
        assert len(pairs) == len(filenames)
        
        discovered_names = [p.source_path.name for p in pairs]
        for name in filenames:
            assert name in discovered_names

    def test_base_name_collision_detection(self, setup_orchestrator, capsys):
        """Test that base name collisions are detected and warned (Finding 6)."""
        orchestrator, source_dir, target_dir = setup_orchestrator
        orchestrator.verbose = True
        
        # Mock glob to return colliding filenames, as we can't create them on Windows
        with patch.object(Path, "glob") as mock_glob:
            mock_glob.return_value = [
                source_dir / "agent.md",
                source_dir / "Agent.md"
            ]
            
            # We also need to mock stat() for these paths
            with patch.object(Path, "stat") as mock_stat:
                from unittest.mock import MagicMock
                mock_stat.return_value = MagicMock(st_mtime=1000.0)
                
                pairs = orchestrator._discover_file_pairs()
        
        # Only one should be picked
        assert len(pairs) == 1
        
        captured = capsys.readouterr()
        assert "Warning: Base name collision" in captured.out

    def test_no_extension_files(self, setup_orchestrator):
        """Test handling of files without extensions (Finding 3)."""
        orchestrator, source_dir, target_dir = setup_orchestrator
        
        # 'agent' file should still be processed if orchestrator is told to look for it
        # However, glob currently uses *.md or *.agent.md
        # So it won't find it unless we change how we discover files.
        # But _extract_base_name should still handle it if passed.
        
        path = Path("agent")
        assert orchestrator._extract_base_name(path, ".md") == "agent"
        
        path_hidden = Path(".hidden")
        assert orchestrator._extract_base_name(path_hidden, ".md") == ".hidden"
