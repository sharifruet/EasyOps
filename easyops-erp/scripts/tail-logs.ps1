# EasyOps ERP - Tail and display log files
# Displays log output from all Spring Boot services in real-time with color coding

$ErrorActionPreference = "Continue"

# Resolve repository root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir "..")
$LogDir = Join-Path $RootDir "logs\local-services"

param(
    [string[]]$Services = @(),  # If empty, tail all log files
    [switch]$Follow = $true     # Follow/tail mode (default: true)
)

Write-Host "[TAIL] Tailing log files from: $LogDir" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $LogDir)) {
    Write-Host "[ERROR] Log directory does not exist: $LogDir" -ForegroundColor Red
    exit 1
}

# Get log files to tail
if ($Services.Count -eq 0) {
    $logFiles = Get-ChildItem -Path $LogDir -Filter "*.log" -ErrorAction SilentlyContinue | Sort-Object Name
} else {
    $logFiles = @()
    foreach ($service in $Services) {
        $logFile = Join-Path $LogDir "$service.log"
        if (Test-Path $logFile) {
            $logFiles += Get-Item $logFile
        } else {
            Write-Host "[WARN] Log file not found: $logFile" -ForegroundColor Yellow
        }
    }
}

if ($logFiles.Count -eq 0) {
    Write-Host "[INFO] No log files found to tail." -ForegroundColor Yellow
    exit 0
}

Write-Host "Tailing $($logFiles.Count) log file(s). Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host ""

# Function to colorize log lines
function Write-ColoredLine {
    param(
        [string]$ServiceName,
        [string]$Line
    )
    
    $color = 'Gray'
    if ($Line -match 'ERROR|Exception|Failed|FATAL|Error') { 
        $color = 'Red' 
    }
    elseif ($Line -match 'WARN|Warning') { 
        $color = 'Yellow' 
    }
    elseif ($Line -match 'INFO|Started|Tomcat started|Netty started|JVM running') { 
        $color = 'Green' 
    }
    elseif ($Line -match 'DEBUG') {
        $color = 'DarkGray'
    }
    
    Write-Host "[$ServiceName] " -NoNewline -ForegroundColor Cyan
    Write-Host $Line -ForegroundColor $color
}

# Tail log files
$filePositions = @{}
foreach ($file in $logFiles) {
    $filePositions[$file.FullName] = 0
}

try {
    while ($true) {
        $anyUpdates = $false
        
        foreach ($file in $logFiles) {
            $filePath = $file.FullName
            $serviceName = $file.BaseName
            
            if (Test-Path $filePath) {
                try {
                    $currentFile = Get-Item $filePath -ErrorAction Stop
                    $currentSize = $currentFile.Length
                    $lastPosition = $filePositions[$filePath]
                    
                    if ($currentSize -gt $lastPosition) {
                        $stream = [System.IO.File]::OpenRead($filePath)
                        $stream.Position = $lastPosition
                        $reader = New-Object System.IO.StreamReader($stream)
                        
                        while ($null -ne ($line = $reader.ReadLine())) {
                            Write-ColoredLine -ServiceName $serviceName -Line $line
                            $anyUpdates = $true
                        }
                        
                        $filePositions[$filePath] = $stream.Position
                        $reader.Close()
                        $stream.Close()
                    }
                } catch {
                    # File might be locked or deleted, skip
                }
            }
        }
        
        if (-not $anyUpdates) {
            Start-Sleep -Milliseconds 500
        }
    }
} catch {
    Write-Host ""
    Write-Host "[STOP] Stopped tailing logs." -ForegroundColor Yellow
}

