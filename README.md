<h1 align="center">Reservas de espacios API</h1>

<p align="center">
    Backend REST para gestionar usuarios, espacios y reservas con cuotas (quotes), autenticación JWT, RBAC simple (admin/user), i18n, Swagger, respuestas unificadas y exportación de cuotas a JSON/CSV.
    Stack: Express + Sequelize + PostgreSQL (Supabase) + pnpm.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-20.x-green.svg" alt="node"/>
  <img src="https://img.shields.io/badge/javascript-5.x-blue.svg" alt="javascript"/>
  <img src="https://img.shields.io/badge/framework-Express-red.svg" alt="express"/>
  <img src="https://img.shields.io/badge/ORM-Sequelize_ORM-yellow.svg" alt="sequelize"/>
  <img src="https://img.shields.io/badge/Web_Framework-Fastify_⚡-black.svg" alt="fastify"/>
  <img src="https://img.shields.io/badge/deployment-Dockerized 🐳_-blue.svg" alt="docker"/>
</p>

---

## 🧠 Características principales

- CRUD de `Users`, `Spaces` y `Reservations`.

- Cálculo de monto: precioBaseHora × duración × factor (fines de semana +20%).

- Disponibilidad: evita reservas solapadas por espacio/fecha/horario.

- Cuotas: generación y persistencia de cuotas por reserva + marcar como pagadas.

- Tipo de cambio: función con cache 1h (mockeable / API real opcional).

- Auth JWT + RBAC (roles: admin, user).

- `i18n` (ES/EN) con mensajes traducibles.

- `Swagger UI` con seguridad Bearer.

- Respuestas unificadas:

```bash
    Éxito → { data, meta }

    Error → { error: { status, message, ... } }
```

- Export de cuotas: `JSON` y `CSV` (compatible con Excel/Sheets).

- Arquitectura MVC extendido: controladores con validaciones, servicios con lógica de negocio y acceso a DB.

---

## Requisitos previos

- Una `BD PostgreSQL` (p.ej. Supabase)
- Node `20 +`
- pnpm `9 +`

---

## 🚀 Cómo levantar el proyecto

```bash
# Clonar el repositorio
git clone https://github.com/abrahamjdr/reserva-espacios-api
cd reserva-espacios-api
pnpm install

# crear variables de entorno
cp .env.example .env


# Completar valores
PORT=3000
CORS_ORIGIN=*
JWT_SECRET=super_secret
JWT_EXPIRES=2h
DATABASE_URL=postgres://user:pass@host:5432/dbname
DEFAULT_LOCALE=es
FX_FAKE=00.0


# levantar en desarrollo
pnpm dev

# levantar en prod
pnpm dev

# Iniciar en desarrollo (requiere docker y .env configurado)
docker-compose up
```

---

## Usuarios de prueba

```bash
    Role Admin:
    {
        "email":"admin@mail.com",
        password:"123456"
    }
    Role User:
    {
        "email":"user@mail.com",
        password:"123456"
    }
```
