# Bookinn — Proyecto 3: Seguridad, Roles y Stored Procedures

Aplicación web para gestionar el inventario y ventas de una librería. Construida con PostgreSQL, Node.js (Express + Prisma) y HTML/CSS/JS vanilla, desplegada con Docker.

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo

---

## Levantar el proyecto

```bash
git clone https://github.com/marianacastanedar/proyecto2-libreria.git
cd proyecto2-libreria
git checkout proyecto-3
cp .env.example .env
docker compose up --build
```

La base de datos se inicializa automáticamente con tablas, roles, stored procedures y datos de prueba.

---

## Acceso

| Servicio | URL |
|---|---|
| Frontend | http://localhost:8888/login.html |
| Backend | http://localhost:3000 |
| Base de datos | localhost:5434 |

---

## Credenciales de base de datos

- Usuario: `proy3`
- Contraseña: `secret`
- Base de datos: `libreria`

---

## Usuarios de prueba

| Usuario | Contraseña | Accede a |
|---|---|---|
| `cajero_test` | `pass123` | Ventas, Clientes |
| `vendedor_test` | `pass123` | Productos, Ventas, Clientes |
| `rrhh_test` | `pass123` | Empleados |
| `marketing_test` | `pass123` | Productos, Proveedores |
| `financiero_test` | `pass123` | Reportes, Ventas |

---

## Estructura del proyecto

```
proyecto2-libreria/
├── docker-compose.yml
├── .env.example
├── database/
│   ├── 01_schema.sql       # ddl tablas e indices
│   ├── 02_roles_db.sql     # create role grant revoke
│   ├── 03_procedures.sql   # 5 stored procedures
│   └── 04_seed.sql         # datos de prueba
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js            # api rest con express y prisma
│   └── prisma/
│       └── schema.prisma   # modelos orm
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── login.html
    ├── index.html
    ├── styles.css
    └── js/
        ├── main.js
        ├── router.js
        ├── ui.js
        └── app.js
```

---

## Roles en el DBMS

| Rol | Permisos |
|---|---|
| `rol_cajero` | SELECT/INSERT/UPDATE en venta, cliente, producto |
| `rol_vendedor` | SELECT/INSERT/UPDATE en producto, cliente, venta |
| `rol_gerente_personal` | SELECT/INSERT/UPDATE/DELETE en empleado, rol |
| `rol_responsable_marketing` | SELECT/INSERT/UPDATE/DELETE en producto, categoria, proveedor |
| `rol_gerente_financiero` | SELECT en todas las tablas |

---

## Stored Procedures

| Nombre | Tipo | Descripción |
|---|---|---|
| `fn_registrar_venta` | FUNCTION | registra venta completa con rollback en exception |
| `sp_crear_o_buscar_cliente` | PROCEDURE | busca o crea cliente, parámetro INOUT |
| `fn_verificar_stock` | FUNCTION | valida y descuenta stock |
| `fn_cancelar_pedido` | FUNCTION | cancela pedido con validación de estado |
| `fn_reporte_ventas_periodo` | FUNCTION | reporte ventas por rango de fechas |

---

## Detener el proyecto

```bash
docker compose down
```

Para eliminar datos almacenados:

```bash
docker compose down -v
```