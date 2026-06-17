# ============================================================
# FitProject — Levantar todos los servicios de desarrollo
# Uso: click derecho -> "Ejecutar con PowerShell"
#      o desde terminal: .\start-dev.ps1
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Open-Service {
    param([string]$Title, [string]$Path, [string]$Command)
    # Refresca PATH del sistema para que node, npm, mvn sean encontrados en ventanas nuevas
    $refreshPath = '$env:Path = [System.Environment]::GetEnvironmentVariable(''Path'',''Machine'') + '';'' + [System.Environment]::GetEnvironmentVariable(''Path'',''User'')'
    $cmd = "$refreshPath; Set-Location '$Path'; Write-Host '>> $Title iniciando...' -ForegroundColor Cyan; $Command"
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $cmd
    Write-Host "[OK] $Title" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Yellow
Write-Host "  FitProject - Iniciando servicios   " -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""

# ── 1. Microservicios (arrancan primero, tardan ~60s cada uno) ──
Write-Host ">> Iniciando microservicios..." -ForegroundColor Cyan

Open-Service "MS-Users :8090"    "$root\Backend\MS-Users"    "mvn spring-boot:run"
Start-Sleep 3

Open-Service "MS-Gestion :8080"  "$root\Backend\MS-Gestion"  "mvn spring-boot:run"
Start-Sleep 3

Open-Service "MS-Inventario :8094" "$root\Backend\MS-Inventario" "mvn spring-boot:run"
Start-Sleep 3

Open-Service "MS-Ventas :8091"    "$root\Backend\MS-Ventas"    "mvn spring-boot:run"
Start-Sleep 3

# ── 2. BFFs (esperan a que los MS estén listos) ────────────────
Write-Host ">> Iniciando BFFs..." -ForegroundColor Cyan

Open-Service "BFF-Gestion :8081"  "$root\Backend\BFF-Gestion"   "mvn spring-boot:run"
Start-Sleep 3

Open-Service "BFF-Usuarios :8082" "$root\Backend\BFF-Usuarios"  "mvn spring-boot:run"
Start-Sleep 3

Open-Service "BFF-Ventas :8083"   "$root\Backend\BFF-Ventas"    "mvn spring-boot:run"
Start-Sleep 3

# ── 3. Api-Gateway ─────────────────────────────────────────────
Write-Host ">> Iniciando Api-Gateway..." -ForegroundColor Cyan
Open-Service "Api-Gateway :4000"  "$root\Backend\Api-Gateway"   "npm install --silent; npm start"
Start-Sleep 2

# ── 4. Frontends ───────────────────────────────────────────────
Write-Host ">> Iniciando Frontends..." -ForegroundColor Cyan
Open-Service "Fit-Admin-Panel :3000"      "$root\Frontend\Fit-Admin-Panel"      "npm install --silent; npm run dev"
Open-Service "Fit-Supervisor :3003"       "$root\Frontend\Fit-Supervisor"       "npm install --silent; npm run dev"
Open-Service "Fit-Dashboard :3001"        "$root\Frontend\Fit-Dashboard"        "npm install --silent; npm run dev"
Open-Service "Fit-Sucursal-Virtual :3004" "$root\Frontend\Fit-Sucursal-Virtual" "npm install --silent; npm run dev"
Open-Service "Fit-Ecommerce :3002"        "$root\Frontend\Fit-Ecommerce"        "npm install --silent; npm run dev"

# ── Resumen ────────────────────────────────────────────────────
Write-Host ""
Write-Host "======================================" -ForegroundColor Yellow
Write-Host "  Servicios iniciando en segundo plano" -ForegroundColor Yellow
Write-Host "  Espera ~2 minutos para que carguen  " -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Admin Panel  ->  http://localhost:3000" -ForegroundColor White
Write-Host "  Supervisor   ->  http://localhost:3003" -ForegroundColor White
Write-Host "  Api-Gateway  ->  http://localhost:4000/health" -ForegroundColor White
Write-Host "  MS-Gestion   ->  http://localhost:8080/api/v1/projects" -ForegroundColor White
Write-Host "  MS-Inventario->  http://localhost:8094/api/v1/insumos" -ForegroundColor White
Write-Host "  MS-Ventas    ->  http://localhost:8091/api/v1/models" -ForegroundColor White
Write-Host "  Ecommerce    ->  http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar esta ventana..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
