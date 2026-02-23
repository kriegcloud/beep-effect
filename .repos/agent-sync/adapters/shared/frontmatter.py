"""
Shared utilities for parsing YAML frontmatter in Markdown files.

Used by adapters that store agents as .md files with YAML frontmatter
(e.g., Claude Code and GitHub Copilot).

This eliminates code duplication and ensures consistent parsing behavior
across different format adapters.
"""

import re
import yaml
from typing import Tuple


def parse_yaml_frontmatter(content: str) -> Tuple[dict, str]:
    """
    Parse YAML frontmatter from Markdown content.

    Expects content in the format:
        ---
        key: value
        another: value
        ---
        Markdown body content...

    Args:
        content: Markdown content with YAML frontmatter

    Returns:
        Tuple of (frontmatter_dict, body_markdown)
        - frontmatter_dict: Parsed YAML as dictionary
        - body_markdown: Stripped markdown body content

    Raises:
        ValueError: If no valid frontmatter found

    Example:
        >>> content = '''---
        ... name: test-agent
        ... description: Test
        ... ---
        ... Agent instructions'''
        >>> fm, body = parse_yaml_frontmatter(content)
        >>> fm['name']
        'test-agent'
        >>> body
        'Agent instructions'
    """
    # Check for empty content first
    if not content or not content.strip():
        raise ValueError("File is empty")

    # Normalize line endings (Windows CRLF -> Unix LF)
    content = content.replace('\r\n', '\n')

    match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not match:
        raise ValueError("No YAML frontmatter found")

    yaml_content, body = match.groups()
    try:
        frontmatter = yaml.safe_load(yaml_content)
        if frontmatter is None:
            frontmatter = {}
    except yaml.YAMLError:
        # Fallback to loose parsing for malformed YAML
        # (e.g. unquoted multiline strings without indentation)
        frontmatter = _parse_loose_yaml(yaml_content)
        
    return frontmatter, body.strip()


def _parse_loose_yaml(content: str) -> dict:
    """
    Parse loose/invalid YAML content manually.
    
    Handles cases like:
    key: value
    continued value without indentation
    next_key: value
    """
    data = {}
    current_key = None
    current_value = []
    
    # Regex for a key at start of line: "key:" or "my-key:"
    # We assume keys don't have spaces for this simple fallback
    key_pattern = re.compile(r'^([a-zA-Z0-9_-]+):\s*(.*)$')
    
    for line in content.split('\n'):
        line = line.strip()
        if not line:
            continue
            
        match = key_pattern.match(line)
        if match:
            # Save previous key if exists
            if current_key:
                data[current_key] = ' '.join(current_value).strip()
            
            # Start new key
            current_key = match.group(1)
            value_part = match.group(2)
            current_value = [value_part] if value_part else []
        else:
            # Continuation of previous key
            if current_key:
                current_value.append(line)
    
    # Save last key
    if current_key:
        data[current_key] = ' '.join(current_value).strip()
        
    return data


def build_yaml_frontmatter(frontmatter: dict, body: str) -> str:
    """
    Build Markdown content with YAML frontmatter.

    Creates formatted content with frontmatter block and body.

    Args:
        frontmatter: Dictionary of frontmatter fields
        body: Markdown body content

    Returns:
        Complete Markdown content with frontmatter in format:
            ---
            key: value
            ---
            body content

    Example:
        >>> fm = {'name': 'agent', 'description': 'Test'}
        >>> body = 'Instructions here'
        >>> result = build_yaml_frontmatter(fm, body)
        >>> '---' in result
        True
        >>> 'name: agent' in result
        True
    """
    if not frontmatter:
        return body + "\n"
        
    yaml_str = yaml.dump(frontmatter, default_flow_style=False, sort_keys=False)
    return f"---\n{yaml_str}---\n{body}\n"
