#!/usr/bin/env python3
"""Probe instruction links from each of the twenty qualified owning packages."""
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
OWNERS = [
    'packages/agents/tables',
    'packages/documents/domain',
    'packages/documents/server',
    'packages/documents/tables',
    'packages/documents/use-cases',
    'packages/drivers/cosmos',
    'packages/drivers/n3',
    'packages/drivers/oxigraph',
    'packages/drivers/shacl',
    'packages/epistemic/client',
    'packages/epistemic/config',
    'packages/epistemic/ui',
    'packages/law-practice/tables',
    'packages/ontology/client',
    'packages/ontology/config',
    'packages/ontology/domain',
    'packages/ontology/server',
    'packages/ontology/ui',
    'packages/ontology/use-cases',
    'packages/shared/use-cases'
]

for owner in OWNERS:
    result = subprocess.run([
        'python3',
    '-c',
        'import pathlib,json,hashlib; '
        'p=pathlib.Path("CLAUDE.md"); a=pathlib.Path("AGENTS.md"); '
        'assert p.is_symlink() and p.readlink()==pathlib.Path("AGENTS.md"); '
        'assert p.resolve()==a.resolve() and p.read_bytes()==a.read_bytes(); '
        'print(json.dumps({"package":json.loads(pathlib.Path("package.json").read_text())["name"],'
        '"sha256":hashlib.sha256(p.read_bytes()).hexdigest(),"instructions":p.read_text()}))'
    ], cwd=ROOT / owner, stdin=subprocess.DEVNULL, capture_output=True, text=True, check=True)
    print(json.dumps({'owner': owner, 'exit': result.returncode, **json.loads(result.stdout)}))
