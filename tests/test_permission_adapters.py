import pytest
import json
from pathlib import Path
from core.canonical_models import CanonicalPermission, ConfigType
from adapters.claude import ClaudeAdapter
from adapters.copilot import CopilotAdapter
from core.registry import FormatRegistry

class TestClaudePermissionAdapter:
    @pytest.fixture
    def adapter(self):
        return ClaudeAdapter()

    def test_supported_config_types(self, adapter):
        assert ConfigType.PERMISSION in adapter.supported_config_types

    def test_can_handle_settings_json(self, adapter):
        assert adapter.can_handle(Path(".claude/settings.json"))
        assert adapter.can_handle(Path("settings.json"))
        # Should still handle agents
        assert adapter.can_handle(Path("my-agent.md"))

    def test_to_canonical_permissions(self, adapter):
        fixture_path = Path("tests/fixtures/claude/permissions/full-settings.json")
        content = fixture_path.read_text()

        perm = adapter.to_canonical(content, ConfigType.PERMISSION)
        
        assert isinstance(perm, CanonicalPermission)
        assert "Bash(ls)" in perm.allow
        assert "Read(.env)" in perm.deny
        assert "Bash(git push)" in perm.ask
        # Verify source format
        assert perm.source_format == "claude"

    def test_from_canonical_permissions(self, adapter):
        perm = CanonicalPermission(
            allow=["Bash(npm test)"],
            deny=["Read(secrets.txt)"],
            ask=[],
            source_format="claude"
        )
        
        content = adapter.from_canonical(perm, ConfigType.PERMISSION)
        data = json.loads(content)
        
        assert "permissions" in data
        assert "allow" in data["permissions"]
        assert "Bash(npm test)" in data["permissions"]["allow"]
        assert "Read(secrets.txt)" in data["permissions"]["deny"]
        # Should not have 'ask' if it's empty, or it can be empty list. 
        # Let's assume we want clean output so maybe omit empty? 
        # But for now, let's just check the present values.

    def test_read_invalid_json(self, adapter):
        fixture_path = Path("tests/fixtures/claude/permissions/invalid.json")
        content = fixture_path.read_text()
        with pytest.raises(ValueError):
            adapter.to_canonical(content, ConfigType.PERMISSION)

    def test_read_missing_permissions_key(self, adapter):
        # Should handle files that are valid JSON but missing permissions key gracefully?
        # Or return empty permissions?
        fixture_path = Path("tests/fixtures/claude/permissions/no-permissions-key.json")
        content = fixture_path.read_text()
        perm = adapter.to_canonical(content, ConfigType.PERMISSION)
        assert isinstance(perm, CanonicalPermission)
        assert perm.allow == []

    def test_null_permission_values(self, adapter):
        """Test that null permission values are converted to empty lists."""
        content = '{"permissions": {"allow": null, "deny": null, "ask": null}}'
        perm = adapter.to_canonical(content, ConfigType.PERMISSION)
        
        assert isinstance(perm, CanonicalPermission)
        assert perm.allow == []
        assert perm.deny == []
        assert perm.ask == []

        # Round-trip should produce empty lists in JSON, not null
        output = adapter.from_canonical(perm, ConfigType.PERMISSION)
        data = json.loads(output)
        assert data["permissions"]["allow"] == []
        assert data["permissions"]["deny"] == []
        assert data["permissions"]["ask"] == []

class TestCopilotPermissionAdapter:
    @pytest.fixture
    def adapter(self):
        return CopilotAdapter()

    def test_supported_config_types(self, adapter):
        assert ConfigType.PERMISSION in adapter.supported_config_types

    def test_can_handle_perm_json(self, adapter):
        assert adapter.can_handle(Path(".github/copilot.perm.json"))
        assert adapter.can_handle(Path("settings.perm.json"))
        # Should still handle agents
        assert adapter.can_handle(Path("my-agent.agent.md"))

    def test_to_canonical_terminal_simple(self, adapter):
        """Test simple terminal permissions (true/false)."""
        fixture_path = Path("tests/fixtures/copilot/permissions/terminal-simple.json")
        content = fixture_path.read_text()

        perm = adapter.to_canonical(content, ConfigType.PERMISSION)

        assert isinstance(perm, CanonicalPermission)
        # true -> allow
        assert "Bash(mkdir:*)" in perm.allow
        assert "Bash(git status:*)" in perm.allow
        # false -> ask
        assert "Bash(rm:*)" in perm.ask
        assert "Bash(git push:*)" in perm.ask
        # No deny (VS Code doesn't have deny concept)
        assert perm.deny == []
        assert perm.source_format == "copilot"

    def test_to_canonical_terminal_regex(self, adapter):
        """Test regex terminal patterns."""
        fixture_path = Path("tests/fixtures/copilot/permissions/terminal-regex.json")
        content = fixture_path.read_text()

        perm = adapter.to_canonical(content, ConfigType.PERMISSION)

        assert isinstance(perm, CanonicalPermission)
        # Regex patterns should be preserved
        assert "Bash(/^git (status|show\\b.*)$/)" in perm.allow
        assert "Bash(/^npm run (test|lint)$/)" in perm.allow
        assert "Bash(/dangerous/)" in perm.ask
        assert "Bash(/^rm -rf/)" in perm.ask

    def test_to_canonical_terminal_mixed(self, adapter):
        """Test mix of simple and regex patterns."""
        fixture_path = Path("tests/fixtures/copilot/permissions/terminal-mixed.json")
        content = fixture_path.read_text()

        perm = adapter.to_canonical(content, ConfigType.PERMISSION)

        assert isinstance(perm, CanonicalPermission)
        # Simple patterns
        assert "Bash(mkdir:*)" in perm.allow
        assert "Bash(ls:*)" in perm.allow
        # Regex patterns
        assert "Bash(/^git (status|diff)$/)" in perm.allow
        # Ask category
        assert "Bash(npm install:*)" in perm.ask
        assert "Bash(/^docker/)" in perm.ask

    def test_to_canonical_urls_simple(self, adapter):
        """Test simple URL permissions."""
        fixture_path = Path("tests/fixtures/copilot/permissions/urls-simple.json")
        content = fixture_path.read_text()

        perm = adapter.to_canonical(content, ConfigType.PERMISSION)

        assert isinstance(perm, CanonicalPermission)
        # true -> allow
        assert "WebFetch(domain:*.contoso.com)" in perm.allow
        assert "WebFetch(domain:api.github.com)" in perm.allow
        # false -> ask
        assert "WebFetch(domain:www.example.com)" in perm.ask
        assert "WebFetch(domain:untrusted.com)" in perm.ask

    def test_to_canonical_urls_complex(self, adapter):
        """Test complex URL permissions with split approval."""
        fixture_path = Path("tests/fixtures/copilot/permissions/urls-complex.json")
        content = fixture_path.read_text()

        perm = adapter.to_canonical(content, ConfigType.PERMISSION)

        assert isinstance(perm, CanonicalPermission)
        # Full approval (both true)
        assert "WebFetch(domain:github.com)" in perm.allow
        # Full denial (both false)
        assert "WebFetch(domain:malicious.com)" in perm.ask
        # Split approval (maps to ask with metadata)
        assert "WebFetch(domain:example.com/api)" in perm.ask
        # Check metadata stores split approvals
        assert perm.has_metadata('vscode_split_url_approvals')
        split_approvals = perm.get_metadata('vscode_split_url_approvals')
        assert any(s['url'] == "https://example.com/api/*" for s in split_approvals)

    def test_to_canonical_combined(self, adapter):
        """Test combined terminal and URL permissions."""
        fixture_path = Path("tests/fixtures/copilot/permissions/combined.json")
        content = fixture_path.read_text()

        perm = adapter.to_canonical(content, ConfigType.PERMISSION)

        assert isinstance(perm, CanonicalPermission)
        # Terminal permissions
        assert "Bash(mkdir:*)" in perm.allow
        assert "Bash(/^git (status|diff)$/)" in perm.allow
        assert "Bash(rm:*)" in perm.ask
        # URL permissions
        assert "WebFetch(domain:*.github.com)" in perm.allow
        assert "WebFetch(domain:untrusted.com)" in perm.ask

    def test_to_canonical_empty(self, adapter):
        """Test empty settings (valid but no permissions)."""
        fixture_path = Path("tests/fixtures/copilot/permissions/empty.json")
        content = fixture_path.read_text()

        perm = adapter.to_canonical(content, ConfigType.PERMISSION)

        assert isinstance(perm, CanonicalPermission)
        assert perm.allow == []
        assert perm.ask == []
        assert perm.deny == []

    def test_to_canonical_minimal(self, adapter):
        """Test minimal settings (empty permission objects)."""
        fixture_path = Path("tests/fixtures/copilot/permissions/minimal.json")
        content = fixture_path.read_text()

        perm = adapter.to_canonical(content, ConfigType.PERMISSION)

        assert isinstance(perm, CanonicalPermission)
        assert perm.allow == []
        assert perm.ask == []
        assert perm.deny == []

    def test_from_canonical_terminal(self, adapter):
        """Test Claude -> VS Code terminal conversion."""
        perm = CanonicalPermission(
            allow=["Bash(mkdir:*)","Bash(/^git status$/)"],
            ask=["Bash(rm:*)", "Bash(/dangerous/)"],
            deny=[],
            source_format="claude"
        )

        content = adapter.from_canonical(perm, ConfigType.PERMISSION)
        data = json.loads(content)

        assert "chat.tools.terminal.autoApprove" in data
        terminal = data["chat.tools.terminal.autoApprove"]
        # Allow rules -> true
        assert terminal["mkdir"] == True
        assert terminal["/^git status$/"] == True
        # Ask rules -> false
        assert terminal["rm"] == False
        assert terminal["/dangerous/"] == False

    def test_from_canonical_urls(self, adapter):
        """Test Claude -> VS Code URL conversion."""
        perm = CanonicalPermission(
            allow=["WebFetch(domain:*.github.com)"],
            ask=["WebFetch(domain:untrusted.com)"],
            deny=[],
            source_format="claude"
        )

        content = adapter.from_canonical(perm, ConfigType.PERMISSION)
        data = json.loads(content)

        assert "chat.tools.urls.autoApprove" in data
        urls = data["chat.tools.urls.autoApprove"]
        # Allow rules -> true
        assert urls["https://*.github.com/*"] == True
        # Ask rules -> false
        assert urls["https://untrusted.com/*"] == False

    def test_from_canonical_deny_handling(self, adapter):
        """Test lossy conversion: Claude deny -> VS Code false."""
        perm = CanonicalPermission(
            allow=[],
            ask=[],
            deny=["Bash(rm -rf:*)", "WebFetch(domain:malicious.com)"],
            source_format="claude"
        )

        content = adapter.from_canonical(perm, ConfigType.PERMISSION)
        data = json.loads(content)

        # Deny rules should map to false (require approval)
        assert data["chat.tools.terminal.autoApprove"]["rm -rf"] == False
        assert data["chat.tools.urls.autoApprove"]["https://malicious.com/*"] == False

    def test_deny_conversion_warnings(self, adapter):
        """Test that warnings are generated for lossy deny conversions."""
        perm = CanonicalPermission(
            allow=[],
            ask=[],
            deny=["Bash(rm -rf:*)", "WebFetch(domain:malicious.com)"],
            source_format="claude"
        )

        # Clear any existing warnings
        adapter.clear_conversion_warnings()

        # Convert to VS Code format
        content = adapter.from_canonical(perm, ConfigType.PERMISSION)

        # Check that warnings were generated
        warnings = adapter.get_warnings()
        assert len(warnings) == 2
        assert any("deny rule" in w.lower() for w in warnings)
        assert any("Bash(rm -rf:*)" in w for w in warnings)
        assert any("WebFetch(domain:malicious.com)" in w for w in warnings)
        assert any("doesn't support blocking" in w for w in warnings)

    def test_round_trip_fidelity(self, adapter):
        """Test Copilot -> Claude -> Copilot preserves data."""
        original_fixture = Path("tests/fixtures/copilot/permissions/terminal-simple.json")
        original_content = original_fixture.read_text()
        original_data = json.loads(original_content)

        # Copilot -> Canonical
        canonical = adapter.to_canonical(original_content, ConfigType.PERMISSION)

        # Canonical -> Copilot
        converted_content = adapter.from_canonical(canonical, ConfigType.PERMISSION)
        converted_data = json.loads(converted_content)

        # Compare terminal settings
        assert converted_data["chat.tools.terminal.autoApprove"] == original_data["chat.tools.terminal.autoApprove"]

    def test_regex_preservation(self, adapter):
        """Test complex regex patterns are preserved."""
        perm = CanonicalPermission(
            allow=["Bash(/^git (status|show\\b.*)$/)"],
            ask=[],
            deny=[],
            source_format="claude"
        )

        content = adapter.from_canonical(perm, ConfigType.PERMISSION)
        data = json.loads(content)

        # Regex should be preserved exactly
        assert "/^git (status|show\\b.*)$/" in data["chat.tools.terminal.autoApprove"]
        assert data["chat.tools.terminal.autoApprove"]["/^git (status|show\\b.*)$/"] == True

    def test_invalid_json(self, adapter):
        """Test invalid JSON raises error."""
        with pytest.raises(ValueError, match="Invalid JSON"):
            adapter.to_canonical("{invalid json", ConfigType.PERMISSION)

class TestPermissionRegistry:
    def test_detect_settings_json(self):
        registry = FormatRegistry()
        registry.register(ClaudeAdapter())

        adapter = registry.detect_format(Path("settings.json"))
        assert adapter is not None
        assert adapter.format_name == "claude"

        adapter = registry.detect_format(Path(".claude/settings.local.json"))
        assert adapter is not None
        assert adapter.format_name == "claude"
