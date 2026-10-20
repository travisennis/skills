param(
    [switch]$All,
    [string]$Skills,
    [string]$Dest,
    [switch]$Force,
    [switch]$DryRun,
    [switch]$List,
    [switch]$Help
)

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

function Show-Usage {
    Write-Host @"
Usage: install.ps1 [options]

Install skills from this repository.

Options:
  -All                 Install every skill under skills/
  -Skills <list>       Comma-separated skill names
  -Dest <target>       project, global, cursor-project, cursor-global,
                       claude-project, claude-global, copilot-project,
                       copilot-global, or a filesystem path
  -Force               Replace existing skill directories
  -DryRun              Show what would be copied without copying
  -List                List installable skills and exit
  -Help                Show this help

With no -All or -Skills, the script prompts for a selection. With no -Dest,
it prompts unless -All or -Skills was given, in which case it defaults to the
current project's .agents/skills directory.
"@
}

function Get-SkillNames {
    Get-ChildItem -Path (Join-Path $RepoDir "skills") -Directory |
        Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") } |
        Sort-Object Name |
        ForEach-Object { $_.Name }
}

function Resolve-Destination {
    param([string]$Choice)

    switch ($Choice.ToLowerInvariant()) {
        "project" { return (Join-Path (Get-Location) ".agents/skills") }
        "global" { return (Join-Path (Join-Path $HOME ".agents") "skills") }
        "cursor-project" { return (Join-Path (Get-Location) ".cursor/skills") }
        "cursor-global" { return (Join-Path (Join-Path $HOME ".cursor") "skills") }
        "claude-project" { return (Join-Path (Get-Location) ".claude/skills") }
        "claude-global" { return (Join-Path (Join-Path $HOME ".claude") "skills") }
        "copilot-project" { return (Join-Path (Get-Location) ".github/skills") }
        "copilot-global" { return (Join-Path (Join-Path $HOME ".copilot") "skills") }
        default { return (Resolve-UserPath -Path $Choice) }
    }
}

function Copy-SkillFiles {
    param(
        [string]$Source,
        [string]$Destination
    )

    New-Item -ItemType Directory -Path $Destination -Force | Out-Null

    Get-ChildItem -Path $Source -Recurse -File -Force |
        Where-Object {
            $_.FullName -notmatch '[\\/]node_modules[\\/]' -and
            $_.FullName -notmatch '[\\/]__pycache__[\\/]' -and
            $_.Name -ne ".DS_Store"
        } |
        ForEach-Object {
            $relative = $_.FullName.Substring($Source.Length).TrimStart(@('\', '/'))
            $target = Join-Path $Destination $relative
            $parent = Split-Path -Parent $target
            if ($parent) {
                New-Item -ItemType Directory -Path $parent -Force | Out-Null
            }
            Copy-Item -LiteralPath $_.FullName -Destination $target -Force
        }
}

if ($Help) {
    Show-Usage
    exit 0
}

$skillNames = @(Get-SkillNames)

if ($skillNames.Count -eq 0) {
    Write-Host "No skills found in $RepoDir/skills"
    exit 1
}

if ($List) {
    $skillNames | ForEach-Object { Write-Host $_ }
    exit 0
}

Write-Host "Available skills:"
for ($i = 0; $i -lt $skillNames.Count; $i++) {
    Write-Host "  $($i + 1). $($skillNames[$i])"
}
Write-Host ""

$selected = @()
if ($All) {
    $selected = $skillNames
} elseif (-not [string]::IsNullOrWhiteSpace($Skills)) {
    foreach ($name in ($Skills -split "," | ForEach-Object { $_.Trim() })) {
        if ([string]::IsNullOrWhiteSpace($name)) {
            continue
        }
        if ($skillNames -contains $name) {
            $selected += $name
        } else {
            Write-Host "Error: unknown skill '$name'"
            exit 1
        }
    }
} else {
    $selection = Read-Host "Which skills to install? (comma-separated numbers or 'all') [all]"
    if ([string]::IsNullOrWhiteSpace($selection)) { $selection = "all" }

    if ($selection -eq "all") {
        $selected = $skillNames
    } else {
        $indices = $selection -split "," | ForEach-Object { $_.Trim() }
        foreach ($idx in $indices) {
            if ($idx -match '^\d+$') {
                $num = [int]$idx
                if ($num -ge 1 -and $num -le $skillNames.Count) {
                    $selected += $skillNames[$num - 1]
                } else {
                    Write-Host "Warning: Ignoring invalid selection '$idx'"
                }
            } else {
                Write-Host "Warning: Ignoring invalid selection '$idx'"
            }
        }
    }
}

if ($selected.Count -eq 0) {
    Write-Host "No valid skills selected. Exiting."
    exit 1
}

if (-not [string]::IsNullOrWhiteSpace($Dest)) {
    $DestPath = Resolve-Destination -Choice $Dest
    $destLabel = $DestPath
} else {
    Write-Host "Install destination:"
    Write-Host "  1. Project (.agents standard)  (./.agents/skills)"
    Write-Host "  2. Global  (.agents standard)  (~/.agents/skills)"
    Write-Host "  3. Cursor project             (./.cursor/skills)"
    Write-Host "  4. Cursor global              (~/.cursor/skills)"
    Write-Host "  5. Claude project             (./.claude/skills)"
    Write-Host "  6. Claude global              (~/.claude/skills)"
    Write-Host "  7. Copilot project            (./.github/skills)"
    Write-Host "  8. Copilot global             (~/.copilot/skills)"
    Write-Host "  9. Custom path"
    $destChoice = Read-Host "Choose destination [1]"
    if ([string]::IsNullOrWhiteSpace($destChoice)) { $destChoice = "1" }
    $destChoice = $destChoice.Trim()

    switch ($destChoice) {
        "1" { $DestPath = Resolve-Destination -Choice "project"; $destLabel = "project ($DestPath)" }
        "2" { $DestPath = Resolve-Destination -Choice "global"; $destLabel = "global ($DestPath)" }
        "3" { $DestPath = Resolve-Destination -Choice "cursor-project"; $destLabel = "cursor project ($DestPath)" }
        "4" { $DestPath = Resolve-Destination -Choice "cursor-global"; $destLabel = "cursor global ($DestPath)" }
        "5" { $DestPath = Resolve-Destination -Choice "claude-project"; $destLabel = "claude project ($DestPath)" }
        "6" { $DestPath = Resolve-Destination -Choice "claude-global"; $destLabel = "claude global ($DestPath)" }
        "7" { $DestPath = Resolve-Destination -Choice "copilot-project"; $destLabel = "copilot project ($DestPath)" }
        "8" { $DestPath = Resolve-Destination -Choice "copilot-global"; $destLabel = "copilot global ($DestPath)" }
        "9" {
            do {
                $customDest = Read-Host "Enter custom destination path"
                $DestPath = Resolve-UserPath -Path $customDest
                if ([string]::IsNullOrWhiteSpace($DestPath)) {
                    Write-Host "Custom destination cannot be empty."
                }
            } while ([string]::IsNullOrWhiteSpace($DestPath))
            $destLabel = "custom ($DestPath)"
        }
        default {
            Write-Host "Warning: Unknown destination '$destChoice', defaulting to project."
            $DestPath = Resolve-Destination -Choice "project"
            $destLabel = "project ($DestPath)"
        }
    }
}

if ($DryRun) {
    Write-Host "Dry run: no files will be copied."
} else {
    New-Item -ItemType Directory -Path $DestPath -Force | Out-Null
}

$installed = @()
$skipped = @()
$replaced = @()

foreach ($skill in $selected) {
    $source = Join-Path (Join-Path $RepoDir "skills") $skill
    $target = Join-Path $DestPath $skill

    if (-not (Test-Path (Join-Path $source "SKILL.md"))) {
        Write-Host "Error: skill not found '$skill'"
        exit 1
    }

    if (Test-Path $target) {
        if ($Force) {
            if ($DryRun) {
                Write-Host "Would replace: $skill"
            } else {
                Remove-Item -LiteralPath $target -Recurse -Force
                Copy-SkillFiles -Source $source -Destination $target
            }
            $replaced += $skill
        } else {
            $conflictChoice = Read-Host "'$skill' already exists at destination. [S]kip or [R]eplace? [S]"
            if ([string]::IsNullOrWhiteSpace($conflictChoice)) { $conflictChoice = "S" }

            if ($conflictChoice.ToUpperInvariant() -eq "R") {
                if ($DryRun) {
                    Write-Host "Would replace: $skill"
                } else {
                    Remove-Item -LiteralPath $target -Recurse -Force
                    Copy-SkillFiles -Source $source -Destination $target
                }
                $replaced += $skill
            } else {
                $skipped += $skill
            }
        }
    } else {
        if ($DryRun) {
            Write-Host "Would install: $skill"
        } else {
            Copy-SkillFiles -Source $source -Destination $target
        }
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
