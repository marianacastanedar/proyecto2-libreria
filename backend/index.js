require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// base da datos
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const JWT_SECRET = process.env.JWT_SECRET || 'bookinn_secret';

// 
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autorizado' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// auth
app.post('/auth/login', async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) return res.status(400).json({ error: 'Campos requeridos' });
  try {
    const result = await pool.query(
      `SELECT e.*, r.nombre AS rol_nombre
       FROM empleado e
       JOIN rol r ON e.id_rol = r.id
       WHERE e.nombre = $1 AND e.password = $2`,
      [usuario, password]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const emp = result.rows[0];
    const token = jwt.sign({ id: emp.id, nombre: emp.nombre }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, empleado: { id: emp.id, nombre: emp.nombre, apellido: emp.apellido, rol: emp.rol_nombre } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/auth/register', async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) return res.status(400).json({ error: 'Campos requeridos' });
  try {
    const existe = await pool.query('SELECT id FROM empleado WHERE nombre = $1', [usuario]);
    if (existe.rows.length) return res.status(400).json({ error: 'Usuario ya existe' });
    const rol = await pool.query('SELECT id FROM rol LIMIT 1');
    const id_rol = rol.rows[0]?.id || 1;
    await pool.query(
      'INSERT INTO empleado (nombre, apellido, password, id_rol) VALUES ($1, $1, $2, $3)',
      [usuario, password, id_rol]
    );
    res.status(201).json({ mensaje: 'Empleado creado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// productos 
app.get('/productos', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM producto ORDER BY nombre');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/productos/stock-bajo', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM producto
       WHERE stock < (SELECT AVG(stock) FROM producto)
       ORDER BY stock ASC`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/productos', auth, async (req, res) => {
  const { nombre, autor, isbn, editorial, anio, idioma, num_paginas, precio, stock } = req.body;
  if (!nombre || !precio || stock === undefined) return res.status(400).json({ error: 'Nombre, precio y stock son requeridos' });
  try {
    const result = await pool.query(
      `INSERT INTO producto (nombre, autor, isbn, editorial, anio, idioma, num_paginas, precio, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nombre, autor, isbn, editorial, anio || null, idioma, num_paginas || null, precio, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/productos/:id', auth, async (req, res) => {
  const { nombre, autor, isbn, editorial, anio, idioma, num_paginas, precio, stock } = req.body;
  try {
    const result = await pool.query(
      `UPDATE producto SET nombre=$1, autor=$2, isbn=$3, editorial=$4, anio=$5,
       idioma=$6, num_paginas=$7, precio=$8, stock=$9 WHERE id=$10 RETURNING *`,
      [nombre, autor, isbn, editorial, anio || null, idioma, num_paginas || null, precio, stock, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/productos/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM producto WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// clientes
app.get('/clientes', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cliente ORDER BY nombre');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/clientes/nit/:nit', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cliente WHERE nit = $1', [req.params.nit]);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/clientes', auth, async (req, res) => {
  const { nit, nombre, direccion } = req.body;
  if (!nit || !nombre) return res.status(400).json({ error: 'NIT y nombre son requeridos' });
  try {
    const result = await pool.query(
      'INSERT INTO cliente (nit, nombre, direccion) VALUES ($1,$2,$3) RETURNING *',
      [nit, nombre, direccion]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/clientes/:id', auth, async (req, res) => {
  const { nit, nombre, direccion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cliente SET nit=$1, nombre=$2, direccion=$3 WHERE id=$4 RETURNING *',
      [nit, nombre, direccion, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/clientes/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cliente WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// proveedores
app.get('/proveedores', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proveedor ORDER BY nombre');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/proveedores', auth, async (req, res) => {
  const { nombre, telefono, correo, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  try {
    const result = await pool.query(
      'INSERT INTO proveedor (nombre, telefono, correo, direccion) VALUES ($1,$2,$3,$4) RETURNING *',
      [nombre, telefono, correo, direccion]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/proveedores/:id', auth, async (req, res) => {
  const { nombre, telefono, correo, direccion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE proveedor SET nombre=$1, telefono=$2, correo=$3, direccion=$4 WHERE id=$5 RETURNING *',
      [nombre, telefono, correo, direccion, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/proveedores/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM proveedor WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// empleados
app.get('/empleados', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, r.nombre AS rol_nombre, r.horario, r.sueldo
       FROM empleado e JOIN rol r ON e.id_rol = r.id
       ORDER BY e.nombre`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/empleados', auth, async (req, res) => {
  const { nombre, apellido, direccion, password, id_rol } = req.body;
  if (!nombre || !apellido || !password) return res.status(400).json({ error: 'Nombre, apellido y contraseña son requeridos' });
  try {
    const result = await pool.query(
      'INSERT INTO empleado (nombre, apellido, direccion, password, id_rol) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nombre, apellido, direccion, password, id_rol]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/empleados/:id', auth, async (req, res) => {
  const { nombre, apellido, direccion, password, id_rol } = req.body;
  try {
    let query, params;
    if (password) {
      query = 'UPDATE empleado SET nombre=$1, apellido=$2, direccion=$3, password=$4, id_rol=$5 WHERE id=$6 RETURNING *';
      params = [nombre, apellido, direccion, password, id_rol, req.params.id];
    } else {
      query = 'UPDATE empleado SET nombre=$1, apellido=$2, direccion=$3, id_rol=$4 WHERE id=$5 RETURNING *';
      params = [nombre, apellido, direccion, id_rol, req.params.id];
    }
    const result = await pool.query(query, params);
    if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/empleados/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM empleado WHERE id = $1', [req.params.id]);
    res.json({ mensaje: 'Eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/roles', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rol ORDER BY nombre');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ventas
app.get('/ventas', auth, async (req, res) => {
  const limit = req.query.limit ? `LIMIT ${parseInt(req.query.limit)}` : '';
  try {
    const result = await pool.query(
      `SELECT v.*, c.nombre AS cliente_nombre, e.nombre AS empleado_nombre
       FROM venta v
       JOIN empleado e ON v.id_empleado = e.id
       LEFT JOIN cliente c ON v.id_cliente = c.id
       ORDER BY v.fecha DESC ${limit}`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/ventas/hoy', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS total FROM venta WHERE fecha::date = CURRENT_DATE`
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Transacción con begin commit y rollback
app.post('/ventas', auth, async (req, res) => {
  const { nit, metodo_pago, id_empleado, productos } = req.body;
  if (!productos?.length) return res.status(400).json({ error: 'Se requiere al menos un producto' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Buscar o crear cliente
    let clienteId;
    const clienteExiste = await client.query('SELECT id FROM cliente WHERE nit = $1', [nit]);
    if (clienteExiste.rows.length) {
      clienteId = clienteExiste.rows[0].id;
    } else {
      const nuevoCliente = await client.query(
        'INSERT INTO cliente (nit, nombre) VALUES ($1, $2) RETURNING id',
        [nit, `Cliente ${nit}`]
      );
      clienteId = nuevoCliente.rows[0].id;
    }

    // Calcular subtotal y total
    let subtotal = 0;
    for (const p of productos) {
      subtotal += p.precio_unitario * p.cantidad;
    }
    const total = subtotal;

    // Insertar venta
    const ventaResult = await client.query(
      `INSERT INTO venta (fecha, metodo_pago, subtotal, total, id_empleado, id_cliente)
       VALUES (NOW(), $1, $2, $3, $4, $5) RETURNING id`,
      [metodo_pago, subtotal, total, id_empleado, clienteId]
    );
    const ventaId = ventaResult.rows[0].id;

    // Insertar detalle y actualizar stock
    for (const p of productos) {
      await client.query(
        `INSERT INTO detalle_venta (cantidad, precio_unitario, id_venta, id_producto)
         VALUES ($1, $2, $3, $4)`,
        [p.cantidad, p.precio_unitario, ventaId, p.id_producto]
      );
      const stockCheck = await client.query(
        'SELECT stock FROM producto WHERE id = $1', [p.id_producto]
      );
      if (stockCheck.rows[0].stock < p.cantidad) {
        throw new Error(`Stock insuficiente para producto ID ${p.id_producto}`);
      }
      await client.query(
        'UPDATE producto SET stock = stock - $1 WHERE id = $2',
        [p.cantidad, p.id_producto]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: 'Venta registrada', id: ventaId });

  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});


// reportes

// ventas por empleado
app.get('/reportes/ventas-por-empleado', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.nombre AS empleado, r.nombre AS rol,
              COUNT(v.id) AS total_ventas,
              COALESCE(SUM(v.total), 0) AS monto_total
       FROM empleado e
       JOIN rol r ON e.id_rol = r.id
       LEFT JOIN venta v ON v.id_empleado = e.id
       GROUP BY e.id, e.nombre, r.nombre
       ORDER BY monto_total DESC`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// productos más vendidos
app.get('/reportes/productos-mas-vendidos', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.nombre, p.autor,
              SUM(dv.cantidad) AS unidades,
              SUM(dv.cantidad * dv.precio_unitario) AS ingreso
       FROM producto p
       JOIN detalle_venta dv ON dv.id_producto = p.id
       GROUP BY p.id, p.nombre, p.autor
       HAVING SUM(dv.cantidad) > 0
       ORDER BY unidades DESC`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// stock bajo el promedio
app.get('/reportes/stock-bajo', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.nombre, p.editorial, p.stock, p.precio
       FROM producto p
       WHERE EXISTS (
         SELECT 1 FROM producto p2
         WHERE p.stock < (SELECT AVG(stock) FROM producto)
           AND p2.id = p.id
       )
       ORDER BY p.stock ASC`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ventas por mes
app.get('/reportes/ventas-por-mes', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT TO_CHAR(fecha, 'Month') AS mes,
              EXTRACT(YEAR FROM fecha) AS anio,
              COUNT(*) AS num_ventas,
              SUM(total) AS total
       FROM venta
       GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha), TO_CHAR(fecha, 'Month')
       HAVING COUNT(*) > 0
       ORDER BY anio DESC, EXTRACT(MONTH FROM fecha) DESC`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// clientes top
app.get('/reportes/clientes-top', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `WITH resumen_clientes AS (
         SELECT c.id, c.nombre, c.nit,
                COUNT(v.id) AS compras,
                COALESCE(SUM(v.total), 0) AS gasto_total
         FROM cliente c
         LEFT JOIN venta v ON v.id_cliente = c.id
         GROUP BY c.id, c.nombre, c.nit
       )
       SELECT nombre, nit, compras, gasto_total
       FROM resumen_clientes
       ORDER BY gasto_total DESC`
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Crear view al iniciar (si no existe)
pool.query(`
  CREATE OR REPLACE VIEW vista_ventas_detalle AS
  SELECT v.id, v.fecha, v.metodo_pago, v.total,
         c.nombre AS cliente_nombre, c.nit,
         e.nombre AS empleado_nombre
  FROM venta v
  JOIN empleado e ON v.id_empleado = e.id
  LEFT JOIN cliente c ON v.id_cliente = c.id
`).catch(err => console.error('Error creando view:', err));

app.listen(3000, () => console.log('Bookinn backend corriendo en puerto 3000'));