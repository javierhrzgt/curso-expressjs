# PRD - Sistema de Gestión de Reservaciones y Citas

## 1. Resumen Ejecutivo

**Nombre del Producto:** API de Reservaciones Express
**Versión:** 1.0.0
**Stack:** Node.js + Express.js + PostgreSQL + Prisma

Sistema de API REST para gestionar reservaciones y citas con autenticación JWT y control de acceso basado en roles.

---

## 2. Problema a Resolver

Los usuarios necesitan un sistema para:
- Registrarse y autenticarse de forma segura
- Reservar citas en bloques de tiempo predefinidos
- Gestionar sus propias reservaciones
- Los administradores necesitan controlar los bloques de tiempo disponibles y ver todas las reservaciones

---

## 3. Usuarios Objetivo

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **USER** | Usuario final que agenda citas | Crear, ver, editar y eliminar sus propias reservaciones |
| **ADMIN** | Administrador del sistema | Todo lo anterior + crear bloques de tiempo + ver todas las reservaciones |

---

## 4. Funcionalidades

### 4.1 Autenticación
- Registro de usuarios con validación (nombre, email, password)
- Login con generación de JWT (expira en 4 horas)
- Contraseñas hasheadas con bcryptjs

### 4.2 Gestión de Reservaciones
- Crear reservación asociada a un bloque de tiempo y fecha
- Consultar reservaciones propias
- Actualizar reservación existente
- Eliminar reservación
- Prevención de conflictos (no duplicar reservaciones en mismo bloque/fecha)

### 4.3 Administración
- Crear bloques de tiempo (hora inicio/fin)
- Consultar todas las reservaciones del sistema

---

## 5. Arquitectura Técnica

### Modelos de Datos

```
User (id, name, email, password, role)
    └── Appointment (id, date, userId, timeBlockId)
            └── TimeBlock (id, startTime, endTime)
```

### Endpoints API

| Módulo | Método | Endpoint | Auth | Rol |
|--------|--------|----------|------|-----|
| Auth | POST | `/api/v1/auth/register` | No | - |
| Auth | POST | `/api/v1/auth/login` | No | - |
| Reservaciones | POST | `/api/v1/reservations` | JWT | USER |
| Reservaciones | GET | `/api/v1/reservations/:id` | JWT | USER |
| Reservaciones | PUT | `/api/v1/reservations/:id` | JWT | USER |
| Reservaciones | DELETE | `/api/v1/reservations/:id` | JWT | USER |
| Admin | POST | `/api/v1/admin/time-blocks` | JWT | ADMIN |
| Admin | GET | `/api/v1/admin/reservations` | JWT | ADMIN |
| Citas | GET | `/api/v1/users/:id/appointments` | JWT | USER |

---

## 6. Requisitos No Funcionales

- **Seguridad:** JWT, bcrypt, validación con Zod
- **Base de datos:** PostgreSQL 17 con Prisma ORM
- **Containerización:** Docker para la base de datos
- **Logging:** Registro de todas las peticiones HTTP
- **Manejo de errores:** Centralizado con respuestas estandarizadas

---

## 7. Validaciones

| Campo | Regla |
|-------|-------|
| name | Mínimo 3 caracteres |
| email | Formato válido, único, lowercase |
| password | Mínimo 6 caracteres |
| timeBlock | startTime < endTime |
| reservation | No duplicar mismo bloque + fecha |

---

## 8. Estado Actual

**Implementado:**
- Sistema de autenticación completo
- CRUD de reservaciones
- Gestión de bloques de tiempo
- Middlewares de auth, validación y logging
- Control de acceso por roles

**Pendiente:**
- Tests automatizados
- Documentación de API (Swagger)
- Rate limiting
- Refresh tokens
