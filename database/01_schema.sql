-- tabla rol
CREATE TABLE IF NOT EXISTS rol (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(50)   NOT NULL,
    horario VARCHAR(100)  NOT NULL,
    sueldo  DECIMAL(10,2) NOT NULL
);

-- tabla empleado
CREATE TABLE IF NOT EXISTS empleado (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    apellido  VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    password  VARCHAR(255) NOT NULL,
    id_rol    INTEGER NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES rol(id)
);

-- tabla cliente
CREATE TABLE IF NOT EXISTS cliente (
    id        SERIAL PRIMARY KEY,
    nit       VARCHAR(20)  NOT NULL,
    nombre    VARCHAR(100) NOT NULL,
    direccion VARCHAR(200)
);

-- tabla proveedor
CREATE TABLE IF NOT EXISTS proveedor (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    telefono  VARCHAR(20),
    correo    VARCHAR(100),
    direccion VARCHAR(200)
);

-- tabla categoria
CREATE TABLE IF NOT EXISTS categoria (
    id     SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- tabla producto
CREATE TABLE IF NOT EXISTS producto (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(200)  NOT NULL,
    autor       VARCHAR(100),
    isbn        VARCHAR(20),
    editorial   VARCHAR(100),
    anio        INTEGER,
    idioma      VARCHAR(50),
    num_paginas INTEGER,
    precio      DECIMAL(10,2) NOT NULL,
    stock       INTEGER       NOT NULL
);

-- tabla intermedia producto categoria
CREATE TABLE IF NOT EXISTS producto_categoria (
    id_producto  INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    PRIMARY KEY (id_producto, id_categoria),
    FOREIGN KEY (id_producto)  REFERENCES producto(id),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id)
);

-- tabla venta
CREATE TABLE IF NOT EXISTS venta (
    id          SERIAL PRIMARY KEY,
    fecha       TIMESTAMP     NOT NULL DEFAULT NOW(),
    metodo_pago VARCHAR(50)   NOT NULL,
    subtotal    DECIMAL(10,2) NOT NULL,
    total       DECIMAL(10,2) NOT NULL,
    id_empleado INTEGER NOT NULL,
    id_cliente  INTEGER NOT NULL,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id),
    FOREIGN KEY (id_cliente)  REFERENCES cliente(id)
);

-- tabla detalle venta
CREATE TABLE IF NOT EXISTS detalle_venta (
    id              SERIAL PRIMARY KEY,
    cantidad        INTEGER       NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    id_venta        INTEGER NOT NULL,
    id_producto     INTEGER NOT NULL,
    FOREIGN KEY (id_venta)    REFERENCES venta(id),
    FOREIGN KEY (id_producto) REFERENCES producto(id)
);

-- tabla pedido proveedor
CREATE TABLE IF NOT EXISTS pedido_proveedor (
    id           SERIAL PRIMARY KEY,
    fecha        TIMESTAMP   NOT NULL DEFAULT NOW(),
    estado       VARCHAR(20) NOT NULL CHECK (estado IN ('pendiente','recibido','cancelado')),
    id_proveedor INTEGER NOT NULL,
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id)
);

-- tabla detalle pedido
CREATE TABLE IF NOT EXISTS detalle_pedido (
    id              SERIAL PRIMARY KEY,
    cantidad        INTEGER       NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    id_pedido       INTEGER NOT NULL,
    id_producto     INTEGER NOT NULL,
    FOREIGN KEY (id_pedido)   REFERENCES pedido_proveedor(id),
    FOREIGN KEY (id_producto) REFERENCES producto(id)
);

-- indices para busquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_producto_nombre ON producto(nombre);
CREATE INDEX IF NOT EXISTS idx_venta_fecha     ON venta(fecha);
CREATE INDEX IF NOT EXISTS idx_pedido_estado   ON pedido_proveedor(estado);

-- vista ventas con joins
CREATE OR REPLACE VIEW vista_ventas_detalle AS
SELECT v.id, v.fecha, v.metodo_pago, v.total,
       c.nombre AS cliente_nombre, c.nit,
       e.nombre AS empleado_nombre
FROM venta v
JOIN empleado e ON v.id_empleado = e.id
LEFT JOIN cliente c ON v.id_cliente = c.id;
