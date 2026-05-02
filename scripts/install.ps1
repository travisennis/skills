$ErrorActionPreference = "Stop"

$RepoDir = Join-Path $PSScriptRoot ".." | Resolve-Path

function Resolve-UserPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $trimmed = $Path.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed)) {
        return $null
    }

    if ($trimmed -eq "~") {
        return $HOME
    }

    if ($trimmed.StartsWith("~/") -or $trimmed.StartsWith("~\")) {
        $suffix = $trimmed.Substring(2).TrimStart(@('\', '/'))
        if ([string]::IsNullOrWhiteSpace($suffix)) {
            return $HOME
        }

        return Join-Path $HOME $suffix
    }

    return $trimmed
}

$skillFiles = Get-ChildItem -Path $RepoDir -Filter "SKILL.md" -Recurse -Depth 2 |
    Where-Object { $_.FullName -notlike "*\.git\*" -and $_.FullName -notlike "*\scripts\*" } |
    Sort-Object FullName

$skillDirs = $skillFiles | ForEach-Object { $_.Directory }

if ($skillDirs.Count -eq 0) {
    Write-Host "No skills found in $RepoDir"
    exit 1
}

Write-Host "Available skills:"
for ($i = 0; $i -lt $skillDirs.Count; $i++) {
    Write-Host "  $($i + 1). $($skillDirs[$i].Name)"
}
Write-Host ""
$selection = Read-Host "Which skills to install? (comma-separated numbers or 'all') [all]"
if ([string]::IsNullOrWhiteSpace($selection)) { $selection = "all" }

$selected = @()
if ($selection -eq "all") {
    $selected = $skillDirs | ForEach-Object { $_.Name }
} else {
    $indices = $selection -split "," | ForEach-Object { $_.Trim() }
    foreach ($idx in $indices) {
        if ($idx -match '^\d+$') {
            $num = [int]$idx
            if ($num -ge 1 -and $num -le $skillDirs.Count) {
                $selected += $skillDirs[$num - 1].Name
            } else {
                Write-Host "Warning: Ignoring invalid selection '$idx'"
            }
        } else {
            Write-Host "Warning: Ignoring invalid selection '$idx'"
        }
    }
}

if ($selected.Count -eq 0) {
    Write-Host "No valid skills selected. Exiting."
    exit 1
}

Write-Host ""
Write-Host "Install destination:"
Write-Host "  1. Project (.agents standard)  (.\.agents\skills)"
Write-Host "  2. Global  (.agents standard)  (~\.agents\skills)"
Write-Host "  3. Cursor project             (.\.cursor\skills)"
Write-Host "  4. Cursor global              (~\.cursor\skills)"
Write-Host "  5. Claude project             (.\.claude\skills)"
Write-Host "  6. Claude global              (~\.claude\skills)"
Write-Host "  7. Copilot project            (.\.github\skills)"
Write-Host "  8. Copilot global             (~\.copilot\skills)"
Write-Host "  9. Custom path"
$destChoice = Read-Host "Choose destination [1]"
if ([string]::IsNullOrWhiteSpace($destChoice)) { $destChoice = "1" }
$destChoice = $destChoice.Trim()

switch ($destChoice) {
    "2" {
        $Dest = Join-Path (Join-Path $HOME ".agents") "skills"
        $destLabel = "global (~\.agents\skills)"
    }
    "3" {
        $Dest = Join-Path (Join-Path "." ".cursor") "skills"
        $destLabel = "cursor project (.\.cursor\skills)"
    }
    "4" {
        $Dest = Join-Path (Join-Path $HOME ".cursor") "skills"
        $destLabel = "cursor global (~\.cursor\skills)"
    }
    "5" {
        $Dest = Join-Path (Join-Path "." ".claude") "skills"
        $destLabel = "claude project (.\.claude\skills)"
    }
    "6" {
        $Dest = Join-Path (Join-Path $HOME ".claude") "skills"
        $destLabel = "claude global (~\.claude\skills)"
    }
    "7" {
        $Dest = Join-Path (Join-Path "." ".github") "skills"
        $destLabel = "copilot project (.\.github\skills)"
    }
    "8" {
        $Dest = Join-Path (Join-Path $HOME ".copilot") "skills"
        $destLabel = "copilot global (~\.copilot\skills)"
    }
    "9" {
        do {
            $customDest = Read-Host "Enter custom destination path"
            $Dest = Resolve-UserPath -Path $customDest
            if ([string]::IsNullOrWhiteSpace($Dest)) {
                Write-Host "Custom destination cannot be empty."
            }
        } while ([string]::IsNullOrWhiteSpace($Dest))

        $destLabel = "custom ($Dest)"
    }
    "1" {
        $Dest = Join-Path (Join-Path "." ".agents") "skills"
        $destLabel = "project (.\.agents\skills)"
    }
    default {
        Write-Host "Warning: Unknown destination '$destChoice', defaulting to project (.\.agents\skills)"
        $Dest = Join-Path (Join-Path "." ".agents") "skills"
        $destLabel = "project (.\.agents\skills)"
    }
}

if (-not (Test-Path $Dest)) {
    New-Item -ItemType Directory -Path $Dest -Force | Out-Null
}

$installed = @()
$skipped = @()
$replaced = @()

foreach ($skill in $selected) {
    $destSkillPath = Join-Path $Dest $skill
    $sourceSkillPath = Join-Path (Join-Path $RepoDir "skills") $skill

    if (Test-Path $destSkillPath) {
        $conflictChoice = Read-Host "'$skill' already exists at destination. [S]kip or [R]eplace? [S]"
        if ([string]::IsNullOrWhiteSpace($conflictChoice)) { $conflictChoice = "S" }

        switch ($conflictChoice.ToUpper()) {
            "R" {
                Remove-Item -Path $destSkillPath -Recurse -Force
                Copy-Item -Path $sourceSkillPath -Destination $destSkillPath -Recurse
                $replaced += $skill
            }
            default {
                $skipped += $skill
            }
        }
    } else {
        Copy-Item -Path $sourceSkillPath -Destination $destSkillPath -Recurse
        $installed += $skill
    }
}

Write-Host ""
Write-Host "========== Installation Summary =========="
Write-Host "Destination: $destLabel"
Write-Host ""

if ($installed.Count -gt 0) {
    Write-Host "Installed (new):"
    foreach ($s in $installed) { Write-Host "  - $s" }
}

if ($replaced.Count -gt 0) {
    Write-Host "Installed (replaced):"
    foreach ($s in $replaced) { Write-Host "  - $s" }
}

if ($skipped.Count -gt 0) {
    Write-Host "Skipped:"
    foreach ($s in $skipped) { Write-Host "  - $s" }
}

$total = $installed.Count + $replaced.Count
Write-Host ""
Write-Host "Total installed: $total | Skipped: $($skipped.Count)"
Write-Host "=========================================="
