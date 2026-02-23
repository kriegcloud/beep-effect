"""
Copilot permission config type handler.

Handles conversion of VS Code permission settings (chat.tools.terminal.autoApprove,
chat.tools.urls.autoApprove) to/from canonical permission representation.
"""

import json
import re
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path
from core.canonical_models import CanonicalPermission, ConfigType
from adapters.shared.config_type_handler import ConfigTypeHandler


class CopilotPermissionHandler(ConfigTypeHandler):
    """Handler for Copilot/VS Code permission settings."""

    @property
    def config_type(self) -> ConfigType:
        return ConfigType.PERMISSION

    def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalPermission:
        """
        Convert VS Code settings JSON to canonical permission.

        Parses chat.tools.terminal.autoApprove and chat.tools.urls.autoApprove
        settings and maps to Claude-style permission categories.
        """
        try:
            settings = json.loads(content)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON in VS Code settings file")

        allow_list = []
        ask_list = []
        metadata = {}

        # Parse terminal permissions
        terminal_allow, terminal_ask, terminal_metadata = self._parse_terminal_permissions(
            settings.get('chat.tools.terminal.autoApprove', {})
        )
        allow_list.extend(terminal_allow)
        ask_list.extend(terminal_ask)
        metadata.update(terminal_metadata)

        # Parse URL permissions
        url_allow, url_ask, url_metadata = self._parse_url_permissions(
            settings.get('chat.tools.urls.autoApprove', {})
        )
        allow_list.extend(url_allow)
        ask_list.extend(url_ask)
        metadata.update(url_metadata)

        return CanonicalPermission(
            allow=allow_list,
            ask=ask_list,
            deny=[],  # VS Code doesn't have deny concept
            metadata=metadata,
            source_format='copilot'
        )

    def from_canonical(self, canonical_obj: Any,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical permission to VS Code settings JSON.

        Generates chat.tools.terminal.autoApprove and chat.tools.urls.autoApprove
        settings from canonical permission categories.
        """
        if not isinstance(canonical_obj, CanonicalPermission):
            raise ValueError("Expected CanonicalPermission for PERMISSION config type")

        settings = {}
        terminal_settings = {}
        url_settings = {}
        warnings = []

        # Process allow rules
        for rule in canonical_obj.allow:
            if rule.startswith('Bash('):
                pattern = self._extract_bash_pattern(rule)
                if pattern:
                    terminal_settings[pattern] = True

            elif rule.startswith('WebFetch('):
                pattern = self._extract_webfetch_pattern(rule)
                if pattern:
                    url_settings[pattern] = True

        # Process ask rules
        for rule in canonical_obj.ask:
            if rule.startswith('Bash('):
                pattern = self._extract_bash_pattern(rule)
                if pattern:
                    terminal_settings[pattern] = False

            elif rule.startswith('WebFetch('):
                pattern = self._extract_webfetch_pattern(rule)
                if pattern:
                    url_settings[pattern] = False

        # Process deny rules (lossy conversion: map to false with warning)
        for rule in canonical_obj.deny:
            if rule.startswith('Bash('):
                pattern = self._extract_bash_pattern(rule)
                if pattern:
                    terminal_settings[pattern] = False
                    warning_msg = f"Claude deny rule '{rule}' mapped to VS Code 'false' (require approval). VS Code doesn't support blocking commands entirely."
                    warnings.append(warning_msg)

            elif rule.startswith('WebFetch('):
                pattern = self._extract_webfetch_pattern(rule)
                if pattern:
                    url_settings[pattern] = False
                    warning_msg = f"Claude deny rule '{rule}' mapped to VS Code 'false' (require approval). VS Code doesn't support blocking URLs entirely."
                    warnings.append(warning_msg)

        # Build final settings object
        if terminal_settings:
            settings['chat.tools.terminal.autoApprove'] = terminal_settings
        if url_settings:
            settings['chat.tools.urls.autoApprove'] = url_settings

        # Append warnings to adapter's warnings list for orchestrator to display
        if warnings and options and options.get('adapter'):
            adapter = options['adapter']
            adapter.warnings.extend(warnings)

        # Store warnings in metadata for retrieval (backward compatibility)
        if warnings and options and options.get('store_warnings'):
            canonical_obj.add_metadata('conversion_warnings', warnings)

        return json.dumps(settings, indent=2)

    def _parse_terminal_permissions(self, terminal_settings: Dict[str, bool]) -> Tuple[List[str], List[str], Dict]:
        """
        Extract terminal permissions from VS Code settings.

        Args:
            terminal_settings: The chat.tools.terminal.autoApprove object

        Returns:
            Tuple of (allow_list, ask_list, metadata)
        """
        allow_list = []
        ask_list = []
        metadata = {}

        for pattern, approved in terminal_settings.items():
            if not pattern:
                continue

            claude_rule = self._convert_terminal_pattern(pattern)

            if approved is True:
                allow_list.append(claude_rule)
            elif approved is False:
                ask_list.append(claude_rule)

        return allow_list, ask_list, metadata

    def _parse_url_permissions(self, url_settings: Dict[str, Any]) -> Tuple[List[str], List[str], Dict]:
        """
        Extract URL permissions from VS Code settings.

        Args:
            url_settings: The chat.tools.urls.autoApprove object

        Returns:
            Tuple of (allow_list, ask_list, metadata)
        """
        allow_list = []
        ask_list = []
        metadata = {}
        split_approvals = []

        for url_pattern, approval in url_settings.items():
            if not url_pattern:
                continue

            if isinstance(approval, bool):
                # Simple boolean approval
                claude_rule = self._convert_url_pattern(url_pattern)

                if approval is True:
                    allow_list.append(claude_rule)
                elif approval is False:
                    ask_list.append(claude_rule)

            elif isinstance(approval, dict):
                # Split approval: {approveRequest: bool, approveResponse: bool}
                approve_request = approval.get('approveRequest', False)
                approve_response = approval.get('approveResponse', False)

                claude_rule = self._convert_url_pattern(url_pattern)

                if approve_request and approve_response:
                    # Both approved - full allow
                    allow_list.append(claude_rule)
                elif not approve_request and not approve_response:
                    # Both denied - ask for approval
                    ask_list.append(claude_rule)
                else:
                    # Split approval: Claude doesn't support this granularity
                    # Map to 'ask' (safer) and store original in metadata
                    ask_list.append(claude_rule)
                    split_approvals.append({
                        'url': url_pattern,
                        'approveRequest': approve_request,
                        'approveResponse': approve_response
                    })

        if split_approvals:
            metadata['vscode_split_url_approvals'] = split_approvals

        return allow_list, ask_list, metadata

    def _convert_terminal_pattern(self, pattern: str) -> str:
        """
        Convert VS Code terminal pattern to Claude Bash() format.

        Args:
            pattern: VS Code pattern (e.g., "mkdir" or "/^git.*$/")

        Returns:
            Claude permission rule (e.g., "Bash(mkdir:*)" or "Bash(/^git.*$/)")
        """
        if not pattern:
            raise ValueError("Pattern cannot be empty")

        if pattern.startswith('/') and pattern.endswith('/'):
            # Already regex - wrap in Bash()
            return f"Bash({pattern})"
        else:
            # Simple string - convert to glob pattern
            # VS Code: "mkdir" matches "mkdir foo" (prefix match)
            # Claude: "Bash(mkdir:*)" for glob
            return f"Bash({pattern}:*)"

    def _convert_url_pattern(self, url_pattern: str) -> str:
        """
        Convert VS Code URL pattern to Claude WebFetch() format.

        Args:
            url_pattern: VS Code URL pattern (e.g., "https://*.github.com/*")

        Returns:
            Claude permission rule (e.g., "WebFetch(domain:*.github.com)")
        """
        if not url_pattern:
            raise ValueError("URL pattern cannot be empty")

        # Extract domain from URL
        # VS Code: "https://www.example.com" or "https://*.contoso.com/*"
        # Claude: "WebFetch(domain:www.example.com)" or "WebFetch(domain:*.contoso.com)"

        # Strip protocol
        if '://' in url_pattern:
            domain = url_pattern.split('://', 1)[1]
        else:
            domain = url_pattern

        # Remove trailing path wildcards (VS Code includes path, Claude uses domain)
        # "*.github.com/*" -> "*.github.com"
        if domain.endswith('/*'):
            domain = domain[:-2]

        return f"WebFetch(domain:{domain})"

    def _extract_bash_pattern(self, rule: str) -> Optional[str]:
        """
        Extract the pattern from a Claude Bash() rule.

        Args:
            rule: Claude rule like "Bash(mkdir:*)" or "Bash(/^git.*$/)"

        Returns:
            Pattern string or None if invalid
        """
        match = re.match(r'Bash\((.*)\)', rule)
        if not match:
            return None

        pattern = match.group(1)

        # If it's a regex pattern (starts and ends with /), keep as-is
        if pattern.startswith('/') and pattern.endswith('/'):
            return pattern

        # If it's a glob pattern ending with :*, strip that
        if pattern.endswith(':*'):
            return pattern[:-2]

        # Otherwise return as-is
        return pattern

    def _extract_webfetch_pattern(self, rule: str) -> Optional[str]:
        """
        Extract the URL pattern from a Claude WebFetch() rule.

        Args:
            rule: Claude rule like "WebFetch(domain:*.github.com)"

        Returns:
            URL pattern string or None if invalid
        """
        match = re.match(r'WebFetch\(domain:(.*)\)', rule)
        if not match:
            return None

        domain = match.group(1)

        # Reconstruct full URL with https protocol
        # Add trailing /* for consistency with VS Code format
        return f"https://{domain}/*"
