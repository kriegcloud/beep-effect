# DataMoat protection check for Windows.
# Reads only small local state files. Never touches encrypted vault content.
# Exit codes: 0 = protecting now, 3 = installed but not running, 10 = not installed yet.

$ErrorActionPreference = 'SilentlyContinue'

$dmHome = if ($env:DATAMOAT_HOME) { $env:DATAMOAT_HOME } else { Join-Path $env:USERPROFILE '.datamoat' }
$healthFile = Join-Path $dmHome 'state/health.json'
$statusFile = Join-Path $dmHome 'state/status.json'
$bootstrapDir = Join-Path $dmHome 'bootstrap-capture'

Write-Output ''
Write-Output ("DataMoat protection check — " + (Get-Date))
Write-Output ''

if (-not (Test-Path $healthFile) -and -not (Test-Path (Join-Path $dmHome 'vault')) -and -not (Test-Path $bootstrapDir)) {
  Write-Output '  DataMoat is not protecting this machine yet.'
  Write-Output '  Your local ChatGPT, Claude, Codex, Cursor, DeepSeek, Qwen, and OpenClaw'
  Write-Output '  records are currently sitting unencrypted in their original folders.'
  Write-Output ''
  exit 10
}

$health = $null
if (Test-Path $healthFile) {
  $health = Get-Content $healthFile -Raw | ConvertFrom-Json
}

if ($health -and $health.version) {
  Write-Output ("  DataMoat v" + $health.version + " is installed.")
}

# Protection is reported as daemon.running before setup and as
# capture.running / daemon.captureRunning once setup is complete.
$daemonRunning = $false
$bootstrapOn = $false
if ($health -and $health.components) {
  if ($health.components.daemon) {
    $daemonRunning = [bool]$health.components.daemon.running -or [bool]$health.components.daemon.captureRunning
    $bootstrapOn = [bool]$health.components.daemon.bootstrapCapture
  }
  if (-not $daemonRunning -and $health.components.capture) {
    $daemonRunning = [bool]$health.components.capture.running
  }
}

if ($daemonRunning) {
  Write-Output '  Background protection is running right now.'
} else {
  Write-Output '  DataMoat is installed, but background protection is not running right now.'
}

if (Test-Path $statusFile) {
  $status = Get-Content $statusFile -Raw | ConvertFrom-Json
  Write-Output ''
  Write-Output '  Protected so far on this machine:'
  Write-Output ("    conversations protected: " + $status.totalSessions)
  if ($null -ne $status.totalMessages) {
    Write-Output ("    messages protected:      " + $status.totalMessages)
  }
  if ($status.bySource) {
    foreach ($prop in $status.bySource.PSObject.Properties) {
      $line = "      {0,-16} {1} conversations" -f $prop.Name, $prop.Value
      if ($status.messagesBySource -and $null -ne $status.messagesBySource.($prop.Name)) {
        $line += ", " + $status.messagesBySource.($prop.Name) + " messages"
      }
      Write-Output $line
    }
  }
  if ($status.lastTimestamp) {
    Write-Output ("    newest protected activity: " + $status.lastTimestamp)
  }
} elseif ((Test-Path $bootstrapDir) -and $bootstrapOn) {
  Write-Output ''
  Write-Output '  Setup is not finished yet, and DataMoat is already protecting work'
  Write-Output '  in the background.'
  $totalFiles = 0
  $details = @()
  Get-ChildItem $bootstrapDir -Directory | ForEach-Object {
    $count = (Get-ChildItem $_.FullName -File -Recurse | Measure-Object).Count
    $totalFiles += $count
    $details += ("      {0,-16} {1} conversation files" -f $_.Name, $count)
  }
  if ($totalFiles -gt 0) {
    Write-Output '  Encrypted conversation files captured so far:'
    $details | ForEach-Object { Write-Output $_ }
    Write-Output ("      {0,-16} {1} conversation files, already encrypted" -f 'total', $totalFiles)
  } else {
    Write-Output '  No-screen capture has started.'
  }
  Write-Output ''
  Write-Output '  Finish the quick setup in the DataMoat desktop app to browse them.'
} else {
  Write-Output ''
  Write-Output '  Detailed counts appear after DataMoat has been opened and unlocked once'
  Write-Output '  on this desktop.'
}

Write-Output ''
Write-Output '  To search, export, back up, analyze, or reuse this history, open the'
Write-Output '  encrypted DataMoat UI on this machine:'
$installedExe = $null
$appRoot = Join-Path $env:LOCALAPPDATA 'DataMoat/app'
if (Test-Path $appRoot) {
  $installedExe = Get-ChildItem -Path $appRoot -Filter 'DataMoat.exe' -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
}
if ($installedExe) {
  Write-Output ('    double-click: ' + $installedExe.FullName)
} else {
  Write-Output '    double-click DataMoat.exe in your DataMoat folder'
}
Write-Output ''

if ($daemonRunning) { exit 0 }
exit 3
