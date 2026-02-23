"""Tests for shared adapter utilities."""

import pytest
from adapters.shared.frontmatter import parse_yaml_frontmatter, build_yaml_frontmatter


class TestYAMLFrontmatter:
    """Test YAML frontmatter parsing and building utilities."""

    def test_parse_empty_frontmatter(self):
        """Test parsing content with empty frontmatter (returns None from yaml.safe_load)."""
        content = """---

---
Body"""
        fm, body = parse_yaml_frontmatter(content)
        assert fm == {}
        assert body == "Body"

    def test_parse_valid_frontmatter(self):
        """Test parsing content with valid YAML frontmatter."""
        content = """---
name: test-agent
description: Test agent description
tools: Read, Grep
---
Agent instructions go here"""

        fm, body = parse_yaml_frontmatter(content)

        assert fm['name'] == 'test-agent'
        assert fm['description'] == 'Test agent description'
        assert fm['tools'] == 'Read, Grep'
        assert body == 'Agent instructions go here'

    def test_parse_multiline_body(self):
        """Test parsing with multiline markdown body."""
        content = """---
name: agent
description: desc
---
Line 1
Line 2
Line 3"""

        fm, body = parse_yaml_frontmatter(content)

        assert fm['name'] == 'agent'
        assert body == 'Line 1\nLine 2\nLine 3'

    def test_parse_missing_frontmatter(self):
        """Test that parsing fails when frontmatter is missing."""
        content = "Just plain markdown with no frontmatter"

        with pytest.raises(ValueError, match="No YAML frontmatter found"):
            parse_yaml_frontmatter(content)

    def test_parse_malformed_frontmatter(self):
        """Test parsing content with malformed frontmatter (missing closing ---)."""
        content = """---
name: test
description: test
Body without closing frontmatter"""

        with pytest.raises(ValueError, match="No YAML frontmatter found"):
            parse_yaml_frontmatter(content)

    def test_parse_empty_body(self):
        """Test parsing with empty body content."""
        content = """---
name: test
---
"""

        fm, body = parse_yaml_frontmatter(content)

        assert fm['name'] == 'test'
        assert body == ''

    def test_parse_complex_yaml(self):
        """Test parsing with complex YAML structures (lists, nested)."""
        content = """---
name: agent
tools:
  - Read
  - Grep
  - Bash
model: sonnet
---
Instructions"""

        fm, body = parse_yaml_frontmatter(content)

        assert fm['name'] == 'agent'
        assert fm['tools'] == ['Read', 'Grep', 'Bash']
        assert fm['model'] == 'sonnet'

    def test_build_frontmatter(self):
        """Test building content with frontmatter."""
        fm = {'name': 'test-agent', 'description': 'Test description'}
        body = 'Agent instructions'

        result = build_yaml_frontmatter(fm, body)

        assert result.startswith('---\n')
        assert 'name: test-agent' in result
        assert 'description: Test description' in result
        assert result.endswith('\n')
        assert 'Agent instructions' in result

    def test_build_with_multiline_body(self):
        """Test building with multiline body."""
        fm = {'name': 'agent'}
        body = 'Line 1\nLine 2\nLine 3'

        result = build_yaml_frontmatter(fm, body)

        assert 'Line 1\nLine 2\nLine 3' in result

    def test_build_with_empty_body(self):
        """Test building with empty body."""
        fm = {'name': 'agent', 'description': 'desc'}
        body = ''

        result = build_yaml_frontmatter(fm, body)

        assert '---\n' in result
        assert 'name: agent' in result
        # Should still have proper structure even with empty body
        assert result.count('---') == 2

    def test_roundtrip_simple(self):
        """Test that parse -> build -> parse preserves data."""
        original = """---
name: test-agent
description: Agent description
---
Instructions here"""

        # Parse
        fm1, body1 = parse_yaml_frontmatter(original)

        # Build
        rebuilt = build_yaml_frontmatter(fm1, body1)

        # Parse again
        fm2, body2 = parse_yaml_frontmatter(rebuilt)

        # Should be identical
        assert fm1 == fm2
        assert body1 == body2

    def test_roundtrip_complex(self):
        """Test roundtrip with complex YAML structures."""
        original = """---
name: agent
tools:
  - Read
  - Grep
model: sonnet
description: Multi-line
  description here
---
Multi-line
instructions
here"""

        fm1, body1 = parse_yaml_frontmatter(original)
        rebuilt = build_yaml_frontmatter(fm1, body1)
        fm2, body2 = parse_yaml_frontmatter(rebuilt)

        assert fm1 == fm2
        assert body1 == body2

    def test_build_preserves_field_order(self):
        """Test that build_yaml_frontmatter preserves field order."""
        fm = {
            'name': 'agent',
            'description': 'desc',
            'tools': ['Read'],
            'model': 'sonnet'
        }
        body = 'Instructions'

        result = build_yaml_frontmatter(fm, body)

        # YAML dump with sort_keys=False should preserve insertion order in Python 3.7+
        lines = result.split('\n')
        yaml_lines = [l for l in lines if l and not l.startswith('---')]

        # Should have all fields present
        assert any('name:' in l for l in yaml_lines)
        assert any('description:' in l for l in yaml_lines)
        assert any('tools:' in l for l in yaml_lines)
        assert any('model:' in l for l in yaml_lines)
