param(
    [switch]$SkipFrontend
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Action
    )

    Write-Host ""
    Write-Host "==> $Name" -ForegroundColor Cyan
    & $Action
    Write-Host "OK: $Name" -ForegroundColor Green
}

try {
    $root = Resolve-Path (Join-Path $PSScriptRoot "..")
    Push-Location $root

    Invoke-Step "Django system check" { python manage.py check }
    Invoke-Step "Marketplace regression tests" { python manage.py test marketplace.tests }

    if (-not $SkipFrontend) {
        Invoke-Step "Frontend production build" {
            Push-Location (Join-Path $root "frontend")
            try {
                npm run build
            }
            finally {
                Pop-Location
            }
        }
    }

    Write-Host ""
    Write-Host "Smoke test finalizado correctamente." -ForegroundColor Green
    exit 0
}
catch {
    Write-Host ""
    Write-Host "Smoke test falló: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location
}
