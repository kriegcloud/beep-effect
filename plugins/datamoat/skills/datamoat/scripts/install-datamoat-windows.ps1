# Install pinned DataMoat on Windows from the official download service,
# then start pre-setup no-screen protection.
# Exit codes: 0 = installed and protecting, 3 = installed (one click left),
#             4 = use the official site.

$ErrorActionPreference = 'Stop'
$OfficialSite = 'https://datamoat.org'
$PinnedVersion = '2.0.14'
$PinnedArtifacts = @{
  'windows-x64' = @{
    filename = 'DataMoat-2.0.14-win32-x64.zip'
    url = 'https://downloads.datamoat.org/releases/v2.0.14/DataMoat-2.0.14-win32-x64.zip'
    sha256 = '170552a5b9b2417208e47efa71a8855d4e659ece7e96ce35d81f8bb16dea5110'
    githubFallbackUrl = 'https://github.com/max-ng/datamoat/releases/download/v2.0.14/DataMoat-2.0.14-win32-x64.zip'
  }
  'windows-arm64' = @{
    filename = 'DataMoat-2.0.14-win32-arm64.zip'
    url = 'https://downloads.datamoat.org/releases/v2.0.14/DataMoat-2.0.14-win32-arm64.zip'
    sha256 = 'e1212d7c4db36e704a526c13caf7ecb77a42cec01bdc326f3ab9868028ed7339'
    githubFallbackUrl = 'https://github.com/max-ng/datamoat/releases/download/v2.0.14/DataMoat-2.0.14-win32-arm64.zip'
  }
}

function Gentle-SiteExit {
  Write-Output ''
  Write-Output 'Use the download from the official DataMoat site.'
  Write-Output ("Please visit " + $OfficialSite + " to get the right package - it only takes a moment.")
  exit 4
}

try {
  $archKey = switch ($env:PROCESSOR_ARCHITECTURE) {
    'ARM64' { 'windows-arm64' }
    'AMD64' { 'windows-x64' }
    default { $null }
  }
  if (-not $archKey) { Gentle-SiteExit }

  $artifact = $PinnedArtifacts[$archKey]
  if (-not $artifact) { Gentle-SiteExit }
  $version = $PinnedVersion

  $zipPath = Join-Path $env:TEMP $artifact['filename']
  Write-Output ("Downloading DataMoat " + $version + " for Windows (" + $archKey + ")...")
  $downloaded = $false
  try {
    Invoke-WebRequest -Uri $artifact['url'] -OutFile $zipPath -TimeoutSec 600
    $downloaded = $true
  } catch {
    if ($artifact['githubFallbackUrl']) {
      Invoke-WebRequest -Uri $artifact['githubFallbackUrl'] -OutFile $zipPath -TimeoutSec 600
      $downloaded = $true
    }
  }
  if (-not $downloaded) { Gentle-SiteExit }

  $actual = (Get-FileHash -Path $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $artifact['sha256'].ToLowerInvariant()) { Gentle-SiteExit }
  Write-Output 'Download verified (SHA-256 match).'

  $installRoot = Join-Path $env:LOCALAPPDATA 'DataMoat/app'
  $installDir = Join-Path $installRoot ([System.IO.Path]::GetFileNameWithoutExtension($artifact['filename']))
  if (Test-Path $installDir) { Remove-Item $installDir -Recurse -Force }
  New-Item -ItemType Directory -Path $installDir -Force | Out-Null
  Write-Output 'Unpacking DataMoat...'
  Expand-Archive -Path $zipPath -DestinationPath $installDir -Force
  Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

  $exe = Get-ChildItem -Path $installDir -Filter 'DataMoat.exe' -Recurse | Select-Object -First 1
  if (-not $exe) { Gentle-SiteExit }
  $exePath = $exe.FullName

  $stateDir = Join-Path $env:USERPROFILE '.datamoat/state'
  New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
  @{
    schemaVersion = 1
    mode = 'packaged'
    installSource = 'skill'
    updateSource = 'skill'
    packagedAppPath = $exePath
    installedAt = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
  } | ConvertTo-Json | Set-Content -Path (Join-Path $stateDir 'install-source.json') -Encoding UTF8

  Write-Output 'Starting background protection (no screen needed)...'
  $launched = $true
  try {
    Start-Process -FilePath $exePath -ArgumentList '--datamoat-remote-no-screen' | Out-Null
  } catch {
    # Some sessions keep app launches for the person at the desk. Hand over one click.
    $launched = $false
  }

  $bootstrapFile = Join-Path $env:USERPROFILE '.datamoat/state/bootstrap-capture.json'
  $healthFile = Join-Path $env:USERPROFILE '.datamoat/state/health.json'
  for ($i = 0; $launched -and $i -lt 60; $i++) {
    Start-Sleep -Seconds 1
    if ((Test-Path $bootstrapFile) -and (Test-Path $healthFile)) {
      $health = Get-Content $healthFile -Raw -ErrorAction SilentlyContinue
      if ($health -match '"bootstrapCapture":\s*true') {
        Write-Output ''
        Write-Output ("DataMoat " + $version + " is installed and already protecting this PC.")
        Write-Output 'It is quietly encrypting your local ChatGPT, Claude, Codex, Cursor,'
        Write-Output 'DeepSeek, Qwen, and OpenClaw conversation records in the background.'
        Write-Output ''
        Write-Output 'One small step is saved for you: open DataMoat on this desktop to set'
        Write-Output 'your password and recovery kit in the local app. For your security,'
        Write-Output 'that part never happens inside a chat.'
        Write-Output ('App location: ' + $exePath)
        exit 0
      }
    }
  }

  # Windows may keep app launches for the person at the desk. Hand over one click.
  Write-Output ''
  Write-Output ("DataMoat " + $version + " is ready at: " + $exePath)
  Write-Output 'To begin protection, double-click DataMoat.exe there once - it takes seconds.'
  Write-Output 'For your security, password and recovery setup happen in the local app, not in chat.'
  exit 3
} catch {
  Gentle-SiteExit
}
