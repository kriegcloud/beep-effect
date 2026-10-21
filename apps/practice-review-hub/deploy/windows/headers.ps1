# Sample Claude Code headersHelper for the practice review hub (docs/runbooks/practice-review-hub.md, section 8).
# Prints the bearer header from a DPAPI (CurrentUser) file, and only for the hub URL it pins.
# Replace the REPLACE_ value first.
param([string]$BlobPath = (Join-Path $env:LOCALAPPDATA 'beep\practice-review-hub\api-token.dpapi'))
$ErrorActionPreference = 'Stop'
$expected = 'REPLACE_WITH_HUB_URL'
if ($env:CLAUDE_CODE_MCP_SERVER_URL -ne $expected) { [Console]::Error.WriteLine('practice-review-hub headers: unexpected server URL'); exit 2 }
try {
  Add-Type -AssemblyName System.Security
  $bytes = [Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($BlobPath), $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
  $token = [Text.Encoding]::ASCII.GetString($bytes)
} catch { [Console]::Error.WriteLine('practice-review-hub headers: cannot read the token'); exit 3 }
if ($token -notmatch '^[A-Za-z0-9._~+/=-]{32,256}$') { [Console]::Error.WriteLine('practice-review-hub headers: token has the wrong shape'); exit 4 }
[Console]::Out.Write('{"Authorization":"Bearer ' + $token + '"}')
