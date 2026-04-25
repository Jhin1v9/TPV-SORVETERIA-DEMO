$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$taskName = 'PrincipalBrainSyncWatch-TPV'
$runner = Join-Path $PSScriptRoot 'run-brain-sync-watch.ps1'
$powerShell = (Get-Command powershell.exe).Source

$action = New-ScheduledTaskAction -Execute $powerShell -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runner`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -StartWhenAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description 'Continuous principal brain sync watcher for TPV project' -Force | Out-Null

Start-Process -FilePath $powerShell -ArgumentList "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runner`"" -WorkingDirectory $repoRoot -WindowStyle Hidden

Write-Output "Installed and started: $taskName"
