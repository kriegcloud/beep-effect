#!/usr/bin/env python3
"""Read-only source/native specialist probe; writes evidence only under .beep/."""
import hashlib
import json
from pathlib import Path
import subprocess
import tomllib

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / '.beep/s44-rsc-gated-b/projection'
OUT.mkdir(parents=True, exist_ok=True)


def canonical(body):
    """Normalize only established discovery aliases and the Effect child path."""
    return (body.strip().replace('CLAUDE.md', 'AGENTS.md')
            .replace('.claude/skills/', '.agents/skills/')
            .replace('at `.repos/effect`, the child clone at `$HOME/YeeBois/references/effect/effect`\n   (Effect `main` is v4), never training-data priors.',
                     '(`.repos/effect`, Effect `main` is v4) — never training-data priors.'))


results = []
assert (ROOT / 'CLAUDE.md').resolve() == ROOT / 'AGENTS.md'
assert (ROOT / '.agents/skills').resolve() == (ROOT / '.claude/skills').resolve()
native_paths = sorted((ROOT / '.codex/agents').glob('*.toml'))
assert len(native_paths) == 7, 'Expected the seven retained native specialists'
for path in native_paths:
    native = tomllib.loads(path.read_text())
    source_path = ROOT / '.claude/agents' / (path.stem + '.md')
    source_text = source_path.read_text()
    frontmatter, source = source_text.split('---', 2)[1:]
    source = source.strip()
    metadata = dict(line.split(': ', 1) for line in frontmatter.strip().splitlines())
    assert metadata['name'] == native['name']
    assert metadata['description'] == native['description'], path.stem
    assert native['name'] == path.stem
    assert canonical(source) == canonical(native['developer_instructions']), path.stem
    before = hashlib.sha256(path.read_bytes()).hexdigest()
    # This is the actual native developer_instructions field, decoded from TOML;
    # the invocation does not substitute a source body or modify native config.
    argv = ['timeout', '180', 'codex', 'exec', '--ephemeral', '--sandbox', 'read-only',
            '--model', 'gpt-6.1-sol', '-c', 'model_reasoning_effort="medium"',
            '-c', 'developer_instructions=' + json.dumps(native['developer_instructions']),
            '--json', '-o', str(OUT / (path.stem + '.txt')),
            'Instruction activation probe only. Do not use tools, edit files, delegate, or perform a review. '
            'State your specialist role and three binding constraints from your developer instructions. '
            'Return a short JSON object with role and constraints.']
    run = subprocess.run(argv, cwd=ROOT, stdin=subprocess.DEVNULL, capture_output=True, text=True)
    (OUT / (path.stem + '.jsonl')).write_text(run.stdout)
    (OUT / (path.stem + '.stderr')).write_text(run.stderr)
    response_path = OUT / (path.stem + '.txt')
    response = response_path.read_text() if response_path.exists() else ''
    if run.returncode == 0:
        parsed = json.loads(response)
        assert isinstance(parsed['role'], str) and len(parsed['constraints']) == 3
    result = {'role': path.stem, 'source': str(source_path.relative_to(ROOT)),
              'native': str(path.relative_to(ROOT)), 'native_sha256': before,
              'fields': sorted(native), 'canonical_body_equal': True,
              'exit': run.returncode,
              'response': response}
    assert hashlib.sha256(path.read_bytes()).hexdigest() == before
    results.append(result)
    (OUT / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
    print(f"{path.stem}: exit={run.returncode}", flush=True)
    if run.returncode:
        raise SystemExit(run.returncode)
