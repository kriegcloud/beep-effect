# Starts a loopback-only Codex app-server WebSocket listener on the Windows PC.
# Launched from SSH through a one-shot interactive scheduled task so it outlives the SSH session:
#   schtasks /create /tn CodexWsBridge /tr "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File %USERPROFILE%\.codex\remote-ws\start-ws.ps1" /sc once /sd 01/01/2000 /st 00:00 /it /f
#   schtasks /run /tn CodexWsBridge
# Replace <token-sha256-hex> with the digest of the token bytes exactly as the client sends them (no trailing
# newline), computed on the client host:
#   printf %s "$(cat ~/.config/beep/tom-pc-codex-ws.token)" | sha256sum | cut -d' ' -f1
# Generate the token newline-free in the first place: openssl rand -hex 32 | tr -d '\n' > <file>; chmod 600 <file>.
# A digest of a file with a trailing newline never matches and every connection gets HTTP 401.
# The token itself never touches this machine; only its digest does. Stop: Stop-Process on app-server.pid,
# then `schtasks /end /tn CodexWsBridge` and `schtasks /delete /tn CodexWsBridge /f`.
$ErrorActionPreference = 'Stop'
$dir = "$env:USERPROFILE\.codex\remote-ws"
$node = (Get-Command node).Source
$codexJs = "$env:APPDATA\npm\node_modules\@openai\codex\bin\codex.js"
$argList = @($codexJs, 'app-server', '--listen', 'ws://127.0.0.1:48123', '--ws-auth', 'capability-token', '--ws-token-sha256', '<token-sha256-hex>')
"start $(Get-Date -Format o) node=$node" | Add-Content "$dir\wrapper.log"
$p = Start-Process -FilePath $node -ArgumentList $argList -WorkingDirectory $env:USERPROFILE -WindowStyle Hidden -RedirectStandardOutput "$dir\app-server.stdout.log" -RedirectStandardError "$dir\app-server.stderr.log" -PassThru
$p.Id | Set-Content "$dir\app-server.pid"
$p.WaitForExit()
"exit $(Get-Date -Format o) code=$($p.ExitCode)" | Add-Content "$dir\wrapper.log"
