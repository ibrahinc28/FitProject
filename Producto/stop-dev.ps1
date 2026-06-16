# ============================================================
# FitProject — Detener todos los servicios de desarrollo
# ============================================================

Write-Host ""
Write-Host "Deteniendo servicios FitProject..." -ForegroundColor Red

# Matar procesos Java (Spring Boot)
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "[OK] Microservicios Java detenidos" -ForegroundColor Green

# Matar procesos Node (Gateway + Frontends)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "[OK] Servicios Node.js detenidos" -ForegroundColor Green

Write-Host ""
Write-Host "Todos los servicios han sido detenidos." -ForegroundColor Yellow
Write-Host "Presiona cualquier tecla para cerrar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
