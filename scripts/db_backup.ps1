<#
.SYNOPSIS
    NAVIX Deterministic Database Backup Utility.
.DESCRIPTION
    Creates a compressed, custom-format PostgreSQL/PostGIS dump using pg_dump.
    Reads database credentials from environment or backend/.env.
    Applies configurable retention to maintain a clean backup history.
.PARAMETER OutputDir
    Directory where backup dump files will be written. Defaults to 'backups'.
.PARAMETER DatabaseName
    Target database to dump. Defaults to DB_NAME from environment or 'Navix'.
.PARAMETER RetentionCount
    Number of recent backups to keep. Defaults to 14.
.PARAMETER RetentionDays
    Maximum age in days of backups to keep. Defaults to 14.
.PARAMETER PgBinPath
    Optional path to PostgreSQL bin directory. Auto-detected if not specified.
#>

[CmdletBinding()]
param(
    [string]$OutputDir = "backups",
    [string]$DatabaseName = "",
    [int]$RetentionCount = 14,
    [int]$RetentionDays = 14,
    [string]$PgBinPath = ""
)

$ErrorActionPreference = "Stop"

# Helper function to find PostgreSQL binary
function Find-PgBinary([string]$BinaryName, [string]$ExplicitBinPath) {
    if ($ExplicitBinPath -and (Test-Path (Join-Path $ExplicitBinPath $BinaryName))) {
        return (Join-Path $ExplicitBinPath $BinaryName)
    }

    $cmd = Get-Command $BinaryName -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $candidates = @(
        "C:\Program Files\PostgreSQL\18\bin\$BinaryName",
        "C:\Program Files\PostgreSQL\17\bin\$BinaryName",
        "C:\Program Files\PostgreSQL\16\bin\$BinaryName",
        "C:\Program Files\PostgreSQL\15\bin\$BinaryName"
    )

    foreach ($path in $candidates) {
        if (Test-Path $path) {
            return $path
        }
    }

    throw "PostgreSQL binary '$BinaryName' could not be found. Please install PostgreSQL or specify -PgBinPath."
}

# Resolve backend directory and load backend/.env if environment variables not pre-set
$RepoRoot = (Get-Item $PSScriptRoot).Parent.FullName
$BackendEnvPath = Join-Path $RepoRoot "backend\.env"

if (Test-Path $BackendEnvPath) {
    Get-Content $BackendEnvPath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $k = $parts[0].Trim()
            $v = $parts[1].Trim()
            if (-not [System.Environment]::GetEnvironmentVariable($k)) {
                [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
            }
        }
    }
}

# Read DB Configuration from Environment
$DbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5433" }
$DbUser = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { $env:PGPASSWORD }
$TargetDb = if ($DatabaseName) { $DatabaseName } elseif ($env:DB_NAME) { $env:DB_NAME } else { "Navix" }

# Locate pg_dump
$PgDumpExe = Find-PgBinary "pg_dump.exe" $PgBinPath

# Ensure Output Directory exists
$AbsoluteOutputDir = Join-Path $RepoRoot $OutputDir
if (-not (Test-Path $AbsoluteOutputDir)) {
    New-Item -ItemType Directory -Path $AbsoluteOutputDir -Force | Out-Null
}

# Generate Timestamped Backup Filename
$Timestamp = (Get-Date).ToString("yyyy-MM-dd_HHmmss")
$BackupFileName = "${TargetDb}_${Timestamp}.dump"
$BackupFilePath = Join-Path $AbsoluteOutputDir $BackupFileName

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  NAVIX Database Backup Engine" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Target Database : $TargetDb"
Write-Host "Host & Port     : ${DbHost}:${DbPort}"
Write-Host "User            : $DbUser"
Write-Host "pg_dump binary  : $PgDumpExe"
Write-Host "Output File     : $BackupFilePath"
Write-Host "Starting backup operation at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')..." -ForegroundColor Yellow

$Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

# Execute pg_dump with custom compressed format (-Fc)
# Using PGPASSWORD environment variable to avoid credential logging or CLI exposure
$env:PGPASSWORD = $DbPassword

try {
    $pgDumpArgs = @(
        "-h", $DbHost,
        "-p", $DbPort,
        "-U", $DbUser,
        "-F", "c",
        "-b",
        "-v",
        "-f", $BackupFilePath,
        $TargetDb
    )

    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $PgDumpExe
    $processInfo.Arguments = ($pgDumpArgs -join " ")
    $processInfo.RedirectStandardError = $true
    $processInfo.RedirectStandardOutput = $false
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true

    $process = [System.Diagnostics.Process]::Start($processInfo)
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    $Stopwatch.Stop()

    if ($process.ExitCode -ne 0) {
        Write-Error "pg_dump failed with exit code $($process.ExitCode):`n$stderr"
        exit $process.ExitCode
    }

    if (-not (Test-Path $BackupFilePath)) {
        Write-Error "Backup file was not created: $BackupFilePath"
        exit 1
    }

    $fileSize = (Get-Item $BackupFilePath).Length
    $fileSizeMB = [Math]::Round($fileSize / 1MB, 2)

    Write-Host "[SUCCESS] Backup completed successfully in $($Stopwatch.Elapsed.TotalSeconds.ToString('F2'))s" -ForegroundColor Green
    Write-Host "Backup Size : $fileSize bytes ($fileSizeMB MB)" -ForegroundColor Green
    Write-Host "Artifact    : $BackupFilePath" -ForegroundColor Green

    # Enforce Retention Policy
    Write-Host "`nEvaluating backup retention policy..." -ForegroundColor Gray
    $allDumps = Get-ChildItem -Path $AbsoluteOutputDir -Filter "${TargetDb}_*.dump" | Sort-Object CreationTime -Descending

    $deletedCount = 0
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)

    for ($i = 0; $i -lt $allDumps.Count; $i++) {
        $dump = $allDumps[$i]
        $isBeyondCount = ($i -ge $RetentionCount)
        $isBeyondDays = ($dump.CreationTime -lt $cutoffDate)

        if ($isBeyondCount -or $isBeyondDays) {
            Write-Host "  Purging expired backup: $($dump.Name) (Created: $($dump.CreationTime))" -ForegroundColor DarkGray
            Remove-Item $dump.FullName -Force
            $deletedCount++
        }
    }

    Write-Host "Retention complete. Retained $($allDumps.Count - $deletedCount) backups (Purged: $deletedCount)." -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
    exit 0

} catch {
    Write-Error "Backup encountered an unhandled exception: $_"
    exit 1
} finally {
    # Clear process memory for password
    $env:PGPASSWORD = $null
}
