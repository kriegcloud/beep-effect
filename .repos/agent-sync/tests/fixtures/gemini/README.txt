Gemini CLI Sample Fixtures

This directory contains example Gemini CLI configuration files for testing and reference.

Directory Structure:
==================

commands/
  commit.toml          - Basic custom command with git integration
  document.toml        - Custom command with file embedding (@{...})
  analyze.toml         - Custom command without {{args}} placeholder
  git/
    review.toml        - Namespaced command (invoked as /git:review)

settings.json          - Settings with aliases, overrides, and tool config
trustedFolders.json    - Folder trust permissions

File Descriptions:
==================

Custom Commands (TOML):
- Demonstrate various placeholder types ({{args}}, !{cmd}, @{file})
- Show namespacing via directory structure
- Include descriptions and multi-line prompts
- Examples cover common use cases (git, code review, documentation)

Settings.json:
- Custom aliases with model configurations
- Alias inheritance via "extends" property
- Overrides with scope matching
- Tool settings (sandbox, autoAccept)
- Folder trust configuration

TrustedFolders.json:
- Example folder trust records
- Shows trusted and untrusted folders
- Includes timestamps

Usage in Tests:
===============

These fixtures can be used to test:
1. TOML parsing and generation
2. Custom command to CanonicalSlashCommand conversion
3. Settings parsing and alias handling
4. Namespace extraction from file paths
5. Placeholder syntax detection and translation

See tests/test_adapters.py for test examples using these fixtures.
