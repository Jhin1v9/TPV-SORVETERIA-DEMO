$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$documentsRoot = [Environment]::GetFolderPath('MyDocuments')
$finalRoot = Join-Path $documentsRoot 'Auris-BugDetector-Final'
$artifactsRoot = Join-Path $repoRoot 'artifacts'

$latestDemo = Get-ChildItem -Path $artifactsRoot -Directory -Filter 'bug-detector-live-demo-*' |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $latestDemo) {
  throw 'Nenhuma demo encontrada em artifacts/bug-detector-live-demo-*'
}

# Mantem apenas a demo mais recente no repo
Get-ChildItem -Path $artifactsRoot -Directory -Filter 'bug-detector-live-demo-*' |
  Where-Object { $_.FullName -ne $latestDemo.FullName } |
  Remove-Item -Recurse -Force

# Recria a pasta canonica em Documentos
if (Test-Path $finalRoot) {
  Get-ChildItem -Path $finalRoot -Force | Remove-Item -Recurse -Force
} else {
  New-Item -ItemType Directory -Path $finalRoot | Out-Null
}

$sourceDir = Join-Path $finalRoot 'source'
$demoDir = Join-Path $finalRoot 'demo'
$notesDir = Join-Path $finalRoot 'notes'

New-Item -ItemType Directory -Path $sourceDir | Out-Null
New-Item -ItemType Directory -Path $demoDir | Out-Null
New-Item -ItemType Directory -Path $notesDir | Out-Null

Copy-Item -Path (Join-Path $repoRoot 'packages\shared\src\components\BugDetectorProvider.tsx') -Destination $sourceDir
Copy-Item -Path (Join-Path $repoRoot 'scripts\demo-bug-detector-live.mjs') -Destination $sourceDir
Copy-Item -Path $latestDemo.FullName -Destination $demoDir -Recurse

$copiedDemoDir = Join-Path $demoDir $latestDemo.Name
$readmePath = Join-Path $finalRoot 'README.md'
$syncNotePath = Join-Path $notesDir 'sync-notes.md'

$readme = @"
# Auris BugDetector Final

Esta e a pasta canonica da versao final do bug detector.

- Atualizado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
- Projeto origem: $repoRoot
- Demo mais recente: $($latestDemo.Name)

## Conteudo

- `source/BugDetectorProvider.tsx`: wrapper final em uso no projeto
- `source/demo-bug-detector-live.mjs`: script da demonstracao real
- `demo/$($latestDemo.Name)`: artefatos mais recentes da demonstracao
- `notes/sync-notes.md`: observacoes de sincronizacao

## Regra

Sempre que houver mudanca no bug detector:
1. atualizar no repo
2. rodar `powershell -ExecutionPolicy Bypass -File scripts/sync-bug-detector-final.ps1`
3. manter apenas esta pasta em Documentos como referencia final
"@

$syncNotes = @"
# Sync Notes

- Este script limpa demos antigas em `artifacts/bug-detector-live-demo-*` e mantem apenas a mais recente.
- Esta pasta em Documentos e recriada a cada sincronizacao.
- Se precisar guardar historico, isso deve ir para outra pasta explicitamente, nao aqui.

## Ultima sincronizacao

- Demo usada: $($latestDemo.FullName)
- Copiada para: $copiedDemoDir
"@

Set-Content -Path $readmePath -Value $readme -Encoding UTF8
Set-Content -Path $syncNotePath -Value $syncNotes -Encoding UTF8

Write-Host "Sincronizado para: $finalRoot"
Write-Host "Demo mantida no repo: $($latestDemo.FullName)"
