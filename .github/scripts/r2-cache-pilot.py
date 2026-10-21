"""Bounded cache experiment; secret configuration stays in the process environment."""
import concurrent.futures,contextlib,hashlib,json,os,pathlib,socket,subprocess,sys,time,urllib.error,urllib.request
PIN='52334c002a55276b29e059caaf19c83326d50ede4280a13dbe48aebde0b816fd'
URL='https://github.com/brunojppb/turbo-cache-server/releases/download/4.0.20/decay-x86_64-unknown-linux-musl'
ROOT=pathlib.Path.cwd()
OUT=ROOT/'.beep/r2-pilot';OUT.mkdir(parents=True,exist_ok=True)
def adapter_binary():
 p=pathlib.Path(os.environ.get('R2_PILOT_ADAPTER',str(OUT/'decay')))
 if not p.exists():
  with urllib.request.urlopen(URL,timeout=45) as r:p.write_bytes(r.read())
 assert hashlib.sha256(p.read_bytes()).hexdigest()==PIN,'Adapter checksum mismatch'
 p.chmod(0o700);return p
@contextlib.contextmanager
def adapter(config):
 with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
 env={'PATH':os.environ['PATH'],'HOST':'127.0.0.1','PORT':str(port),'S3_ENDPOINT':config['endpoint'],'S3_REGION':'auto','S3_BUCKET_NAME':config['bucket'],'S3_ACCESS_KEY':config['accessKeyId'],'S3_SECRET_KEY':config['secretAccessKey'],'S3_USE_PATH_STYLE':'true','TURBO_TOKEN':config['bearer'],'OTEL_SDK_DISABLED':'true','TOKIO_WORKER_THREADS':'2'}
 cpus=sorted(os.sched_getaffinity(0))[:2]
 with (OUT/'adapter.private.log').open('w') as log:
  p=subprocess.Popen(['taskset','-c',','.join(map(str,cpus)),str(adapter_binary())],env=env,stdout=log,stderr=subprocess.STDOUT)
  api='http://127.0.0.1:'+str(port)
  try:
   for _ in range(100):
    try:
     if request(api,config,'/management/health')[0]==200:break
    except Exception:time.sleep(.1)
   else:raise RuntimeError('Adapter did not start')
   yield api
  finally:
   p.terminate()
   try:p.wait(timeout=5)
   except subprocess.TimeoutExpired:p.kill();p.wait(timeout=5)
def request(api,c,path,method='GET',data=None,headers=None,auth=True):
 h={'Authorization':'Bearer '+c['bearer']} if auth else {}
 h.update(headers or {})
 req=urllib.request.Request(api+path,method=method,data=data,headers=h)
 started=time.monotonic()
 try:
  with urllib.request.urlopen(req,timeout=90) as r:return r.status,r.read(),dict(r.headers),time.monotonic()-started
 except urllib.error.HTTPError as e:return e.code,e.read(),dict(e.headers),time.monotonic()-started
def artifact(c,key):return '/v8/artifacts/'+key+'?teamId='+c['team']
def payload(c,label,size):
 seed=hashlib.sha256((c['nonce']+label).encode()).digest();return (seed*((size+31)//32))[:size]
def raw_roundtrips(api,c,label):
 checks=[]
 for size in [5740000,11350000]:
  body=payload(c,label,size);key=hashlib.sha256(body).hexdigest()[:16]
  metadata={'x-artifact-tag':'pilot-metadata-'+label,'x-artifact-duration':'12345'}
  put=request(api,c,artifact(c,key),'PUT',body,metadata)
  assert put[0]==201,('upload',size,put[0])
  got=request(api,c,artifact(c,key));head=request(api,c,artifact(c,key),'HEAD')
  lower={k.lower():v for k,v in got[2].items()};hlower={k.lower():v for k,v in head[2].items()}
  assert got[0]==head[0]==200 and hashlib.sha256(got[1]).digest()==hashlib.sha256(body).digest()
  assert all(lower.get(k)==v and hlower.get(k)==v for k,v in metadata.items())
  checks.append({'bytes':size,'hash':key,'put_s':put[3],'get_s':got[3],'bytes_and_metadata_match':True})
 return checks
def turbo(api,c,task,label,mode='remote:rw'):
 cache=OUT/('local-cache-'+label);cache.mkdir(exist_ok=True)
 env={k:v for k,v in os.environ.items() if not k.startswith('OP_') and k not in ['R2_PILOT_CONFIG','CLOUDFLARE_API_TOKEN','CLOUDFLARE_API_KEY']}
 env.update({'CI':'true','TURBO_API':api,'TURBO_TEAM':c['team'],'TURBO_TOKEN':c['bearer'],'TURBO_CACHE':mode,'TURBO_LOG_ORDER':'stream','TURBO_TELEMETRY_DISABLED':'1','DO_NOT_TRACK':'1'})
 before=set((ROOT/'.turbo/runs').glob('*.json'));start=time.monotonic()
 with (OUT/(label+'.private.log')).open('w') as f:
  p=subprocess.run(['bun','run','--bun','turbo','run',task,'--cache='+mode,'--cache-dir='+str(cache),'--summarize','--output-logs=errors-only',*(['--force'] if label=='ci-producer' else [])],env=env,stdout=f,stderr=subprocess.STDOUT,timeout=900)
 elapsed=time.monotonic()-start
 files=set((ROOT/'.turbo/runs').glob('*.json'))-before
 summary=json.loads(max(files,key=lambda p:p.stat().st_mtime).read_text()) if files else {}
 tasks=[]
 for t in summary.get('tasks',[]):
  if t.get('task')==task or t.get('taskId') in [task,'//#'+task]:
   tasks.append({'task':t.get('task'),'taskId':t.get('taskId'),'hash':t.get('hash'),'cache':t.get('cache'),'execution':{k:v for k,v in (t.get('execution') or {}).items() if k in ['startTime','endTime','exitCode']}})
 result={'task':task,'exit_code':p.returncode,'elapsed_s':elapsed,'tasks':tasks,'mode':mode}
 (OUT/(label+'.json')).write_text(json.dumps(result,indent=2)+'\n')
 assert p.returncode==0 and tasks,('Turbo failed',label,p.returncode)
 return result
def is_remote_hit(result):return all(t.get('cache',{}).get('status')=='HIT' and t.get('cache',{}).get('remote') for t in result['tasks'])
def contention(api,c):
 key=hashlib.sha256((c['nonce']+'contention').encode()).hexdigest()[:16]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  results=list(pool.map(lambda _:request(api,c,artifact(c,key),'PUT',b'pilot-same-hash',{'x-artifact-duration':'1'}),range(3)))
 got=request(api,c,artifact(c,key));assert got[0]==200 and got[1]==b'pilot-same-hash'
 return {'simultaneous_writers':3,'statuses':[r[0] for r in results],'elapsed_s':[r[3] for r in results],'final_object_correct':True}
def run_ci():
 c=json.loads(os.environ['R2_PILOT_CONFIG']);receipt={'host':'aws-ci','nonce':c['nonce']}
 try:
  with adapter(c) as api:
   receipt['workstation_payload_reads']=[]
   for row in c['local_payloads']:
    status,body,headers,elapsed=request(api,c,artifact(c,row['hash']))
    assert status==200 and hashlib.sha256(body).hexdigest()==hashlib.sha256(payload(c,'workstation',row['bytes'])).hexdigest()
    receipt['workstation_payload_reads'].append({'bytes':len(body),'elapsed_s':elapsed,'match':True})
   read=turbo(api,c,'lint:effect-imports','ci-consumer','remote:r');receipt['local_to_ci']=read
   assert is_remote_hit(read),'CI did not restore workstation task from R2'
   assert [t['hash'] for t in read['tasks']]==c['local_task_hashes'],'Producer/consumer hashes differ'
   receipt['ci_cold_baseline']=turbo(api,c,'lint:effect-imports','ci-cold-baseline','local:rw')
   receipt['ci_payloads']=raw_roundtrips(api,c,'aws-ci')
   receipt['ci_to_local_producer']=turbo(api,c,'lint:effect-imports-markdown','ci-producer')
   task=receipt['ci_to_local_producer']['tasks'][0]
   status,_,headers,_=request(api,c,artifact(c,task['hash']),'HEAD')
   assert status==200,'CI producer artifact unavailable after upload'
   duration=next((v for k,v in headers.items() if k.lower()=='x-artifact-duration'),None)
   receipt['ci_uploaded_artifact_duration_ms']=int(duration)
   elapsed=task['execution']['endTime']-task['execution']['startTime']
   assert abs(int(duration)-elapsed)<1000,'R2 metadata does not match CI-produced task duration'
   log=(OUT/'ci-producer.private.log').read_text().lower()
   assert not any(text in log for text in ['failed to upload','error uploading','failed to store artifact']),'Turbo reported an upload failure'
   receipt['status']='success'
   request(api,c,artifact(c,c['marker']),'PUT',json.dumps(receipt).encode(),{'x-artifact-duration':'1'})
 except Exception as e:
  receipt['status']='failed';receipt['failure']=str(e)
  try:
   with adapter(c) as api:request(api,c,artifact(c,c['marker']),'PUT',json.dumps(receipt).encode())
  except Exception:pass
  raise
 finally:
  (OUT/'ci-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 if receipt['status']!='success':sys.exit(1)
if __name__=='__main__':run_ci()
