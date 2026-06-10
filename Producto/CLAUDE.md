# FitProject-Global — Contexto para Claude Code

## ¿Qué es este proyecto?
Plataforma universitaria de **venta y gestión de proyectos de gimnasios en contenedores**. Permite a clientes visualizar y comprar modelos, a inversores ver KPIs, a supervisores registrar avance y evidencias fotográficas, y a administradores gestionar todo el ecosistema. Arquitectura de microservicios con múltiples frontends por rol.

---

## Arquitectura objetivo (diagrama oficial)

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENTES & DISPOSITIVOS                                        │
│  Next.js eCommerce  │  React Sucursal  │  React Admin  │  React │
│  Web (público)      │  Virtual         │  Panel        │  Mobile│
│                     │                  │               │ (Supv) │
└──────────┬──────────┴────────┬─────────┴───────┬───────┴───┬────┘
           │                   │                  │           │
┌──────────▼───────────────────▼──────────────────▼───────────▼────┐
│  API GATEWAY — Auth Manager / Passport.js Middleware             │
│  Node.js · JWT validation · routing a BFFs                       │
└──────────┬───────────────────┬──────────────────┬────────────────┘
           │                   │                  │
    ┌──────▼──────┐   ┌────────▼──────┐   ┌───────▼──────┐
    │ BFF-USUARIOS│   │  BFF-GESTION  │   │  BFF-VENTAS  │
    │ Spring Boot │   │  Spring Boot  │   │  Spring Boot │
    │   :8082     │   │    :8081      │   │    :8083     │
    └──────┬──────┘   └────────┬──────┘   └───────┬──────┘
           │                   │                  │
┌──────────▼───────────────────▼──────────────────▼────────────────┐
│  KUBERNETES CLUSTER                                              │
│                                                                  │
│  MS-USERS       MS-GESTION      MS-NOTIFICACIONES   MS-VENTAS   │
│  :8090          :8080            :8093               :8091       │
│    │              │                  │                  │        │
│  BD-USERS      BD-GESTION       BD-NOTIFIC.        BD-VENTAS    │
│  (PostgreSQL)  (PostgreSQL)     (PostgreSQL)       (PostgreSQL) │
│                                                                  │
│              MESSAGE BROKER: RABBITMQ                           │
│  (MS-GESTION, MS-VENTAS, MS-NOTIFICACIONES se comunican via MQ) │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│  SERVERLESS SERVICES                                             │
│  Lambda: Generador de Tickets PDF   (Event Trigger desde MQ)    │
│  Lambda: Procesador de Evidencias   (Object Created Trigger S3) │
└──────────────────────────────────────────────────────────────────┘

SERVICIOS EXTERNOS:
  Payment Gateway · Amazon S3 (imágenes) · Mailgun (emails)
```

---

## Estructura de carpetas (objetivo)

```
FitProject-Global/
├── Frontend/
│   ├── Fit-Ecommerce/           # Next.js 14 — público, catálogo + cotización
│   ├── Fit-Admin-Panel/         # React — ADMIN: gestión proyectos, usuarios, KPIs
│   ├── Fit-Supervisor/          # React — SUPERVISOR_OBRA: evidencias + progreso
│   ├── Fit-Sucursal-Virtual/    # React — ventas, modelos, seguimiento de compra
│   └── Fit-Dashboard/           # React — INVERSIONISTA: KPIs y gráficos (Recharts)
│
├── Backend/
│   ├── Api-Gateway/             # Node.js + Passport.js — Auth Manager, enruta a BFFs
│   ├── BFF-Gestion/             # Spring Boot :8081 — proxy a MS-GESTION
│   ├── BFF-Usuarios/            # Spring Boot :8082 — proxy a MS-USERS
│   ├── BFF-Ventas/              # Spring Boot :8083 — proxy a MS-VENTAS
│   ├── MS-Gestion/              # Spring Boot :8080 — proyectos, pasos, evidencias
│   ├── MS-Users/                # Spring Boot :8090 — usuarios, roles, auth
│   ├── MS-Ventas/               # Spring Boot :8091 — modelos, unidades, ventas
│   └── MS-Notificaciones/       # Spring Boot :8093 — emails, alertas vía RabbitMQ
│
├── Serverless/
│   ├── ticket-generator/        # AWS Lambda — genera PDF de tickets/contratos
│   └── evidence-processor/      # AWS Lambda — procesa imágenes subidas a S3
│
├── Infrastructure/
│   ├── docker-compose.yml       # orquestación local completa
│   └── k8s/                     # manifiestos Kubernetes (futuro)
│
└── CLAUDE.md
```

---

## Estado actual vs objetivo

| Componente | Estado | Notas |
|-----------|--------|-------|
| `Frontend/Fit-Ecommerce` | ✅ Existe | Next.js 14, catálogo 5 modelos |
| `Frontend/Fit-Dashboard` | ✅ Existe | Recharts KPIs para INVERSIONISTA |
| `Frontend/Fit-Frontend` | ⚠️ Refactorizar | Mezclado Admin+Supervisor → separar en Fit-Admin-Panel + Fit-Supervisor |
| `Frontend/Fit-Sucursal-Virtual` | 🆕 Pendiente | React, vista de ventas |
| `Backend/Api-Gateway` | 🆕 Pendiente | Node.js + Passport.js |
| `Backend/BFF-Gestion` | ⚠️ Renombrar | Actualmente `Fit-BFF`, limpiar rutas de usuarios |
| `Backend/BFF-Usuarios` | 🆕 Pendiente | Nuevo BFF dedicado a users |
| `Backend/BFF-Ventas` | 🆕 Pendiente | Nuevo BFF dedicado a ventas |
| `Backend/MS-Gestion` | ⚠️ Renombrar | Actualmente `Fit-Ms-Gestion`, extraer entidad User |
| `Backend/MS-Users` | 🆕 Pendiente | Extraer User/Auth de MS-Gestion |
| `Backend/MS-Ventas` | 🆕 Pendiente | Nuevo microservicio |
| `Backend/MS-Notificaciones` | 🆕 Pendiente | Nuevo microservicio + RabbitMQ |
| RabbitMQ | 🆕 Pendiente | Message broker entre microservicios |
| Amazon S3 | 🆕 Pendiente | Reemplaza base64 en DB |
| Mailgun | 🆕 Pendiente | Emails de notificación |
| Lambdas Serverless | 🆕 Pendiente | PDF tickets + procesador imágenes |

---

## Stack tecnológico completo

| Capa | Tecnología |
|------|-----------|
| eCommerce | Next.js 14 + TypeScript + Tailwind CSS v3 |
| Frontends React | React 19 + TypeScript + Vite + Tailwind CSS v3 + React Router v7 |
| Dashboard | React 19 + Recharts + Axios |
| API Gateway | Node.js + Express + Passport.js + JWT |
| BFFs | Spring Boot 3.2 + Spring Cloud OpenFeign + Spring Security |
| Microservicios | Spring Boot 3.2 + Spring Data JPA + Lombok + Validation |
| Base de datos | PostgreSQL 15 (una BD por microservicio) |
| Message Broker | RabbitMQ |
| Almacenamiento | Amazon S3 (imágenes de evidencias) |
| Email | Mailgun / SMTP externo |
| Serverless | AWS Lambda (Node.js o Java) |
| Infra local | Docker Compose + red externa `fit-network` |
| Infra producción | Kubernetes Cluster |
| Tests frontend | Vitest (cobertura >60% obligatoria) |
| Tests backend | JUnit 5 + Mockito + JaCoCo |
| BD producción | Neon (PostgreSQL serverless gratuito) |

---

## Roles y acceso por frontend

| Rol | Frontend | Acceso |
|-----|----------|--------|
| `USUARIO_GENERAL` | Fit-Ecommerce | Catálogo público, cotizaciones |
| `INVERSIONISTA` | Fit-Dashboard | KPIs: progreso, ventas, evidencias |
| `ADMIN` | Fit-Admin-Panel | Gestión total: proyectos, usuarios, ventas |
| `SUPERVISOR_OBRA` | Fit-Supervisor | Evidencias fotográficas, progreso de pasos |
| `VENDEDOR` | Fit-Sucursal-Virtual | Modelos disponibles, seguimiento de ventas |

### Flujo de login centralizado
El login vive en **Fit-Admin-Panel** (puerto 3000) y redirige según rol:
- `ADMIN` → queda en Fit-Admin-Panel (:3000)
- `SUPERVISOR_OBRA` → redirige a Fit-Supervisor (:3003)  
- `INVERSIONISTA` → redirige a Fit-Dashboard (:3001) vía `/auth?token=...`
- `USUARIO_GENERAL` → redirige a Fit-Ecommerce (:3002)
- `VENDEDOR` → redirige a Fit-Sucursal-Virtual (:3004)

---

## Convenciones del proyecto

### Código
- Backend usa **inglés** en entidades, DTOs, campos, endpoints
- Frontend usa **español** en UI pero inglés en tipos TypeScript
- IDs son **UUID** (nunca Long/Integer)
- Patrón **DTO**: las entidades JPA nunca se exponen directamente en la API
- Cada microservicio tiene su **propia base de datos** (no comparten esquema)
- Comunicación **síncrona**: Frontend → API Gateway → BFF → Microservicio (vía Feign)
- Comunicación **asíncrona**: entre microservicios vía RabbitMQ

### Reglas de negocio (MS-Gestion)
- Progreso general de un proyecto = promedio del progreso de sus pasos
- Cada aprobación de evidencia suma +20% al paso (máx 100%)
- Al llegar al 100% el paso se marca `COMPLETED`
- Flujo de evidencias: `PENDING → APPROVED (+20%)` o `PENDING → REJECTED`

### Testing (obligatorio para evaluación universitaria)
- **Frontend**: Vitest, cobertura >60% en todo componente nuevo o modificado
- **Backend**: JUnit 5 + Mockito, JaCoCo para reporte de cobertura
- **Empaquetado**: cada app debe tener `package.json` válido con scripts `dev`, `build`, `test`

### Aislamiento de repositorios
- Cada componente (Frontend, BFF, Microservicio) debe poder vivir en su **propio repositorio GitHub**
- Cada carpeta debe ser un proyecto autocontenido con su propio `Dockerfile` y `docker-compose.yml`
- La red Docker compartida se llama `fit-network` (externa, creada manualmente con `docker network create fit-network`)

---

## Flujos principales

### Flujo de evidencias (MS-Gestion)
```
Supervisor sube imagen → S3 (Lambda procesa) → evidenceUrl guardada
Worker/Supervisor crea evidencia → status: PENDING
Supervisor aprueba → status: APPROVED → paso +20% → si 100%: COMPLETED
Supervisor rechaza → status: REJECTED
```

### Flujo de venta (MS-Ventas)
```
Cliente navega Fit-Ecommerce → selecciona modelo → formulario cotización
Vendedor en Fit-Sucursal-Virtual → confirma venta → pago (Payment Gateway)
MS-Ventas publica evento en RabbitMQ → MS-Notificaciones envía email (Mailgun)
Lambda genera ticket PDF → cliente recibe confirmación
```

### Flujo de notificaciones (RabbitMQ)
```
MS-Gestion / MS-Ventas → publica evento → RabbitMQ
MS-Notificaciones → consume evento → envía email/alerta vía Mailgun
```

---

## Puertos locales (docker)

| Servicio | Puerto |
|---------|--------|
| fit-postgres | 5432 |
| MS-Gestion | 8080 |
| BFF-Gestion | 8081 |
| BFF-Usuarios | 8082 |
| BFF-Ventas | 8083 |
| MS-Users | 8090 |
| MS-Ventas | 8091 |
| MS-Notificaciones | 8093 |
| Api-Gateway | 4000 |
| RabbitMQ | 5672 (AMQP) / 15672 (UI) |
| Fit-Admin-Panel | 3000 |
| Fit-Dashboard | 3001 |
| Fit-Ecommerce | 3002 |
| Fit-Supervisor | 3003 |
| Fit-Sucursal-Virtual | 3004 |

---

## Variables de entorno clave

```bash
# Bases de datos (una por microservicio)
DATABASE_URL_GESTION=jdbc:postgresql://...
DATABASE_URL_USERS=jdbc:postgresql://...
DATABASE_URL_VENTAS=jdbc:postgresql://...
DATABASE_URL_NOTIFICACIONES=jdbc:postgresql://...

# JWT (compartido entre Api-Gateway y todos los BFFs)
JWT_SECRET=fitproject-secret-key-must-be-at-least-32-chars-long
JWT_EXPIRATION=86400000

# RabbitMQ
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=fit_user
RABBITMQ_PASS=fit_pass

# S3
AWS_BUCKET_NAME=fitproject-evidencias
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Email
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...
```

---

## Comandos útiles

```bash
# Red Docker compartida (solo la primera vez)
docker network create fit-network

# Levantar base de datos local
cd Backend/MS-Gestion && docker-compose --profile local up -d

# Levantar cualquier servicio de forma independiente
cd Backend/<servicio> && docker-compose up -d --build

# Tests frontend
cd Frontend/<app> && npm test

# Tests backend
cd Backend/<servicio> && ./mvnw test
```

---

## Contexto universitario
- Proyecto de universidad → priorizar soluciones simples, gratuitas y bien documentadas
- BD producción: **Neon** (PostgreSQL serverless gratuito) — una instancia por microservicio
- Storage: **AWS S3** free tier para imágenes
- Email: **Mailgun** plan gratuito (100 emails/día)
- Serverless: **AWS Lambda** free tier
- **No usar servicios de pago** sin alternativa gratuita confirmada