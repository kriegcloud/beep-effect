"""
Example: Converting permissions between VS Code (Copilot) and Claude formats.

This example demonstrates:
1. Converting VS Code permission settings to Claude format
2. Converting Claude permissions to VS Code format
3. Handling lossy conversions (e.g., Claude deny -> VS Code false)
4. Round-trip conversion fidelity
"""

from pathlib import Path
from adapters.copilot import CopilotAdapter
from adapters.claude import ClaudeAdapter
from core.canonical_models import CanonicalPermission, ConfigType


def example_vscode_to_claude():
    """Convert VS Code permission settings to Claude format."""
    print("=" * 70)
    print("EXAMPLE 1: VS Code (Copilot) → Claude")
    print("=" * 70)

    # Sample VS Code settings
    vscode_settings = """{
  "chat.tools.terminal.autoApprove": {
    "mkdir": true,
    "git status": true,
    "/^git push/": false,
    "rm": false
  },
  "chat.tools.urls.autoApprove": {
    "https://*.github.com/*": true,
    "https://untrusted.com": false
  }
}"""

    print("\nInput (VS Code settings.json):")
    print(vscode_settings)

    # Convert using Copilot adapter
    copilot_adapter = CopilotAdapter()
    canonical = copilot_adapter.to_canonical(vscode_settings, ConfigType.PERMISSION)

    print("\nCanonical representation:")
    print(f"  Allow: {canonical.allow}")
    print(f"  Ask: {canonical.ask}")
    print(f"  Deny: {canonical.deny}")

    # Convert to Claude format
    claude_adapter = ClaudeAdapter()
    claude_settings = claude_adapter.from_canonical(canonical, ConfigType.PERMISSION)

    print("\nOutput (Claude settings.json):")
    print(claude_settings)


def example_claude_to_vscode():
    """Convert Claude permissions to VS Code format."""
    print("\n" + "=" * 70)
    print("EXAMPLE 2: Claude → VS Code (Copilot)")
    print("=" * 70)

    # Create Claude permissions
    canonical = CanonicalPermission(
        allow=[
            "Bash(npm run lint)",
            "Bash(npm run test:*)",
            "WebFetch(domain:api.github.com)"
        ],
        ask=[
            "Bash(git push:*)",
            "WebFetch(domain:untrusted.com)"
        ],
        deny=[
            "Bash(rm -rf:*)",
            "WebFetch(domain:malicious.com)"
        ],
        source_format="claude"
    )

    print("\nInput (Claude CanonicalPermission):")
    print(f"  Allow: {canonical.allow}")
    print(f"  Ask: {canonical.ask}")
    print(f"  Deny: {canonical.deny}")

    # Convert to VS Code format
    copilot_adapter = CopilotAdapter()
    vscode_settings = copilot_adapter.from_canonical(canonical, ConfigType.PERMISSION)

    print("\nOutput (VS Code settings.json):")
    print(vscode_settings)

    print("\nWARNING: Claude 'deny' rules were mapped to VS Code 'false' (require approval).")
    print("VS Code doesn't have a true 'deny' concept, so this is a lossy conversion.")


def example_lossy_conversion_warning():
    """Demonstrate lossy conversion handling."""
    print("\n" + "=" * 70)
    print("EXAMPLE 3: Lossy Conversion (Claude deny → VS Code false)")
    print("=" * 70)

    # Create permissions with deny rules (will be lossy when converting to VS Code)
    canonical = CanonicalPermission(
        allow=["Bash(/^git (status|diff)$/)"],
        ask=["Bash(npm install:*)"],
        deny=[
            "Bash(rm -rf:*)",
            "Bash(curl:*)",
            "WebFetch(domain:malicious.com)"
        ],
        source_format="claude"
    )

    print("\nConverting Claude → VS Code with 3 deny rules (lossy conversion):")
    print(f"  Deny rules: {canonical.deny}")

    # Convert to VS Code
    copilot_adapter = CopilotAdapter()
    vscode_settings = copilot_adapter.from_canonical(canonical, ConfigType.PERMISSION)

    print("\nConverted to VS Code:")
    print(vscode_settings)

    print("\nWARNING: Lossy conversion detected!")
    print("  - Claude 'deny' rules were mapped to VS Code 'false' (require approval)")
    print("  - VS Code doesn't support blocking commands/URLs entirely")
    print("  - The deny rules became 'ask for approval' instead of 'block completely'")
    print("\nNOTE: In v2.0.0, use --strict flag to error on lossy conversions (see issue #69)")


def example_round_trip():
    """Demonstrate round-trip conversion fidelity."""
    print("\n" + "=" * 70)
    print("EXAMPLE 4: Round-trip Conversion (VS Code → Claude → VS Code)")
    print("=" * 70)

    # Original VS Code settings
    original_vscode = """{
  "chat.tools.terminal.autoApprove": {
    "mkdir": true,
    "/^git status$/": true,
    "rm": false
  }
}"""

    print("\nOriginal VS Code settings:")
    print(original_vscode)

    # Convert: VS Code → Canonical → VS Code
    copilot_adapter = CopilotAdapter()

    canonical = copilot_adapter.to_canonical(original_vscode, ConfigType.PERMISSION)
    print("\nIntermediate canonical:")
    print(f"  Allow: {canonical.allow}")
    print(f"  Ask: {canonical.ask}")

    recovered_vscode = copilot_adapter.from_canonical(canonical, ConfigType.PERMISSION)
    print("\nRecovered VS Code settings:")
    print(recovered_vscode)

    import json
    original_data = json.loads(original_vscode)
    recovered_data = json.loads(recovered_vscode)

    if original_data == recovered_data:
        print("\n✓ Perfect round-trip fidelity!")
    else:
        print("\n✗ Round-trip fidelity lost (check metadata)")


def example_complex_url_permissions():
    """Demonstrate complex URL permission handling."""
    print("\n" + "=" * 70)
    print("EXAMPLE 5: Complex URL Permissions (Split Approval)")
    print("=" * 70)

    # VS Code with split approval (approveRequest vs approveResponse)
    vscode_settings = """{
  "chat.tools.urls.autoApprove": {
    "https://api.example.com/*": {
      "approveRequest": true,
      "approveResponse": false
    }
  }
}"""

    print("\nVS Code settings with split approval:")
    print(vscode_settings)

    copilot_adapter = CopilotAdapter()
    canonical = copilot_adapter.to_canonical(vscode_settings, ConfigType.PERMISSION)

    print("\nConverted to canonical:")
    print(f"  Allow: {canonical.allow}")
    print(f"  Ask: {canonical.ask}")

    # Check metadata
    if canonical.has_metadata('vscode_split_url_approvals'):
        split_info = canonical.get_metadata('vscode_split_url_approvals')
        print(f"\n  Metadata (split approvals): {split_info}")
        print("  NOTE: Claude doesn't support split request/response approval,")
        print("  so this was mapped to 'ask' (safer) with original stored in metadata.")


if __name__ == "__main__":
    print("\nPERMISSION CONVERSION EXAMPLES")
    print("=" * 70)

    example_vscode_to_claude()
    example_claude_to_vscode()
    example_lossy_conversion_warning()
    example_round_trip()
    example_complex_url_permissions()

    print("\n" + "=" * 70)
    print("Examples complete!")
    print("=" * 70)
