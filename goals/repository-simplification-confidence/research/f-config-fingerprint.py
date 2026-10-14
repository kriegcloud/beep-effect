"""Read-only configuration fingerprint; output contains paths, sizes and hashes only."""
import hashlib,json,datetime,argparse,sys
from pathlib import Path
H=Path.home();R=Path.cwd()
native=['.codex/config.toml','.codex/AGENTS.md','.claude/settings.json','.claude/CLAUDE.md','.claude/memory/beep-effect/MEMORY.md','.grok/config.toml','.junie/settings.json','.junie/AGENTS.md','.junie/mcp/mcp.json','.cursor/cli-config.json','.cursor/mcp.json','.config/JetBrains/Air/.codex/config.toml','.config/beep/models.yaml','.claude.json','.claude/plugins/installed_plugins.json','.config/Claude/claude_desktop_config.json','.kiro/settings/mcp.json','.copilot/mcp-config.json','.gemini/settings.json','.config/opencode/opencode.json']
rows=[]
def add(p,label):
 if p.is_file():
  b=p.read_bytes();row={'path':label,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
  if p.is_symlink():row['linkSha256']=hashlib.sha256(str(p.readlink()).encode()).hexdigest()
  rows.append(row)
 elif p.is_symlink():rows.append({'path':label,'symlinkDirectory':p.is_dir(),'missingTarget':not p.exists(),'sha256':hashlib.sha256(str(p.readlink()).encode()).hexdigest()})
for name in native:add(H/name,'~/'+name)
for name in ['AGENTS.md','.codex/config.toml','.codex/hooks.json','.cursor/cli.json','.cursor/hooks.json','.mcp.json','.claude/settings.json','skills-lock.json']:add(R/name,name)
for prefix in ['.codex/agents','.codex/hooks','.claude/agents','.claude/hooks','.claude/skills','.cursor/hooks','.grok/skills','.grok/workflows','.junie']:
 for p in sorted((R/prefix).rglob('*')):add(p,p.relative_to(R).as_posix())
for prefix in ['.codex/agents','.codex/hooks','.claude/agents','.junie/agents']:
 for p in sorted((H/prefix).rglob('*')):add(p,'~/'+p.relative_to(H).as_posix())
rows.sort(key=lambda x:x['path'])
fingerprint=hashlib.sha256(''.join(x['path']+' '+x.get('sha256','missing')+' '+x.get('linkSha256','')+'\n' for x in rows).encode()).hexdigest()
result={'format':'rsc-f-config-fingerprint/v1','capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),'setSha256':fingerprint,'files':rows}
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check',type=Path,help='Fail if the current set differs from a frozen JSON receipt')
args=parser.parse_args()
if args.check:
 previous=json.loads(args.check.read_text())
 old={x['path']:x.get('sha256','missing')+' '+x.get('linkSha256','') for x in previous['files']}
 current={x['path']:x.get('sha256','missing')+' '+x.get('linkSha256','') for x in rows}
 changed=sorted(k for k in old.keys()|current.keys() if old.get(k)!=current.get(k))
 print(json.dumps({'match':previous['setSha256']==fingerprint,'setSha256':fingerprint,'changedPaths':changed},indent=2))
 sys.exit(0 if previous['setSha256']==fingerprint else 1)
print(json.dumps(result,indent=2))
