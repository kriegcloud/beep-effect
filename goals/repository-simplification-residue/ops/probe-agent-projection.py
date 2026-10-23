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


def validate_response(parsed, expected_role, source):
    """Require the source-declared identity and three distinct source excerpts."""
    if parsed.get('role') != expected_role:
        raise ValueError('Specialist role does not match the parsed source name')
    constraints = parsed.get('constraints')
    if (not isinstance(constraints, list) or len(constraints) != 3
            or not all(isinstance(item, str) and item.strip() for item in constraints)):
        raise ValueError('Expected three nonempty string constraints')
    # Canonical discovery aliases and whitespace wrapping are not semantic changes.
    normalized = [' '.join(canonical(item).split()) for item in constraints]
    source_body = ' '.join(canonical(source).split())
    if len(set(normalized)) != 3 or not all(item in source_body for item in normalized):
        raise ValueError('Constraints must be distinct verbatim excerpts of the parsed source')


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
            f'Set role to exactly {native["name"]!r}. Copy three distinct complete binding constraints '
            'verbatim from the specialist definition in developer_instructions (preserve wording and Markdown). '
            'Exclude harness-level rules and repository-wide instructions outside that specialist definition. '
            'Return a short JSON object with role and constraints.']
    run = subprocess.run(argv, cwd=ROOT, stdin=subprocess.DEVNULL, capture_output=True, text=True)
    (OUT / (path.stem + '.jsonl')).write_text(run.stdout)
    (OUT / (path.stem + '.stderr')).write_text(run.stderr)
    response_path = OUT / (path.stem + '.txt')
    response = response_path.read_text() if response_path.exists() else ''
    if run.returncode == 0:
        parsed = json.loads(response)
        validate_response(parsed, metadata['name'], source)
        negative_checks = {}
        for label, invalid in {
                'mismatched_role': {**parsed, 'role': metadata['name'] + '-wrong'},
                'invented_constraint': {**parsed, 'constraints': [
                    *parsed['constraints'][:2], 'Invented constraint absent from the source.']},
        }.items():
            try:
                validate_response(invalid, metadata['name'], source)
            except ValueError:
                negative_checks[label] = 'rejected'
            else:
                raise AssertionError(f'Negative check unexpectedly passed: {label}')
    result = {'role': path.stem, 'source': str(source_path.relative_to(ROOT)),
              'native': str(path.relative_to(ROOT)), 'native_sha256': before,
              'fields': sorted(native), 'canonical_body_equal': True,
              'exit': run.returncode,
              'response': response,
              'identity_and_source_constraints_valid': run.returncode == 0,
              'negative_checks': negative_checks if run.returncode == 0 else {}}
    assert hashlib.sha256(path.read_bytes()).hexdigest() == before
    results.append(result)
    (OUT / 'results.json').write_text(json.dumps(results, indent=2) + '\n')
    print(f"{path.stem}: exit={run.returncode}", flush=True)
    if run.returncode:
        raise SystemExit(run.returncode)
