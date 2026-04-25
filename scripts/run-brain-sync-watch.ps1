$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $repoRoot 'artifacts\brain-sync-watch.pid'
$stdoutLog = Join-Path $repoRoot 'artifacts\brain-sync-watch.stdout.log'
$stderrLog = Join-Path $repoRoot 'artifacts\brain-sync-watch.stderr.log'

New-Item -ItemType Directory -Force -Path (Join-Path $repoRoot 'artifacts') | Out-Null

if (Test-Path $pidFile) {
  $existingPid = Get-Content $pidFile -ErrorAction SilentlyContinue
  if ($existingPid) {
    $proc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    if ($proc) {
      Write-Output "Watcher already running: $existingPid"
      exit 0
    }
  }
}

$node = (Get-Command node.exe).Source
$process = Start-Process -FilePath $node `
  -ArgumentList 'scripts/watch-principal-brain-sync.mjs' `
  -WorkingDirectory $repoRoot `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog `
  -WindowStyle Hidden `
  -PassThru

Set-Content -Path $pidFile -Value $process.Id
Write-Output "Watcher started: $($process.Id)"
