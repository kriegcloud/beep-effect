# Read-only F evidence collector. Run from the lane root with python3.
# Emits numeric summaries and key names only; never invokes a client or writes home state.
# Samples are historical and not current-fingerprint qualification windows.
import json,statistics,hashlib,tomllib,collections,time
from pathlib import Path
H=Path.home(); R=Path.cwd()
def load(p):
 try:return json.loads(p.read_text())
 except (ValueError,OSError):return {}
def stats(xs):
 xs=sorted(xs)
 return {'n':len(xs),'median':statistics.median(xs),'min':xs[0],'max':xs[-1]} if xs else {'n':0,'status':'not recorded'}
def repo(s):return isinstance(s,str) and '/YeeBois/projects/beep-effect' in s
out={'capturedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'historicalSessionsNotCurrentFingerprintQualified':True}
groups=collections.defaultdict(list)
files=sorted((H/'.claude/projects').glob('*beep-effect*/*.jsonl'),key=lambda p:p.stat().st_mtime,reverse=True)
for p in files:
 surface='unknown';usage=None;deferred=None
 try:
  with p.open() as f:
   for i,line in enumerate(f):
    try:d=json.loads(line)
    except ValueError:continue
    surface=d.get('entrypoint',surface)
    if d.get('type')=='assistant' and usage is None:
     u=d.get('message',{}).get('usage',{});usage=sum(u.get(k,0) for k in ('input_tokens','cache_creation_input_tokens','cache_read_input_tokens')) or None
    a=d.get('attachment',{})
    if isinstance(a,dict) and a.get('type')=='deferred_tools_delta' and deferred is None:deferred=len(a.get('addedNames',[]))
    if i>400 or usage is not None and deferred is not None:break
 except OSError:continue
 if usage is not None and len(groups[surface])<20:groups[surface].append((usage,deferred))
out['claude']={k:{'firstTurnInputTokens':stats([a for a,b in v]),'firstDeferredNames':stats([b for a,b in v if b is not None])} for k,v in groups.items()}
groups=collections.defaultdict(list)
for p in sorted((H/'.codex/sessions').rglob('rollout-*.jsonl'),key=lambda p:p.stat().st_mtime,reverse=True):
 meta=None;usage=None;ttft=None
 try:
  with p.open() as f:
   for i,line in enumerate(f):
    try:d=json.loads(line)
    except ValueError:continue
    q=d.get('payload',{})
    if d.get('type')=='session_meta' and meta is None:
     meta=q
     if not repo(q.get('cwd')) or isinstance(q.get('source'),dict):break
    if d.get('type')=='event_msg' and q.get('type')=='token_count' and usage is None:usage=(q.get('info') or {}).get('last_token_usage',{}).get('input_tokens')
    if d.get('type')=='event_msg' and q.get('type')=='task_complete':ttft=q.get('time_to_first_token_ms');break
    if i>1000:break
 except OSError:continue
 if meta and repo(meta.get('cwd')) and not isinstance(meta.get('source'),dict) and usage is not None:
  surface=meta.get('originator') or meta.get('source','unknown')
  if len(groups[surface])<20:groups[surface].append({'input':usage,'ttft':ttft,'instructionBytes':len((meta.get('base_instructions',{}).get('text','') if isinstance(meta.get('base_instructions'),dict) else meta.get('base_instructions','')).encode())})
out['codex']={k:{'firstTurnInputTokens':stats([x['input'] for x in v]),'timeToFirstTokenMs':stats([x['ttft'] for x in v if x['ttft'] is not None]),'baseInstructionBytes':stats([x['instructionBytes'] for x in v])} for k,v in groups.items()}
groups=collections.defaultdict(list)
for p in sorted((H/'.grok/sessions').rglob('usage.json'),key=lambda p:p.stat().st_mtime,reverse=True):
 if 'beep-effect' not in str(p):continue
 u=load(p);root=p.parent; tools=load(root/'tool_definitions.json');prompt=root/'system_prompt.txt'
 if not isinstance(tools,list):continue
 mode='default' if len(tools)>=20 else 'allowlist-or-specialist'
 if len(groups[mode])>=20:continue
 s=u.get('session',{}); signals=load(root/'signals.json')
 groups[mode].append({'tools':len(tools),'schemaBytes':(root/'tool_definitions.json').stat().st_size,'instructionBytes':prompt.stat().st_size if prompt.exists() else 0,'ticks':s.get('costUsdTicks'),'calls':s.get('modelCalls'),'durationSeconds':signals.get('sessionDurationSeconds')})
out['grok']={k:{n:stats([v[n] for v in vs if v[n] is not None]) for n in ('tools','schemaBytes','instructionBytes','ticks','calls','durationSeconds')} for k,vs in groups.items()}
# Native files: digest and key names only. No message text or credential values leave the reader.
items={'codex':('.codex/config.toml','toml'),'claude':('.claude/settings.json','json'),'grok':('.grok/config.toml','toml'),'cursor':('.cursor/cli-config.json','json'),'junie':('.junie/settings.json','json'),'air-codex':('.config/JetBrains/Air/.codex/config.toml','toml'),'models':('.config/beep/models.yaml','raw')}
out['nativeFiles']=[]
for client,(rel,fmt) in items.items():
 p=H/rel
 if not p.exists():continue
 b=p.read_bytes(); row={'client':client,'path':'~/'+rel,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 if fmt!='raw':
  d=tomllib.loads(b.decode()) if fmt=='toml' else load(p); row['keyNames']=sorted(d)
  if client in ('codex','air-codex'):row.update(projects=len(d.get('projects',{})),hookStates=len(d.get('hooks',{}).get('state',{})),skillRows=len(d.get('skills',{}).get('config',[])),pluginsEnabled=sum(v.get('enabled',False) for v in d.get('plugins',{}).values() if isinstance(v,dict)))
  if client=='claude':row.update(pluginsEnabled=[k for k,v in d.get('enabledPlugins',{}).items() if v],disabledMcpNames=d.get('disabledMcpjsonServers',[]))
  if client=='junie':row.update(model=d.get('modelForLaunch'),subagents=d.get('subagentsMode'))
 out['nativeFiles'].append(row)
out['instructionFiles']=[]
for rel in ('AGENTS.md','CLAUDE.md','.claude/skills/graft/SKILL.md','.grok/skills/graft/SKILL.md'):
 p=R/rel
 if p.exists():out['instructionFiles'].append({'path':rel,'bytes':p.stat().st_size,'symlink':p.is_symlink(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
for rel in ('.codex/AGENTS.md','.claude/CLAUDE.md','.junie/AGENTS.md','.claude/memory/beep-effect/MEMORY.md'):
 p=H/rel
 if p.exists():out['instructionFiles'].append({'path':'~/'+rel,'bytes':p.stat().st_size,'symlink':p.is_symlink(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
out['skillRoots']=[]
for base,label in ((R,''),(H,'~/'),(H/'.config/JetBrains/Air','~/.config/JetBrains/Air/')):
 for client in ('.codex','.claude','.cursor','.junie','.grok','.agents'):
  p=base/client/'skills'
  if not p.exists():continue
  entries=list(p.iterdir()); broken=[]
  for x in entries:
   if x.is_symlink():
    try:valid=x.exists()
    except OSError:valid=False
    if not valid:broken.append(x.name)
  out['skillRoots'].append({'path':label+client+'/skills','entries':len(entries),'links':sum(x.is_symlink() for x in entries),'skills':sum((x/'SKILL.md').is_file() for x in entries),'unresolvedLinks':broken})
print(json.dumps(out,indent=2))
