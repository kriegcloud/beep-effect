# Maintenance Scripts

Automation scripts for maintaining context artifacts from Phase 4 of agent-context-optimization.

## Available Scripts

| Script | Purpose | Exit Codes |
|--------|---------|------------|
| `verify-context-links.sh` | Validate all links in context files | 0=success, 1=broken links |
| `check-effect-version.sh` | Check Effect subtree vs package.json version | 0=compatible, 1=mismatch |

## Usage

### Link Verification

```bash
# Run from repository root
bash documentation/scripts/verify-context-links.sh
```

**What it checks**:
- All links in `context/INDEX.md` resolve to existing files
- All links in `AGENTS.md` resolve to existing files
- All cross-references within `context/` files are valid

**Expected output**:
```
Verifying context file links...
✓ All links valid
```

**Failure example**:
```
Verifying context file links...
❌ BROKEN: Duration.md (referenced in context/effect/DateTime.md)
❌ Found 1 broken links
```

### Version Check

```bash
# Run from repository root
bash documentation/scripts/check-effect-version.sh
```

**What it checks**:
- Effect version in `.repos/effect/` subtree
- Effect version in `package.json`
- Compatibility between versions (major.minor match)
- Patch version drift

**Expected output**:
```
Checking Effect version consistency...
Subtree version: 3.19.15
Package version: ^3.19.15 (from package.json)
✓ Versions compatible (both 3.19.x)
```

**Warning example**:
```
Checking Effect version consistency...
Subtree version: 3.18.5
Package version: ^3.19.0 (from package.json)
⚠️  Version mismatch detected!
   Subtree: 3.18.x
   Package: ^3.19.x

Consider updating subtree:
  git fetch effect-upstream main
  git subtree pull --prefix=.repos/effect effect-upstream main --squash
```

## Integration

### Local Development

Add to pre-commit workflow (manual):

```bash
# Before committing changes to context files
bash documentation/scripts/verify-context-links.sh
```

### CI/CD

Add to GitHub Actions workflow (see `documentation/context-maintenance.md` Section 5).

## Troubleshooting

### "Command not found: realpath"

Install `coreutils`:

```bash
# macOS
brew install coreutils

# Ubuntu/Debian
sudo apt-get install coreutils
```

### "Permission denied"

Ensure scripts are executable:

```bash
chmod +x documentation/scripts/*.sh
```

## Related Documentation

- [documentation/context-maintenance.md](../context-maintenance.md) - Complete maintenance guide
- [documentation/subtree-workflow.md](../subtree-workflow.md) - Git subtree commands
