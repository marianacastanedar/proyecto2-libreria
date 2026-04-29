# Bookinn — Proyecto 2: Gestión de Inventario y Ventas

Aplicación web para gestionar el inventario y las ventas de una librería. Desarrollada con PostgreSQL, Node.js (Express) y HTML/CSS/JS vanilla, desplegada mediante Docker.

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo

---

## Levantar el proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/marianacastanedar/proyecto2-libreria.git
cd proyecto2-libreria

# 2. Crear el archivo de variables de entorno
cp .env.example .env

# 3. Levantar todos los servicios
docker compose up --build
```

La base de datos se inicializa automáticamente con tablas y datos de prueba al primer arranque.

---

## Acceso

| Servicio  | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:8888/login.html |
| Backend   | http://localhost:3000        |
| Base de datos | localhost:5434           |

---

## Credenciales de prueba

**Aplicación (login):**
- Usuario: `Carlos`
- Contraseña: `pass123`

**Base de datos:**
- Usuario: `proy2`
- Contraseña: `secret`
- Base de datos: `libreria`

---

## Estructura del proyecto

```
proyecto2-libreria/
├── docker-compose.yml
├── .env.example
├── database/
│   └── init.sql          # DDL + datos de prueba
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── index.js          # API REST con Express
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── login.html
    ├── index.html
    ├── style.css
    └── js/
        ├── main.js
        ├── router.js
        ├── ui.js
        └── app.js
```

---

## Funcionalidades

- Login y logout de empleados con sesión JWT
- CRUD de productos, clientes, proveedores y empleados
- Registro de ventas con transacción explícita (BEGIN / COMMIT / ROLLBACK)
- Reportes con JOINs, subqueries, GROUP BY, HAVING, CTE y VIEW
- Exportar reportes a CSV

---

## Detener el proyecto

```bash
docker compose down
```

Para eliminar también los datos almacenados:

```bash
docker compose down -v
```