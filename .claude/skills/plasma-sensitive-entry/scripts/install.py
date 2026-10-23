#!/usr/bin/env python3
"""Install global discovery links and a small Codex default rule, preserving content."""
from pathlib import Path
import sys

START = "<!-- plasma-sensitive-entry:begin -->"
END = "<!-- plasma-sensitive-entry:end -->"
RULE = f"""{START}
## Sensitive human input

When an authorized task needs a password, OTP, recovery code, token or other
sensitive human text, read `~/.agents/skills/plasma-sensitive-entry/SKILL.md`
and use its masked Plasma delivery process. Never ask for the value in chat,
question tools, terminal input or files. Existing local YubiKey notification
wrappers, remote authentication wrappers and agent 1Password routes take
precedence. If secure GUI delivery is unavailable, stop sensitive collection.
{END}
"""


def install(home, source):
    targets = [home / ".agents/skills/plasma-sensitive-entry", home / ".claude/skills/plasma-sensitive-entry"]
    instructions = home / ".codex/AGENTS.md"
    original = instructions.read_text() if instructions.exists() else ""
    # Preflight every target before writing anything; never replace another skill.
    for target in targets:
        if target.is_symlink():
            if target.resolve() != source:
                raise RuntimeError("Existing global skill link belongs to another source.")
        elif target.exists():
            raise RuntimeError("Existing global skill directory must be reconciled by its owner.")
    if original.count(START) != original.count(END) or original.count(START) > 1 or (START in original and original.index(END) < original.index(START)):
        raise RuntimeError("Incomplete default-rule markers require reconciliation.")
    if START in original:
        before, remainder = original.split(START, 1)
        _, after = remainder.split(END, 1)
        updated = before + RULE.rstrip("\n") + after
    else:
        updated = original.rstrip("\n") + "\n\n" + RULE
    for target in targets:
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.is_symlink():
            target.symlink_to(source, target_is_directory=True)
    instructions.parent.mkdir(parents=True, exist_ok=True)
    instructions.write_text(updated)


if __name__ == "__main__":
    try:
        install(Path.home(), Path(__file__).resolve().parents[1])
    except (OSError, RuntimeError):
        print("Global skill installation failed; reconcile existing targets before retrying.", file=sys.stderr)
        sys.exit(2)
    print("Global Codex default rule and Codex/Claude skill discovery links installed.")
