"""Read-only configuration fingerprint; output contains paths, sizes and hashes only."""
import hashlib,json
from pathlib import Path
H=Path.home();R=Path.cwd()
native=['.codex/config.toml','.codex/AGENTS.md','.claude/settings.json','.claude/CLAUDE.md','.claude/memory/beep-effect/MEMORY.md','.grok/config.toml','.junie/settings.json','.junie/AGENTS.md','.junie/mcp.json','.cursor/cli-config.json','.cursor/mcp.json','.config/JetBrains/Air/.codex/config.toml','.config/beep/models.yaml']
rows=[]
def add(p,label):
 if p.is_file():
  b=p.read_bytes();rows.append({'path':label,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
 elif p.is_symlink():rows.append({'path':label,'missingTarget':True})
for name in native:add(H/name,'~/'+name)
for name in ['AGENTS.md','.codex/config.toml','.codex/hooks.json','.cursor/cli.json','.cursor/hooks.json','.mcp.json','.claude/settings.json','skills-lock.json']:add(R/name,name)
for prefix in ['.codex/agents','.codex/hooks','.claude/agents','.claude/skills','.grok/skills']:
 for p in sorted((R/prefix).rglob('*')):add(p,p.relative_to(R).as_posix())
rows.sort(key=lambda x:x['path'])
fingerprint=hashlib.sha256(''.join(x['path']+' '+x.get('sha256','missing')+'\n' for x in rows).encode()).hexdigest()
print(json.dumps({'format':'rsc-f-config-fingerprint/v1','setSha256':fingerprint,'files':rows},indent=2))
