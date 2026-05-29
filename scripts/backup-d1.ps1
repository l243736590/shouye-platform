param(
  [string]$DatabaseName = "shouye-platform-db",
  [string]$BackupRoot = "E:\codex-workspaces_archive\shouye-d1-backups"
)

$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

$sqlPath = Join-Path $BackupRoot "$DatabaseName-$timestamp.sql"
$hashPath = "$sqlPath.sha256"
$zipPath = "$sqlPath.zip"

npx wrangler d1 export $DatabaseName --remote --output $sqlPath --skip-confirmation

$hash = Get-FileHash -Algorithm SHA256 -Path $sqlPath
$hash.Hash | Set-Content -Path $hashPath

Compress-Archive -Path $sqlPath, $hashPath -DestinationPath $zipPath

Write-Output "D1 backup created:"
Write-Output $sqlPath
Write-Output $hashPath
Write-Output $zipPath
