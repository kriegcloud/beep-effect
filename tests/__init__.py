"""
Test suite for universal agent sync tool.

This module contains unit tests and integration tests for:
- Canonical models
- Format adapters (Claude, Copilot, Cursor, etc.)
- Format registry
- Sync orchestrator
- State manager

Test structure:
- test_canonical_models.py - Tests for canonical data models
- test_adapters.py - Tests for format adapters
- test_registry.py - Tests for format registry
- test_orchestrator.py - Tests for sync orchestrator
- test_state_manager.py - Tests for state manager
- test_cli.py - Tests for CLI argument parsing and invocation
- test_integration.py - End-to-end integration tests
- fixtures/ - Sample agent files for testing

Running tests:
    pytest tests/
    pytest tests/test_adapters.py -v
    pytest tests/ -k "test_claude"
"""
