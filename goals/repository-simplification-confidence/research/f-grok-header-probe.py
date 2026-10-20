"""Probe local Grok MCP environment-header support without changing native configuration."""
import json,os,subprocess,tempfile,tomllib
from pathlib import Path
H=Path.home(); R=Path.cwd()
original=(H/'.grok/config.toml').read_bytes()
native=tomllib.loads(original.decode())['mcp_servers']['docker-mcp']
# The existing local gateway is the only authorized probe endpoint.
from urllib.parse import urlsplit
url=urlsplit(native['url'])
if url.hostname not in ('localhost','127.0.0.1','::1') or url.port!=8811:
 raise SystemExit('The configured gateway is outside the local probe boundary.')
secret=native['headers']['Authorization']
(R/'.beep').mkdir(exist_ok=True)
root=Path(tempfile.mkdtemp(prefix='rsc-f-header-probe-',dir=R/'.beep'))
(root/'.grok').mkdir()
(root/'.grok/config.toml').write_text('[mcp_servers.rsc-f-header-probe]\nurl = '+json.dumps(native['url'])+'\nenabled = true\nheaders = { Authorization = "${RSC_MCP_AUTH_HEADER}" }\n')
results=[]
for kind,value in [('valid',secret),('invalid','Bearer __SYNTHETIC_INVALID__')]:
 proc=subprocess.run(['grok','--cwd',str(root),'mcp','doctor','rsc-f-header-probe','--json','--leader-socket',str(root/(kind+'.sock'))],capture_output=True,text=True,env={**os.environ,'RSC_MCP_AUTH_HEADER':value},timeout=45)
 try:data=json.loads(proc.stdout)
 except ValueError:data={}
 results.append({'variant':kind,'exitCode':proc.returncode,'healthyCount':data.get('healthy_count'),'failingCount':data.get('failing_count'),'headerEchoed':secret in proc.stdout+proc.stderr})
ref=tomllib.loads((H/'.codex/config.toml').read_text()).get('mcp_servers',{}).get('docker-mcp',{}).get('bearer_token_env_var')
result={'fixtureOnly':True,'configurationMutationRequested':False,'nativeConfigByteEqual':original==(H/'.grok/config.toml').read_bytes(),'cases':results,'sharedCodexVariablePresent':bool(ref) and bool(os.environ.get(ref))}
print(json.dumps(result,indent=2))
if results[0]['healthyCount']!=1 or results[1]['failingCount']!=1 or not result['nativeConfigByteEqual']:
 raise SystemExit(1)
