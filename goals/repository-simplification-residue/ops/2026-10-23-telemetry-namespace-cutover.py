#!/usr/bin/env python3
"""Human-run, reversible native-launcher projection; never stores resolved secrets.

Run with Python 3 and `--apply` after reviewing this file. Use the printed native
launcher names for future sessions. `--rollback` restores only unchanged owned
files. Re-applying after rollback moves the recovery directory to a timestamped
sibling, preserving every backup. Existing sessions and historical observations
retain their old regimes.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
from datetime import datetime, timezone

REF = 'op://BEEP_SECRETS/ai-metrics/hash-salt'
LAUNCHER = '''#!/bin/sh
# Owned by S44 telemetry namespace projection v1; no resolved key on disk.
set -eu
set +x
command -v op >/dev/null
namespace_salt="$(op read op://BEEP_SECRETS/ai-metrics/hash-salt)" || {
  op-doctor
  exit 1
}
[ -n "$namespace_salt" ] || exit 1
BEEP_HOOK_PULSE_HASH_SALT="$namespace_salt"
BEEP_AI_METRICS_HASH_SALT="$namespace_salt"
export BEEP_HOOK_PULSE_HASH_SALT BEEP_AI_METRICS_HASH_SALT
unset namespace_salt
exec __CLIENT__ "$@"
'''


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--rollback', action='store_true')
    args = parser.parse_args()
    if args.apply == args.rollback:
        parser.error('select exactly one of --apply or --rollback')
    home = Path.home()
    state = home / '.local/state/beep/telemetry-namespace-s44'
    journal = state / 'journal.json'
    bindir = home / '.local/bin'
    targets = {f'beep-{client}-telemetry': LAUNCHER.replace('__CLIENT__', client).encode()
               for client in ('claude', 'codex')}
    if any(parent.is_symlink() for parent in (home / '.local', home / '.local/state',
                                               home / '.local/state/beep', state, bindir)):
        raise SystemExit('refusing symlinked projection ancestry')
    if args.rollback:
        data = json.loads(journal.read_text())
        for name, body in targets.items():
            path = bindir / name
            backup = state / f'{name}.before'
            if path.is_symlink():
                raise SystemExit('projection drift; rollback refused before writes')
            if data['prior'][name] and (not backup.is_file() or digest(backup.read_bytes()) != data['priorSha256'][name]):
                raise SystemExit('backup drift; rollback refused before writes')
            allowed = [digest(body)] + ([data['priorSha256'][name]] if data['prior'][name] else [])
            if path.exists() and (not path.is_file() or digest(path.read_bytes()) not in allowed):
                raise SystemExit('projection drift; rollback refused before writes')
        for name in targets:
            path = bindir / name
            backup = state / f'{name}.before'
            if data['prior'][name]:
                shutil.copy2(backup, path)
            else:
                path.unlink(missing_ok=True)
        journal.rename(state / 'rolled-back.json')
        print('restored two owned launcher paths; recovery journal retained')
        return
    if journal.exists():
        if all((bindir / n).is_file() and not (bindir / n).is_symlink()
               and (bindir / n).read_bytes() == b for n, b in targets.items()):
            print('already applied; original cutover and backups retained')
            return
        raise SystemExit('projection drift; apply refused')
    if state.exists() and (not (state / 'rolled-back.json').is_file()
                           or (state / 'rolled-back.json').is_symlink()):
        raise SystemExit('recovery state already exists; inspect before a new cutover')
    for name in targets:
        path = bindir / name
        if path.is_symlink() or (path.exists() and not path.is_file()):
            raise SystemExit('unsupported owned path type')
    if state.exists():
        stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
        retained = state.with_name(f'{state.name}.rolled-back-{stamp}')
        if retained.exists():
            raise SystemExit('recovery generation already exists; retry later')
        state.rename(retained)
        print(f'preserved rolled-back recovery generation: {retained.name}')
    state.mkdir(parents=True, mode=0o700)
    bindir.mkdir(parents=True, exist_ok=True)
    prior = {}
    for name in targets:
        path = bindir / name
        prior[name] = path.exists()
        if path.exists():
            shutil.copy2(path, state / f'{name}.before')
    # Write the recovery journal before changing either owned launcher.
    journal.write_text(json.dumps({'version': 1, 'cutoverUtc': datetime.now(timezone.utc).isoformat(),
                                  'reference': REF, 'prior': prior,
                                  'priorSha256': {n: digest((state / f'{n}.before').read_bytes()) for n in targets if prior[n]},
                                  'ownedSha256': {n: digest(b) for n, b in targets.items()}}, indent=2)+'\n')
    journal.chmod(0o600)
    for name, body in targets.items():
        path = bindir / name
        staged = state / f'{name}.new'
        staged.write_bytes(body)
        staged.chmod(0o700)
        staged.replace(path)
    print('installed beep-claude-telemetry and beep-codex-telemetry; use for future native roots')
    print('historical regimes and ordinary claude/codex launchers remain unchanged')


if __name__ == '__main__':
    main()
