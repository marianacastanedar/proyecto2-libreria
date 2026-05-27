require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app    = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'bookinn_secret_p3';

// permisos por rol
const PERMISOS = {
  cajero:                 ['ventas', 'clientes'],
  vendedor:               ['productos', 'ventas', 'clientes'],
  gerente_personal:       ['empleados'],
  responsable_marketing:  ['productos', 'proveedores'],
  gerente_financiero:     ['reportes', 'ventas'],
};

// middleware autenticacion
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no autorizado' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'token invalido' });
  }
}

// middleware verificar rol
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol))
      return res.status(403).json({ error: `acceso denegado` });
    next();
  };
}

// login
app.post('/auth/login', async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) return res.status(400).json({ error: 'campos requeridos' });
  try {
    const emp = await prisma.empleado.findFirst({
      where: { nombre: usuario, password },
      include: { rol: true }
    });
    if (!emp) return res.status(401).json({ error: 'credenciales incorrectas' });

    const token = jwt.sign(
      { id: emp.id, nombre: emp.nombre, rol: emp.rol.nombre },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      empleado: { id: emp.id, nombre: emp.nombre, apellido: emp.apellido, rol: emp.rol.nombre },
      permisos: PERMISOS[emp.rol.nombre] || []
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/auth/register', async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) return res.status(400).json({ error: 'campos requeridos' });
  try {
    const existe = await prisma.empleado.findFirst({ where: { nombre: usuario } });
    if (existe) return res.status(400).json({ error: 'usuario ya existe' });
    const rol = await prisma.rol.findFirst();
    await prisma.empleado.create({
      data: { nombre: usuario, apellido: usuario, password, id_rol: rol?.id || 1 }
    });
    res.status(201).json({ mensaje: 'empleado creado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// productos usando prisma crud
app.get('/productos', auth, async (req, res) => {
  try {
    const data = await prisma.producto.findMany({ orderBy: { nombre: 'asc' } });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/productos/stock-bajo', auth, async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT * FROM producto
      WHERE stock < (SELECT AVG(stock) FROM producto)
      ORDER BY stock ASC`;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/productos', auth, requireRole('vendedor', 'responsable_marketing'), async (req, res) => {
  const { nombre, autor, isbn, editorial, anio, idioma, num_paginas, precio, stock } = req.body;
  if (!nombre || !precio || stock === undefined) return res.status(400).json({ error: 'nombre precio stock requeridos' });
  try {
    const p = await prisma.producto.create({
      data: { nombre, autor, isbn, editorial, anio: anio ? parseInt(anio) : null, idioma, num_paginas: num_paginas ? parseInt(num_paginas) : null, precio: parseFloat(precio), stock: parseInt(stock) }
    });
    res.status(201).json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/productos/:id', auth, requireRole('vendedor', 'responsable_marketing'), async (req, res) => {
  const { nombre, autor, isbn, editorial, anio, idioma, num_paginas, precio, stock } = req.body;
  try {
    const p = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: { nombre, autor, isbn, editorial, anio: anio ? parseInt(anio) : null, idioma, num_paginas: num_paginas ? parseInt(num_paginas) : null, precio: parseFloat(precio), stock: parseInt(stock) }
    });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/productos/:id', auth, requireRole('responsable_marketing'), async (req, res) => {
  try {
    await prisma.producto.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ mensaje: 'eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// clientes usando prisma crud
app.get('/clientes', auth, async (req, res) => {
  try {
    const data = await prisma.cliente.findMany({ orderBy: { nombre: 'asc' } });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/clientes/nit/:nit', auth, async (req, res) => {
  try {
    const c = await prisma.cliente.findFirst({ where: { nit: req.params.nit } });
    if (!c) return res.status(404).json({ error: 'no encontrado' });
    res.json(c);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/clientes', auth, async (req, res) => {
  const { nit, nombre, direccion } = req.body;
  if (!nit || !nombre) return res.status(400).json({ error: 'nit y nombre requeridos' });
  try {
    const c = await prisma.cliente.create({ data: { nit, nombre, direccion } });
    res.status(201).json(c);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/clientes/:id', auth, async (req, res) => {
  const { nit, nombre, direccion } = req.body;
  try {
    const c = await prisma.cliente.update({ where: { id: parseInt(req.params.id) }, data: { nit, nombre, direccion } });
    res.json(c);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/clientes/:id', auth, async (req, res) => {
  try {
    await prisma.cliente.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ mensaje: 'eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// proveedores usando prisma crud
app.get('/proveedores', auth, async (req, res) => {
  try {
    const data = await prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/proveedores', auth, requireRole('responsable_marketing'), async (req, res) => {
  const { nombre, telefono, correo, direccion } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre requerido' });
  try {
    const p = await prisma.proveedor.create({ data: { nombre, telefono, correo, direccion } });
    res.status(201).json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/proveedores/:id', auth, requireRole('responsable_marketing'), async (req, res) => {
  const { nombre, telefono, correo, direccion } = req.body;
  try {
    const p = await prisma.proveedor.update({ where: { id: parseInt(req.params.id) }, data: { nombre, telefono, correo, direccion } });
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/proveedores/:id', auth, requireRole('responsable_marketing'), async (req, res) => {
  try {
    await prisma.proveedor.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ mensaje: 'eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// empleados usando prisma crud
app.get('/empleados', auth, requireRole('gerente_personal'), async (req, res) => {
  try {
    const data = await prisma.empleado.findMany({ include: { rol: true }, orderBy: { nombre: 'asc' } });
    res.json(data.map(e => ({ ...e, rol_nombre: e.rol.nombre, horario: e.rol.horario, sueldo: e.rol.sueldo })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/empleados', auth, requireRole('gerente_personal'), async (req, res) => {
  const { nombre, apellido, direccion, password, id_rol } = req.body;
  if (!nombre || !apellido || !password) return res.status(400).json({ error: 'campos requeridos' });
  try {
    const e = await prisma.empleado.create({ data: { nombre, apellido, direccion, password, id_rol: parseInt(id_rol) } });
    res.status(201).json(e);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/empleados/:id', auth, requireRole('gerente_personal'), async (req, res) => {
  const { nombre, apellido, direccion, password, id_rol } = req.body;
  try {
    const data = { nombre, apellido, direccion, id_rol: parseInt(id_rol) };
    if (password) data.password = password;
    const e = await prisma.empleado.update({ where: { id: parseInt(req.params.id) }, data });
    res.json(e);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/empleados/:id', auth, requireRole('gerente_personal'), async (req, res) => {
  try {
    await prisma.empleado.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ mensaje: 'eliminado' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/roles', auth, async (req, res) => {
  try {
    const data = await prisma.rol.findMany();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ventas
app.get('/ventas', auth, async (req, res) => {
  const limit = req.query.limit ? `LIMIT ${parseInt(req.query.limit)}` : '';
  try {
    const data = await prisma.$queryRawUnsafe(`
      SELECT v.*, c.nombre AS cliente_nombre, e.nombre AS empleado_nombre
      FROM venta v
      JOIN empleado e ON v.id_empleado = e.id
      LEFT JOIN cliente c ON v.id_cliente = c.id
      ORDER BY v.fecha DESC ${limit}`);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/ventas/hoy', auth, async (req, res) => {
  try {
    const data = await prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM venta WHERE fecha::date = CURRENT_DATE`;
    res.json(data[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// registrar venta llamando fn_registrar_venta sp1
app.post('/ventas', auth, requireRole('cajero', 'vendedor'), async (req, res) => {
  const { nit, metodo_pago, id_empleado, productos } = req.body;
  if (!productos?.length) return res.status(400).json({ error: 'al menos un producto requerido' });
  try {
    const productosJson = JSON.stringify(productos);
    const result = await prisma.$queryRaw`
      SELECT * FROM fn_registrar_venta(
        ${nit}::varchar,
        ${metodo_pago}::varchar,
        ${id_empleado}::int,
        ${productosJson}::jsonb
      )`;
    const row = result[0];
    if (row.id_venta === 0) return res.status(500).json({ error: row.mensaje });
    res.status(201).json({ id: row.id_venta, mensaje: row.mensaje });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// llamar sp_crear_o_buscar_cliente sp2 con inout
app.post('/sp/cliente', auth, async (req, res) => {
  const { nit, nombre } = req.body;
  try {
    const result = await prisma.$queryRawUnsafe(
      'CALL sp_crear_o_buscar_cliente($1::varchar, $2::varchar, 0::int)',
      nit, nombre || null
    );
    res.json({ id_cliente: result[0]?.p_id_cliente });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// llamar fn_verificar_stock sp3
app.post('/sp/stock', auth, async (req, res) => {
  const { id_producto, cantidad } = req.body;
  try {
    const result = await prisma.$queryRaw`
      SELECT fn_verificar_stock(${id_producto}::int, ${cantidad}::int) AS ok`;
    res.json(result[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// llamar fn_cancelar_pedido sp4
app.post('/sp/cancelar-pedido/:id', auth, requireRole('responsable_marketing'), async (req, res) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT fn_cancelar_pedido(${parseInt(req.params.id)}::int) AS resultado`;
    res.json(result[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// llamar fn_reporte_ventas_periodo sp5
app.get('/sp/reporte-periodo', auth, requireRole('gerente_financiero'), async (req, res) => {
  const { inicio, fin } = req.query;
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM fn_reporte_ventas_periodo(${inicio}::date, ${fin}::date)`;
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// reportes
app.get('/reportes/ventas-por-empleado', auth, requireRole('gerente_financiero'), async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT e.nombre AS empleado, r.nombre AS rol,
             COUNT(v.id) AS total_ventas, COALESCE(SUM(v.total),0) AS monto_total
      FROM empleado e
      JOIN rol r ON e.id_rol = r.id
      LEFT JOIN venta v ON v.id_empleado = e.id
      GROUP BY e.id, e.nombre, r.nombre
      ORDER BY monto_total DESC`;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/reportes/productos-mas-vendidos', auth, requireRole('gerente_financiero', 'responsable_marketing'), async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT p.nombre, p.autor, SUM(dv.cantidad) AS unidades,
             SUM(dv.cantidad * dv.precio_unitario) AS ingreso
      FROM producto p JOIN detalle_venta dv ON dv.id_producto = p.id
      GROUP BY p.id, p.nombre, p.autor HAVING SUM(dv.cantidad) > 0
      ORDER BY unidades DESC`;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/reportes/stock-bajo', auth, async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT p.nombre, p.editorial, p.stock, p.precio FROM producto p
      WHERE EXISTS (SELECT 1 FROM producto p2 WHERE p.stock < (SELECT AVG(stock) FROM producto) AND p2.id = p.id)
      ORDER BY p.stock ASC`;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/reportes/ventas-por-mes', auth, requireRole('gerente_financiero'), async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT TO_CHAR(fecha,'Month') AS mes, EXTRACT(YEAR FROM fecha) AS anio,
             COUNT(*) AS num_ventas, SUM(total) AS total
      FROM venta GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha), TO_CHAR(fecha,'Month')
      HAVING COUNT(*) > 0 ORDER BY anio DESC, EXTRACT(MONTH FROM fecha) DESC`;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/reportes/clientes-top', auth, requireRole('gerente_financiero'), async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      WITH resumen AS (
        SELECT c.id, c.nombre, c.nit, COUNT(v.id) AS compras, COALESCE(SUM(v.total),0) AS gasto_total
        FROM cliente c LEFT JOIN venta v ON v.id_cliente = c.id GROUP BY c.id, c.nombre, c.nit
      ) SELECT nombre, nit, compras, gasto_total FROM resumen ORDER BY gasto_total DESC`;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(3000, () => console.log('backend corriendo puerto 3000'));