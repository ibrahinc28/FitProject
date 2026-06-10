# fit-notificaciones-service

Microservicio de notificaciones para el proyecto Fit. Este servicio se encarga de enviar alertas asincrónicas cuando un hito del contenedor cambia su estado al 100% (Completado).

## Características

- Arquitectura limpia con patrón Repository (implementación en memoria)
- Simulación de envío de correos mediante Mailgun/SMTP (Mock)
- Endpoints REST para procesar y consultar notificaciones
- Pruebas unitarias funcionales

## Requisitos

- Java 17
- Maven 3.x

## Comandos Maven

### Compilar el proyecto
```bash
mvn clean install
```

### Ejecutar el servicio
```bash
mvn spring-boot:run
```

### Ejecutar pruebas
```bash
mvn test
```

## Endpoints

### POST /api/notificaciones/enviar-alerta
Envía una alerta de notificación cuando un hito es completado.

**Body:**
```json
{
  "correoSupervisor": "supervisor@fitproject.com",
  "nombreHito": "Instalación Eléctrica"
}
```

**Response:**
```json
{
  "id": 1,
  "correoDestinatario": "supervisor@fitproject.com",
  "mensaje": "El hito 'Instalación Eléctrica' ha sido completado al 100%. Por favor revise el avance de la obra.",
  "tipoAlerta": "AVANCE_OBRA",
  "estado": "ENVIADO"
}
```

### GET /api/notificaciones
Retorna el historial de todas las notificaciones procesadas en memoria.

**Response:**
```json
[
  {
    "id": 1,
    "correoDestinatario": "supervisor@fitproject.com",
    "mensaje": "El hito 'Instalación Eléctrica' ha sido completado al 100%. Por favor revise el avance de la obra.",
    "tipoAlerta": "AVANCE_OBRA",
    "estado": "ENVIADO"
  }
]
```

## Arquitectura

- **model**: Entidades del dominio (Notificacion)
- **dto**: Objetos de transferencia de datos (AlertaRequest)
- **repository**: Patrón Repository con implementación en memoria
- **service**: Lógica de negocio y servicios externos (EmailService Mock)
- **controller**: Endpoints REST expuestos
