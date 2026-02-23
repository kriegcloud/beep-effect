---
tool: Bash
event: PreToolUse
name: dd-overwrite
description: Direct disk write with dd
pattern: dd\s+.*of=/dev/
level: critical
action: ask
---

# DD Device Overwrite

This command writes directly to a block device.

**Why dangerous:**
- Can overwrite entire disk partitions or devices
- Data loss is immediate and irreversible
- No confirmation prompt by default
- A typo in the device path can destroy the wrong disk

**Consider:**
- Double-check the device path with `lsblk` or `diskutil list`
- Verify the source file is correct
- Consider using `dd` with `status=progress` to monitor
- Reading from a device (if=) is safe; writing to a device (of=) is dangerous
