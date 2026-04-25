$ErrorActionPreference = 'Stop'

$taskName = 'PrincipalBrainSyncWatch-TPV'
$repoRoot = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $repoRoot 'artifacts\brain-sync-watch.pid'

if (Test-Path $pidFile) {
  $existingPid = Get-Content $pidFile -ErrorAction SilentlyContinue
  if ($existingPid) {
    $proc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    if ($proc) {
      Stop-Process -Id $existingPid -Force
    }
  }
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
Write-Output "Uninstalled: $taskName"
