"""
Shared utility functions for adapters.
"""

from typing import Any, List


def parse_tool_list(tools_value: Any) -> List[str]:
    """
    Parse tools from comma-separated string or list.

    Args:
        tools_value: Either string "tool1, tool2" or list ["tool1", "tool2"]

    Returns:
        List of tool names
    """
    if isinstance(tools_value, str):
        return [t.strip() for t in tools_value.split(',') if t.strip()]
    elif isinstance(tools_value, list):
        return tools_value
    return []
