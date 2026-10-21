#!/usr/bin/env bash
# Real-process lifecycle and cache-only enrollment/rollback checks. No cloud access.
set -euo pipefail
set +x
root="$(cd "$(dirname "$0")" && pwd)"
"$root/adapter.sh" install
python3 - "$root" <<'PY'
import json,os,pathlib,shutil,socket,subprocess,sys,tempfile,time
source=pathlib.Path(sys.argv[1]);parent=pathlib.Path.home()/'.cache/beep/r2-cache-check';parent.mkdir(parents=True,exist_ok=True)
def run(args,env,ok=True):
    p=subprocess.run(args,env=env,capture_output=True,text=True,timeout=30)
    if ok and p.returncode:raise AssertionError('Subprocess failed: '+pathlib.Path(args[0]).name)
    return p
with tempfile.TemporaryDirectory(dir=parent) as directory:
    base=pathlib.Path(directory);config=base/'config';state=base/'state';checkout=base/'checkout';checkout.mkdir()
    env={**os.environ,'XDG_CONFIG_HOME':str(config),'XDG_STATE_HOME':str(state)}
    run(['git','init','-q',str(checkout)],env)
    cfg=config/'beep/r2-cache';cfg.mkdir(parents=True)
    (cfg/'workstation.env').write_text('TURBO_TOKEN=op://fixture/item/bearer\nTURBO_TEAM=fixture\nR2_ADAPTER_PORT=9427\n')
    original='UNRELATED=fixture\nTURBO_API=https://original.invalid\nTURBO_TOKEN=op://fixture/item/old\nTURBO_TEAM=fixture\nTURBO_CACHE=local:rw,remote:r\n'
    dotenv=checkout/'.env';dotenv.write_text(original)
    run([str(source/'workstation.sh'),'enable',str(checkout)],env)
    enrolled=dotenv.read_text();assert 'BEEP_TURBO_TRUSTED_WRITER=true' in enrolled
    receipt=next((state/'beep/r2-cache').glob('enrollment-*.json'))
    saved=json.loads(receipt.read_text());assert 'UNRELATED' not in saved['before']
    dotenv.write_text(enrolled+'LATER_EDIT=retained\n')
    run([str(source/'workstation.sh'),'rollback',str(checkout)],env)
    assert dotenv.read_text()==original+'LATER_EDIT=retained\n'
    dotenv.write_text(original+'TURBO_CACHE=local:rw\n')
    assert run([str(source/'workstation.sh'),'enable',str(checkout)],env,False).returncode!=0
    dotenv.write_text(original+'export TURBO_TOKEN=op://fixture/item/duplicate\n')
    assert run([str(source/'workstation.sh'),'enable',str(checkout)],env,False).returncode!=0
    dotenv.write_text(original.replace('op://fixture/item/old','fixture-raw-token'))
    assert run([str(source/'workstation.sh'),'enable',str(checkout)],env,False).returncode!=0
    # A failed CI bootstrap leaves the AWS environment file untouched.
    jobenv=base/'github.env';jobenv.write_text('ORIGINAL_CACHE=retained\n')
    ci={**os.environ,'GITHUB_ENV':str(jobenv),'RUNNER_TEMP':str(base)}
    run([str(source/'adapter.sh'),'start-ci'],ci)
    assert jobenv.read_text()=='ORIGINAL_CACHE=retained\n'
    with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
    # Inert credentials: health and lifecycle checks do not call R2.
    ci.update({'R2_ENDPOINT':'https://'+'0'*32+'.r2.cloudflarestorage.com','R2_BUCKET':'fixture','R2_ACCESS_KEY_ID':'fixture','R2_SECRET_ACCESS_KEY':'fixture','TURBO_TEAM':'fixture','R2_ADAPTER_PORT':str(port),'OP_FIXTURE_SECRET':'fixture','APPLICATION_FIXTURE_SECRET':'fixture','RUNNER_TRACKING_ID':'fixture-runner'})
    fakebin=base/'fakebin';fakebin.mkdir();curl=fakebin/'curl'
    curl.write_text('#!/bin/sh\nexit 1\n');curl.chmod(0o700)
    failed_env={**ci,'PATH':str(fakebin)+os.pathsep+ci['PATH'],'XDG_CACHE_HOME':str(base/'empty-cache')}
    run([str(source/'adapter.sh'),'start-ci'],failed_env)
    assert jobenv.read_text()=='ORIGINAL_CACHE=retained\n'
    pid=None
    try:
        run([str(source/'adapter.sh'),'start-ci'],ci)
        pid=int((base/'beep-r2-adapter.pid').read_text())
        names={row.split(b'=',1)[0].decode() for row in pathlib.Path('/proc',str(pid),'environ').read_bytes().split(b'\0') if row}
        assert 'OP_FIXTURE_SECRET' not in names and 'APPLICATION_FIXTURE_SECRET' not in names
        assert 'S3_SECRET_KEY' in names and 'RUNNER_TRACKING_ID' in names
        assert 'TURBO_API=http://127.0.0.1:'+str(port) in jobenv.read_text()
        run([str(source/'adapter.sh'),'stop-ci'],ci)
        for _ in range(50):
            try:actual=pathlib.Path('/proc',str(pid),'exe').resolve(strict=True)
            except (FileNotFoundError,PermissionError):break
            time.sleep(.1)
        else:raise AssertionError('Adapter process remained after cleanup')
    finally:
        if pid:
            try:os.kill(pid,15)
            except ProcessLookupError:pass
print('PASS: enrollment, rollback preservation, duplicate/raw-token refusal, CI fallback, secret isolation, runner tracking and exact-process cleanup.')
PY
