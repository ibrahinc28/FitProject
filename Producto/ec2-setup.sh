#!/bin/bash
# Script de instalación para EC2 Amazon Linux 2023
# Ejecutar como root después de conectarse por SSH

set -e

echo "=== Instalando Docker ==="
dnf update -y
dnf install -y docker git
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

echo "=== Instalando Docker Compose v2 ==="
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.24.7/docker-compose-linux-x86_64 \
     -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version

echo "=== Clonando el repositorio ==="
# REEMPLAZA con la URL de tu repositorio GitHub
git clone https://github.com/TU_USUARIO/TU_REPO.git /opt/fitproject
cd /opt/fitproject/Producto

echo "=== Construyendo e iniciando todos los servicios ==="
# El build tarda ~10-15 minutos la primera vez
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "============================================"
echo "  FitProject desplegado"
echo "  IP: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "============================================"
echo "  Admin Panel    ->  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "  Supervisor     ->  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3003"
echo "  Ecommerce      ->  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3002"
echo "  Dashboard      ->  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3001"
echo "  API Gateway    ->  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):4000/health"
echo "============================================"
