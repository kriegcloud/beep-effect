"""Exact-hash qualification over the loopback API; receipts exclude environment values."""
import argparse,contextlib,hashlib,json,os,pathlib,re,socket,subprocess,time,urllib.error,urllib.parse,urllib.request
ROOT=pathlib.Path.cwd();OUT=ROOT/'.beep/r2-cache';OUT.mkdir(parents=True,exist_ok=True)
API=os.environ.get('TURBO_API','');TOKEN=os.environ.get('TURBO_TOKEN','');TEAM=os.environ.get('TURBO_TEAM','')
def request(key,method='GET',body=None,api=API):
    req=urllib.request.Request(api+'/v8/artifacts/'+key+'?teamId='+urllib.parse.quote(TEAM,safe=''),data=body,method=method,headers={'Authorization':'Bearer '+TOKEN,'x-artifact-duration':'1'})
    start=time.monotonic()
    try:
        with urllib.request.urlopen(req,timeout=90) as r:return r.status,r.read(),dict(r.headers),time.monotonic()-start
    except urllib.error.HTTPError as e:return e.code,e.read(),dict(e.headers),time.monotonic()-start

def task(name,label,mode):
    before=set((ROOT/'.turbo/runs').glob('*.json'));start=time.monotonic()
    env={k:v for k,v in os.environ.items() if not k.startswith(('OP_','R2_','CLOUDFLARE_'))};env['TURBO_CACHE']=mode
    cache=OUT/('local-'+label+'-'+str(time.monotonic_ns()))
    with (OUT/(label+'.private.log')).open('w') as out:
        result=subprocess.run(['bun','run','--bun','turbo','run',name,'--cache='+mode,'--cache-dir='+str(cache),'--summarize','--output-logs=errors-only'],env=env,stdout=out,stderr=subprocess.STDOUT,timeout=600)
    files=set((ROOT/'.turbo/runs').glob('*.json'))-before
    if result.returncode or not files:raise RuntimeError('Qualification task failed: '+label)
    summary=json.loads(max(files,key=lambda p:p.stat().st_mtime).read_text())
    row=next(t for t in summary['tasks'] if t.get('task')==name)
    return {'task':name,'hash':row['hash'],'cache':row['cache'],'execution':{k:v for k,v in row.get('execution',{}).items() if k in ['startTime','endTime','exitCode']},'elapsed_s':time.monotonic()-start,'mode':mode}

def fixture(marker,label,size):
    seed=hashlib.sha256((marker+label).encode()).digest();return (seed*((size+31)//32))[:size]

def write_payloads(marker,label):
    rows=[]
    for size in [5740000,11350000]:
        body=fixture(marker,label,size);key=hashlib.sha256(body).hexdigest()[:16]
        status,_,_,elapsed=request(key,'PUT',body)
        if status!=201:raise RuntimeError('Payload upload rejected: '+str(status))
        rows.append({'hash':key,'bytes':size,'sha256':hashlib.sha256(body).hexdigest(),'upload_s':elapsed})
    return rows

def check_payloads(rows):
    for row in rows:
        status,body,_,_=request(row['hash'])
        if status!=200 or len(body)!=row['bytes'] or hashlib.sha256(body).hexdigest()!=row['sha256']:raise RuntimeError('Payload integrity mismatch')

@contextlib.contextmanager
def reader_adapter():
    with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
    env={**os.environ,'R2_ACCESS_KEY_ID':os.environ['R2_READ_ACCESS_KEY_ID'],'R2_SECRET_ACCESS_KEY':os.environ['R2_READ_SECRET_ACCESS_KEY'],'R2_ADAPTER_PORT':str(port)}
    with (OUT/'reader.private.log').open('w') as out:
        process=subprocess.Popen([str(ROOT/'infra/r2-cache/adapter.sh'),'serve'],env=env,stdout=out,stderr=subprocess.STDOUT)
        api='http://127.0.0.1:'+str(port)
        try:
            for _ in range(100):
                try:
                    req=urllib.request.Request(api+'/management/health',headers={'Authorization':'Bearer '+TOKEN})
                    with urllib.request.urlopen(req,timeout=1) as response:
                        if response.status==200:break
                except (OSError,urllib.error.URLError):time.sleep(.1)
            else:raise RuntimeError('Reader adapter did not start')
            yield api
        finally:
            process.terminate()
            try:process.wait(timeout=5)
            except subprocess.TimeoutExpired:process.kill();process.wait(timeout=5)

parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['seed','ci','restore']);parser.add_argument('--marker',required=True);args=parser.parse_args()
if not all([API,TOKEN,TEAM]):raise SystemExit('A resolved Turbo API/token/team tuple is required')
if not re.fullmatch('[a-f0-9]{16}',args.marker):raise SystemExit('Marker must be sixteen hexadecimal characters')
receipt={'mode':args.mode,'marker':args.marker,'status':'running'}
try:
    if args.mode=='seed':
        receipt['producer']=task('lint:effect-imports','seed','remote:w')
        if receipt['producer']['cache']['status']!='MISS':raise RuntimeError('Seed did not execute freshly')
        receipt['payloads']=write_payloads(args.marker,'workstation')
        receipt['status']='success'
        if request(args.marker,'PUT',json.dumps(receipt).encode())[0]!=201:raise RuntimeError('Seed receipt upload failed')
    elif args.mode=='ci':
        if os.environ.get('BEEP_CI_TURBO_R2_ACTIVE')!='true':raise RuntimeError('R2 adapter is not active; refusing an AWS-cache false positive')
        status,body,_,_=request(args.marker)
        if status!=200:raise RuntimeError('Workstation seed receipt missing')
        seed=json.loads(body);check_payloads(seed['payloads'])
        receipt['consumer']=task('lint:effect-imports','ci-consumer','remote:r')
        if receipt['consumer']['hash']!=seed['producer']['hash'] or not receipt['consumer']['cache'].get('remote'):raise RuntimeError('CI did not restore the exact workstation hash')
        receipt['producer']=task('lint:effect-imports-markdown','ci-producer','remote:w')
        if receipt['producer']['cache']['status']!='MISS':raise RuntimeError('CI producer did not execute freshly')
        status,_,headers,_=request(receipt['producer']['hash'],'HEAD')
        duration=next((int(v) for k,v in headers.items() if k.lower()=='x-artifact-duration'),None)
        execution=receipt['producer']['execution'];elapsed=execution['endTime']-execution['startTime']
        if status!=200 or duration is None or abs(elapsed-duration)>1000:raise RuntimeError('Fresh CI upload duration was not retained')
        receipt['uploaded_duration_ms']=duration;receipt['payloads']=write_payloads(args.marker,'aws-ci')
        with reader_adapter() as api:
            status,_,_,_=request(seed['producer']['hash'],api=api)
            if status!=200:raise RuntimeError('Reader credential cannot read existing artifacts')
            denied_key=hashlib.sha256((args.marker+'denied').encode()).hexdigest()[:16]
            denied=request(denied_key,'PUT',b'reader-must-not-write',api=api)[0]
            absent=request(denied_key,'HEAD')[0]
            if 200<=denied<300 or absent!=404:raise RuntimeError('Reader credential wrote an artifact')
            receipt['reader_write_rejected']=True
        receipt['status']='success'
        if request(args.marker,'PUT',json.dumps(receipt).encode())[0]!=201:raise RuntimeError('CI receipt upload failed')
    else:
        status,body,_,_=request(args.marker)
        if status!=200:raise RuntimeError('CI receipt missing')
        ci=json.loads(body)
        if ci.get('mode')!='ci' or ci.get('status')!='success' or not ci.get('reader_write_rejected'):raise RuntimeError('CI credential proof incomplete')
        check_payloads(ci['payloads']);receipt['ci']=ci
        receipt['consumer']=task('lint:effect-imports-markdown','workstation-consumer','remote:r')
        row=receipt['consumer']
        if row['hash']!=ci['producer']['hash'] or not row['cache'].get('remote') or row['cache']['timeSaved']!=ci['uploaded_duration_ms']:raise RuntimeError('Workstation did not restore the fresh CI artifact')
    receipt['status']='success'
except Exception as error:
    receipt['status']='failed';receipt['failure']=str(error)
    raise
finally:
    path=OUT/(args.mode+'-proof.json');path.write_text(json.dumps(receipt,indent=2)+'\n');path.chmod(0o600)
print(json.dumps(receipt,indent=2))
