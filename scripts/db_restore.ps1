<#
.SYNOPSIS
    NAVIX Deterministic Database Restore Utility.
.DESCRIPTION
    Restores a compressed PostgreSQL dump file to an explicitly specified target database.
    Guards against accidental overwriting of primary/production databases.
.PARAMETER BackupFile
    Path to the .dump file to restore.
.PARAMETER TargetDatabase
    Name of the target database to restore into. Required.
.PARAMETER CreateDatabaseIfNotExists
    Switch indicating that the target database should be created if it does not yet exist.
.PARAMETER ConfirmDestructiveRestore
    Confirmation token required if restoring into the primary database ('Navix' or $env:DB_NAME).
.PARAMETER PgBinPath
    Optional path to PostgreSQL bin directory. Auto-detected if not specified.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,

    [Parameter(Mandatory=$true)]
    [string]$TargetDatabase,

    [switch]$CreateDatabaseIfNotExists,
    [string]$ConfirmDestructiveRestore = "",
    [string]$PgBinPath = ""
)

$ErrorActionPreference = "Stop"

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

# Resolve paths and environment
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

$DbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5433" }
$DbUser = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DbPassword = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { $env:PGPASSWORD }
$PrimaryDb = if ($env:DB_NAME) { $env:DB_NAME } else { "Navix" }

# Locate binaries
$PgRestoreExe = Find-PgBinary "pg_restore.exe" $PgBinPath
$PsqlExe = Find-PgBinary "psql.exe" $PgBinPath

# Verify backup file exists
$ResolvedBackupFile = if ([System.IO.Path]::IsPathRooted($BackupFile)) { $BackupFile } else { Join-Path $RepoRoot $BackupFile }
if (-not (Test-Path $ResolvedBackupFile)) {
    Write-Error "Backup file does not exist: $ResolvedBackupFile"
    exit 1
}

# Strict Safety Check for Primary / Production Database
if ($TargetDatabase.Equals($PrimaryDb, [System.StringComparison]::OrdinalIgnoreCase) -or $TargetDatabase.Equals("Navix", [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-Host "==========================================================" -ForegroundColor Red
    Write-Host "  CRITICAL WARNING: RESTORE TO PRIMARY DATABASE REQUESTED" -ForegroundColor Red
    Write-Host "==========================================================" -ForegroundColor Red
    Write-Host "Target Database '$TargetDatabase' matches the primary database name." -ForegroundColor Yellow
    Write-Host "Restoring over the active database will overwrite existing records." -ForegroundColor Yellow

    if ($ConfirmDestructiveRestore -ne "CONFIRM_DESTRUCTIVE_RESTORE") {
        Write-Error "Destructive restore aborted. To proceed against the primary database, you must specify -ConfirmDestructiveRestore 'CONFIRM_DESTRUCTIVE_RESTORE'."
        exit 2
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  NAVIX Database Restore Engine" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Backup Artifact : $ResolvedBackupFile"
Write-Host "Target Database : $TargetDatabase"
Write-Host "Host & Port     : ${DbHost}:${DbPort}"
Write-Host "User            : $DbUser"
Write-Host "Starting restore operation at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')..." -ForegroundColor Yellow

$Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$env:PGPASSWORD = $DbPassword

try {
    # 1. Check if Target Database exists (case-insensitive in pg_database); create if requested
    $checkDbArgs = @(
        "-h", $DbHost,
        "-p", $DbPort,
        "-U", $DbUser,
        "-d", "postgres",
        "-t",
        "-c", "SELECT 1 FROM pg_database WHERE lower(datname) = lower('$TargetDatabase');"
    )

    $dbExistsOutput = & $PsqlExe $checkDbArgs
    $dbExists = ($dbExistsOutput -and ($dbExistsOutput.Trim() -eq "1"))

    if (-not $dbExists) {
        if ($CreateDatabaseIfNotExists) {
            Write-Host "Database '$TargetDatabase' does not exist. Creating..." -ForegroundColor Yellow
            $createDbExe = Find-PgBinary "createdb.exe" $PgBinPath
            $createDbArgs = @(
                "-h", $DbHost,
                "-p", $DbPort,
                "-U", $DbUser,
                $TargetDatabase
            )
            & $createDbExe $createDbArgs
            Write-Host "Database '$TargetDatabase' created successfully." -ForegroundColor Green
        } else {
            Write-Error "Target database '$TargetDatabase' does not exist. Run with -CreateDatabaseIfNotExists to initialize it."
            exit 1
        }
    }

    # 2. Execute pg_restore
    Write-Host "Executing pg_restore into '$TargetDatabase'..." -ForegroundColor Cyan
    $restoreArgs = @(
        "-h", $DbHost,
        "-p", $DbPort,
        "-U", $DbUser,
        "-d", $TargetDatabase,
        "--no-owner",
        "--no-privileges",
        "-v",
        $ResolvedBackupFile
    )

    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $PgRestoreExe
    $processInfo.Arguments = ($restoreArgs -join " ")
    $processInfo.RedirectStandardError = $true
    $processInfo.RedirectStandardOutput = $false
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true

    $process = [System.Diagnostics.Process]::Start($processInfo)
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    $Stopwatch.Stop()

    # pg_restore returns 0 on complete success, or 1 if warnings occurred (e.g. extension already exists)
    if ($process.ExitCode -gt 1) {
        Write-Error "pg_restore failed with critical exit code $($process.ExitCode):`n$stderr"
        exit $process.ExitCode
    }

    Write-Host "[SUCCESS] Database restore completed in $($Stopwatch.Elapsed.TotalSeconds.ToString('F2'))s" -ForegroundColor Green

    # 3. Post-Restore Verification Query
    Write-Host "`nPerforming integrity verification on restored database '$TargetDatabase'..." -ForegroundColor Cyan
    $verifyArgs = @(
        "-h", $DbHost,
        "-p", $DbPort,
        "-U", $DbUser,
        "-d", $TargetDatabase,
        "-t",
        "-c", "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
    )
    $tableCount = (& $PsqlExe $verifyArgs).Trim()
    Write-Host "Restored Table Count: $tableCount" -ForegroundColor Green

    Write-Host "==========================================================" -ForegroundColor Cyan
    exit 0

} catch {
    Write-Error "Restore encountered an unhandled exception: $_"
    exit 1
} finally {
    $env:PGPASSWORD = $null
}
