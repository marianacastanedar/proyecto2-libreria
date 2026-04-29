// ── DASHBOARD ─────────────────────────────────────────
async function renderizarDashboard() {
  const contenedor = document.getElementById('vista-dashboard');
  contenedor.innerHTML = `
    <div class="page-header"><h1>Bienvenido</h1><p>Resumen general de la librería</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Productos</div><div class="stat-value" id="stat-productos">—</div></div>
      <div class="stat-card"><div class="stat-label">Clientes</div><div class="stat-value" id="stat-clientes">—</div></div>
      <div class="stat-card"><div class="stat-label">Ventas hoy</div><div class="stat-value" id="stat-ventas">—</div></div>
      <div class="stat-card"><div class="stat-label">Stock bajo</div><div class="stat-value" id="stat-stock">—</div></div>
    </div>
    <div class="card">
      <h3 style="font-family:'Playfair Display',serif;font-weight:900;margin-bottom:1.2rem;">Ventas recientes</h3>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Empleado</th><th>Total</th><th>Método</th></tr></thead>
          <tbody id="tbody-ventas-recientes"></tbody>
        </table>
      </div>
    </div>`;

  try {
    const [productos, clientes, ventasHoy, stockBajo, ventas] = await Promise.all([
      apiFetch('/productos').then(r => r.json()),
      apiFetch('/clientes').then(r => r.json()),
      apiFetch('/ventas/hoy').then(r => r.json()),
      apiFetch('/productos/stock-bajo').then(r => r.json()),
      apiFetch('/ventas?limit=8').then(r => r.json()),
    ]);
    document.getElementById('stat-productos').textContent = productos.length ?? 0;
    document.getElementById('stat-clientes').textContent = clientes.length ?? 0;
    document.getElementById('stat-ventas').textContent = ventasHoy.total ?? 0;
    document.getElementById('stat-stock').textContent = stockBajo.length ?? 0;

    const tbody = document.getElementById('tbody-ventas-recientes');
    tbody.innerHTML = ventas.length
      ? ventas.map(v => `<tr>
          <td>#${v.id}</td>
          <td>${new Date(v.fecha).toLocaleDateString('es-GT')}</td>
          <td>${v.cliente_nombre || 'N/A'}</td>
          <td>${v.empleado_nombre || 'N/A'}</td>
          <td>Q${parseFloat(v.total).toFixed(2)}</td>
          <td><span class="badge ${v.metodo_pago==='efectivo'?'badge-green':'badge-yellow'}">${v.metodo_pago}</span></td>
        </tr>`).join('')
      : '<tr><td colspan="6" style="text-align:center;color:var(--light);padding:2rem;">Sin ventas</td></tr>';
  } catch(e) {}
}

// ── PRODUCTOS ─────────────────────────────────────────
let _productos = [];

async function renderizarProductos() {
  const contenedor = document.getElementById('vista-productos');
  contenedor.innerHTML = `
    <div class="topbar">
      <div class="page-header" style="margin-bottom:0"><h1>Productos</h1><p>Catálogo de libros</p></div>
      <div class="topbar-actions">
        <input class="search-input" id="buscar-producto" placeholder="🔍 Buscar libro..." oninput="filtrarProductos()">
        <button class="btn-solid" onclick="abrirFormProducto()">+ Agregar libro</button>
      </div>
    </div>
    <div id="alert-productos" class="alert"></div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>#</th><th>Nombre</th><th>Autor</th><th>Editorial</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
        <tbody id="tbody-productos"></tbody>
      </table>
    </div>`;

  await cargarTablaProductos();
}

async function cargarTablaProductos() {
  const res = await apiFetch('/productos');
  _productos = await res.json();
  renderTablaProductos(_productos);
}

function renderTablaProductos(data) {
  const tbody = document.getElementById('tbody-productos');
  if (!tbody) return;
  tbody.innerHTML = data.length
    ? data.map(p => `<tr>
        <td>#${p.id}</td>
        <td style="font-weight:600">${p.nombre}</td>
        <td>${p.autor||'—'}</td>
        <td>${p.editorial||'—'}</td>
        <td>Q${parseFloat(p.precio).toFixed(2)}</td>
        <td><span class="badge ${p.stock>10?'badge-green':p.stock>0?'badge-yellow':'badge-red'}">${p.stock}</span></td>
        <td style="display:flex;gap:0.5rem">
          <button class="btn-edit" onclick="abrirFormProducto(${p.id})">Editar</button>
          <button class="btn-danger" onclick="eliminarProducto(${p.id})">Eliminar</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--light);padding:2rem">Sin productos</td></tr>';
}

function filtrarProductos() {
  const q = document.getElementById('buscar-producto').value.toLowerCase();
  renderTablaProductos(_productos.filter(p => p.nombre.toLowerCase().includes(q) || (p.autor||'').toLowerCase().includes(q)));
}

function abrirFormProducto(id = null) {
  const p = id ? _productos.find(x => x.id === id) : null;
  abrirModal(`
    <h3>${p ? 'Editar libro' : 'Agregar libro'}</h3>
    <div class="form-group"><label>Nombre</label><input type="text" id="f-nombre" value="${p?.nombre||''}"></div>
    <div class="form-group"><label>Autor</label><input type="text" id="f-autor" value="${p?.autor||''}"></div>
    <div class="form-group"><label>ISBN</label><input type="text" id="f-isbn" value="${p?.isbn||''}"></div>
    <div class="form-group"><label>Editorial</label><input type="text" id="f-editorial" value="${p?.editorial||''}"></div>
    <div class="form-group"><label>Año</label><input type="number" id="f-anio" value="${p?.anio||''}"></div>
    <div class="form-group"><label>Idioma</label><input type="text" id="f-idioma" value="${p?.idioma||''}"></div>
    <div class="form-group"><label>Páginas</label><input type="number" id="f-paginas" value="${p?.num_paginas||''}"></div>
    <div class="form-group"><label>Precio (Q)</label><input type="number" id="f-precio" step="0.01" value="${p?.precio||''}"></div>
    <div class="form-group"><label>Stock</label><input type="number" id="f-stock" value="${p?.stock||''}"></div>
    <div id="alert-modal" class="alert"></div>
    <div class="modal-actions">
      <button class="btn-edit" onclick="cerrarModal()">Cancelar</button>
      <button class="btn-solid" onclick="guardarProducto(${id||'null'})">Guardar</button>
    </div>`);
}

async function guardarProducto(id) {
  const body = {
    nombre: document.getElementById('f-nombre').value,
    autor: document.getElementById('f-autor').value,
    isbn: document.getElementById('f-isbn').value,
    editorial: document.getElementById('f-editorial').value,
    anio: document.getElementById('f-anio').value,
    idioma: document.getElementById('f-idioma').value,
    num_paginas: document.getElementById('f-paginas').value,
    precio: document.getElementById('f-precio').value,
    stock: document.getElementById('f-stock').value,
  };
  if (!body.nombre || !body.precio || !body.stock) {
    mostrarAlert('alert-modal', 'Nombre, precio y stock son obligatorios', 'error'); return;
  }
  const res = await apiFetch(id ? `/productos/${id}` : '/productos', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  if (res.ok) {
    cerrarModal();
    mostrarAlert('alert-productos', id ? 'Producto actualizado' : 'Producto creado', 'success');
    cargarTablaProductos();
  } else {
    const d = await res.json();
    mostrarAlert('alert-modal', d.error || 'Error al guardar', 'error');
  }
}

async function eliminarProducto(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  const res = await apiFetch(`/productos/${id}`, { method: 'DELETE' });
  if (res.ok) { mostrarAlert('alert-productos', 'Producto eliminado', 'success'); cargarTablaProductos(); }
  else mostrarAlert('alert-productos', 'No se pudo eliminar', 'error');
}

// ── CLIENTES ──────────────────────────────────────────
let _clientes = [];

async function renderizarClientes() {
  const contenedor = document.getElementById('vista-clientes');
  contenedor.innerHTML = `
    <div class="topbar">
      <div class="page-header" style="margin-bottom:0"><h1>Clientes</h1><p>Registro de compradores</p></div>
      <div class="topbar-actions">
        <input class="search-input" id="buscar-cliente" placeholder="🔍 Buscar por NIT o nombre..." oninput="filtrarClientes()">
        <button class="btn-solid" onclick="abrirFormCliente()">+ Nuevo cliente</button>
      </div>
    </div>
    <div id="alert-clientes" class="alert"></div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>#</th><th>NIT</th><th>Nombre</th><th>Dirección</th><th>Acciones</th></tr></thead>
        <tbody id="tbody-clientes"></tbody>
      </table>
    </div>`;
  await cargarTablaClientes();
}

async function cargarTablaClientes() {
  const res = await apiFetch('/clientes');
  _clientes = await res.json();
  renderTablaClientes(_clientes);
}

function renderTablaClientes(data) {
  const tbody = document.getElementById('tbody-clientes');
  if (!tbody) return;
  tbody.innerHTML = data.length
    ? data.map(c => `<tr>
        <td>#${c.id}</td>
        <td style="font-family:monospace;color:var(--light)">${c.nit}</td>
        <td style="font-weight:600">${c.nombre}</td>
        <td>${c.direccion||'—'}</td>
        <td style="display:flex;gap:0.5rem">
          <button class="btn-edit" onclick="abrirFormCliente(${c.id})">Editar</button>
          <button class="btn-danger" onclick="eliminarCliente(${c.id})">Eliminar</button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--light);padding:2rem">Sin clientes</td></tr>';
}

function filtrarClientes() {
  const q = document.getElementById('buscar-cliente').value.toLowerCase();
  renderTablaClientes(_clientes.filter(c => c.nombre.toLowerCase().includes(q) || c.nit.toLowerCase().includes(q)));
}

function abrirFormCliente(id = null) {
  const c = id ? _clientes.find(x => x.id === id) : null;
  abrirModal(`
    <h3>${c ? 'Editar cliente' : 'Nuevo cliente'}</h3>
    <div class="form-group"><label>NIT</label><input type="text" id="f-nit" value="${c?.nit||''}"></div>
    <div class="form-group"><label>Nombre</label><input type="text" id="f-nombre" value="${c?.nombre||''}"></div>
    <div class="form-group"><label>Dirección</label><input type="text" id="f-direccion" value="${c?.direccion||''}"></div>
    <div id="alert-modal" class="alert"></div>
    <div class="modal-actions">
      <button class="btn-edit" onclick="cerrarModal()">Cancelar</button>
      <button class="btn-solid" onclick="guardarCliente(${id||'null'})">Guardar</button>
    </div>`);
}

async function guardarCliente(id) {
  const body = { nit: document.getElementById('f-nit').value, nombre: document.getElementById('f-nombre').value, direccion: document.getElementById('f-direccion').value };
  if (!body.nit || !body.nombre) { mostrarAlert('alert-modal', 'NIT y nombre son obligatorios', 'error'); return; }
  const res = await apiFetch(id ? `/clientes/${id}` : '/clientes', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  if (res.ok) { cerrarModal(); mostrarAlert('alert-clientes', id ? 'Cliente actualizado' : 'Cliente creado', 'success'); cargarTablaClientes(); }
  else { const d = await res.json(); mostrarAlert('alert-modal', d.error || 'Error', 'error'); }
}

async function eliminarCliente(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  const res = await apiFetch(`/clientes/${id}`, { method: 'DELETE' });
  if (res.ok) { mostrarAlert('alert-clientes', 'Cliente eliminado', 'success'); cargarTablaClientes(); }
  else mostrarAlert('alert-clientes', 'No se pudo eliminar', 'error');
}

// ── VENTAS ────────────────────────────────────────────
let _carrito = [];
let _clienteVentaId = null;
let _productosVenta = [];

async function renderizarVentas() {
  const contenedor = document.getElementById('vista-ventas');
  contenedor.innerHTML = `
    <div class="topbar">
      <div class="page-header" style="margin-bottom:0"><h1>Ventas</h1><p>Registro de transacciones</p></div>
      <div class="topbar-actions">
        <button class="btn-solid" onclick="abrirFormVenta()">+ Nueva venta</button>
      </div>
    </div>
    <div id="alert-ventas" class="alert"></div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Empleado</th><th>Subtotal</th><th>Total</th><th>Método</th></tr></thead>
        <tbody id="tbody-ventas"></tbody>
      </table>
    </div>`;
  await cargarTablaVentas();
}

async function cargarTablaVentas() {
  const res = await apiFetch('/ventas');
  const data = await res.json();
  const tbody = document.getElementById('tbody-ventas');
  if (!tbody) return;
  tbody.innerHTML = data.length
    ? data.map(v => `<tr>
        <td>#${v.id}</td>
        <td>${new Date(v.fecha).toLocaleString('es-GT')}</td>
        <td>${v.cliente_nombre||'N/A'}</td>
        <td>${v.empleado_nombre||'N/A'}</td>
        <td>Q${parseFloat(v.subtotal).toFixed(2)}</td>
        <td>Q${parseFloat(v.total).toFixed(2)}</td>
        <td><span class="badge ${v.metodo_pago==='efectivo'?'badge-green':'badge-yellow'}">${v.metodo_pago}</span></td>
      </tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--light);padding:2rem">Sin ventas</td></tr>';
}

async function abrirFormVenta() {
  _carrito = []; _clienteVentaId = null;
  const res = await apiFetch('/productos');
  _productosVenta = await res.json();

  abrirModal(`
    <h3>Nueva venta</h3>
    <div class="form-group">
      <label>NIT del cliente</label>
      <div style="display:flex;gap:0.5rem">
        <input type="text" id="f-nit" placeholder="1234567-8" style="flex:1">
        <button class="btn-edit" onclick="buscarClienteVenta()">Buscar</button>
      </div>
      <p id="info-cliente" style="font-size:0.8rem;color:var(--light);margin-top:0.4rem"></p>
    </div>
    <div class="form-group">
      <label>Método de pago</label>
      <select id="f-metodo"><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option></select>
    </div>
    <div class="form-group">
      <label>Agregar producto</label>
      <div style="display:flex;gap:0.5rem">
        <select id="f-prod-sel" style="flex:1;padding:0.7rem;background:rgba(202,169,138,0.1);border:1px solid rgba(202,169,138,0.2);border-radius:8px;color:var(--white);font-family:'DM Sans',sans-serif">
          ${_productosVenta.map(p => `<option value="${p.id}" data-precio="${p.precio}">${p.nombre} — Q${parseFloat(p.precio).toFixed(2)}</option>`).join('')}
        </select>
        <input type="number" id="f-cant" value="1" min="1" style="width:70px;padding:0.7rem;background:rgba(202,169,138,0.1);border:1px solid rgba(202,169,138,0.2);border-radius:8px;color:var(--white);font-family:'DM Sans',sans-serif">
        <button class="btn-edit" onclick="agregarAlCarrito()">+</button>
      </div>
    </div>
    <div id="lista-carrito" style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem"></div>
    <div style="margin-top:1rem;padding:1rem;background:rgba(154,104,58,0.15);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
      <span style="color:var(--light);font-size:0.9rem">Total</span>
      <span id="total-venta" style="font-family:'Playfair Display',serif;font-weight:900;font-size:1.4rem">Q0.00</span>
    </div>
    <div id="alert-modal" class="alert"></div>
    <div class="modal-actions">
      <button class="btn-edit" onclick="cerrarModal()">Cancelar</button>
      <button class="btn-solid" onclick="guardarVenta()">Registrar venta</button>
    </div>`);
}

async function buscarClienteVenta() {
  const nit = document.getElementById('f-nit').value.trim();
  if (!nit) return;
  const res = await apiFetch(`/clientes/nit/${nit}`);
  const info = document.getElementById('info-cliente');
  if (res.ok) { const c = await res.json(); _clienteVentaId = c.id; info.textContent = c.nombre; }
  else { _clienteVentaId = null; info.textContent = 'No encontrado — se creará al guardar'; }
}

function agregarAlCarrito() {
  const sel = document.getElementById('f-prod-sel');
  const id = parseInt(sel.value);
  const precio = parseFloat(sel.options[sel.selectedIndex].dataset.precio);
  const nombre = sel.options[sel.selectedIndex].text.split(' — ')[0];
  const cantidad = parseInt(document.getElementById('f-cant').value);
  const existente = _carrito.find(i => i.id === id);
  if (existente) existente.cantidad += cantidad;
  else _carrito.push({ id, nombre, precio, cantidad });
  renderCarrito();
}

function renderCarrito() {
  const lista = document.getElementById('lista-carrito');
  if (!lista) return;
  lista.innerHTML = _carrito.map(i => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 1rem;background:rgba(202,169,138,0.08);border-radius:8px;font-size:0.85rem">
      <span>${i.nombre}</span>
      <span style="color:var(--light)">${i.cantidad}x Q${i.precio.toFixed(2)}</span>
      <span style="font-weight:600">Q${(i.cantidad*i.precio).toFixed(2)}</span>
      <button class="btn-danger" style="padding:0.3rem 0.6rem" onclick="quitarDelCarrito(${i.id})">✕</button>
    </div>`).join('');
  const total = _carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
  document.getElementById('total-venta').textContent = `Q${total.toFixed(2)}`;
}

function quitarDelCarrito(id) { _carrito = _carrito.filter(i => i.id !== id); renderCarrito(); }

async function guardarVenta() {
  if (!_carrito.length) { mostrarAlert('alert-modal', 'Agregá al menos un producto', 'error'); return; }
  const nit = document.getElementById('f-nit').value.trim();
  if (!nit) { mostrarAlert('alert-modal', 'Ingresá el NIT del cliente', 'error'); return; }
  const emp = getEmpleado();
  const body = { nit, metodo_pago: document.getElementById('f-metodo').value, id_empleado: emp.id, productos: _carrito.map(i => ({ id_producto: i.id, cantidad: i.cantidad, precio_unitario: i.precio })) };
  const res = await apiFetch('/ventas', { method: 'POST', body: JSON.stringify(body) });
  if (res.ok) { cerrarModal(); mostrarAlert('alert-ventas', 'Venta registrada', 'success'); cargarTablaVentas(); }
  else { const d = await res.json(); mostrarAlert('alert-modal', d.error || 'Error', 'error'); }
}

// ── PROVEEDORES ───────────────────────────────────────
let _proveedores = [];

async function renderizarProveedores() {
  document.getElementById('vista-proveedores').innerHTML = `
    <div class="topbar">
      <div class="page-header" style="margin-bottom:0"><h1>Proveedores</h1><p>Gestión de proveedores</p></div>
      <div class="topbar-actions"><button class="btn-solid" onclick="abrirFormProveedor()">+ Nuevo proveedor</button></div>
    </div>
    <div id="alert-proveedores" class="alert"></div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>#</th><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Dirección</th><th>Acciones</th></tr></thead>
        <tbody id="tbody-proveedores"></tbody>
      </table>
    </div>`;
  const res = await apiFetch('/proveedores');
  _proveedores = await res.json();
  const tbody = document.getElementById('tbody-proveedores');
  tbody.innerHTML = _proveedores.length
    ? _proveedores.map(p => `<tr>
        <td>#${p.id}</td><td style="font-weight:600">${p.nombre}</td><td>${p.telefono||'—'}</td>
        <td>${p.correo||'—'}</td><td>${p.direccion||'—'}</td>
        <td style="display:flex;gap:0.5rem">
          <button class="btn-edit" onclick="abrirFormProveedor(${p.id})">Editar</button>
          <button class="btn-danger" onclick="eliminarProveedor(${p.id})">Eliminar</button>
        </td></tr>`).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--light);padding:2rem">Sin proveedores</td></tr>';
}

function abrirFormProveedor(id = null) {
  const p = id ? _proveedores.find(x => x.id === id) : null;
  abrirModal(`
    <h3>${p ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
    <div class="form-group"><label>Nombre</label><input type="text" id="f-nombre" value="${p?.nombre||''}"></div>
    <div class="form-group"><label>Teléfono</label><input type="text" id="f-telefono" value="${p?.telefono||''}"></div>
    <div class="form-group"><label>Correo</label><input type="email" id="f-correo" value="${p?.correo||''}"></div>
    <div class="form-group"><label>Dirección</label><input type="text" id="f-direccion" value="${p?.direccion||''}"></div>
    <div id="alert-modal" class="alert"></div>
    <div class="modal-actions">
      <button class="btn-edit" onclick="cerrarModal()">Cancelar</button>
      <button class="btn-solid" onclick="guardarProveedor(${id||'null'})">Guardar</button>
    </div>`);
}

async function guardarProveedor(id) {
  const body = { nombre: document.getElementById('f-nombre').value, telefono: document.getElementById('f-telefono').value, correo: document.getElementById('f-correo').value, direccion: document.getElementById('f-direccion').value };
  if (!body.nombre) { mostrarAlert('alert-modal', 'El nombre es obligatorio', 'error'); return; }
  const res = await apiFetch(id ? `/proveedores/${id}` : '/proveedores', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  if (res.ok) { cerrarModal(); mostrarAlert('alert-proveedores', id ? 'Actualizado' : 'Creado', 'success'); renderizarProveedores(); }
  else { const d = await res.json(); mostrarAlert('alert-modal', d.error || 'Error', 'error'); }
}

async function eliminarProveedor(id) {
  if (!confirm('¿Eliminar?')) return;
  const res = await apiFetch(`/proveedores/${id}`, { method: 'DELETE' });
  if (res.ok) { mostrarAlert('alert-proveedores', 'Eliminado', 'success'); renderizarProveedores(); }
}

// ── EMPLEADOS ─────────────────────────────────────────
let _empleados = [];
let _roles = [];

async function renderizarEmpleados() {
  document.getElementById('vista-empleados').innerHTML = `
    <div class="topbar">
      <div class="page-header" style="margin-bottom:0"><h1>Empleados</h1><p>Gestión del personal</p></div>
      <div class="topbar-actions"><button class="btn-solid" onclick="abrirFormEmpleado()">+ Nuevo empleado</button></div>
    </div>
    <div id="alert-empleados" class="alert"></div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>#</th><th>Nombre</th><th>Apellido</th><th>Rol</th><th>Horario</th><th>Sueldo</th><th>Acciones</th></tr></thead>
        <tbody id="tbody-empleados"></tbody>
      </table>
    </div>`;
  const [resEmp, resRoles] = await Promise.all([apiFetch('/empleados'), apiFetch('/roles')]);
  _empleados = await resEmp.json();
  _roles = await resRoles.json();
  const tbody = document.getElementById('tbody-empleados');
  tbody.innerHTML = _empleados.length
    ? _empleados.map(e => `<tr>
        <td>#${e.id}</td><td style="font-weight:600">${e.nombre}</td><td>${e.apellido}</td>
        <td>${e.rol_nombre||'—'}</td><td style="font-size:0.8rem;color:var(--light)">${e.horario||'—'}</td>
        <td>Q${parseFloat(e.sueldo||0).toFixed(2)}</td>
        <td style="display:flex;gap:0.5rem">
          <button class="btn-edit" onclick="abrirFormEmpleado(${e.id})">Editar</button>
          <button class="btn-danger" onclick="eliminarEmpleado(${e.id})">Eliminar</button>
        </td></tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--light);padding:2rem">Sin empleados</td></tr>';
}

function abrirFormEmpleado(id = null) {
  const e = id ? _empleados.find(x => x.id === id) : null;
  abrirModal(`
    <h3>${e ? 'Editar empleado' : 'Nuevo empleado'}</h3>
    <div class="form-group"><label>Nombre</label><input type="text" id="f-nombre" value="${e?.nombre||''}"></div>
    <div class="form-group"><label>Apellido</label><input type="text" id="f-apellido" value="${e?.apellido||''}"></div>
    <div class="form-group"><label>Dirección</label><input type="text" id="f-direccion" value="${e?.direccion||''}"></div>
    <div class="form-group"><label>Contraseña${e?' (dejar vacío para no cambiar)':''}</label><input type="password" id="f-password"></div>
    <div class="form-group"><label>Rol</label>
      <select id="f-rol">${_roles.map(r=>`<option value="${r.id}" ${e?.id_rol===r.id?'selected':''}>${r.nombre}</option>`).join('')}</select>
    </div>
    <div id="alert-modal" class="alert"></div>
    <div class="modal-actions">
      <button class="btn-edit" onclick="cerrarModal()">Cancelar</button>
      <button class="btn-solid" onclick="guardarEmpleado(${id||'null'})">Guardar</button>
    </div>`);
}

async function guardarEmpleado(id) {
  const password = document.getElementById('f-password').value;
  const body = { nombre: document.getElementById('f-nombre').value, apellido: document.getElementById('f-apellido').value, direccion: document.getElementById('f-direccion').value, id_rol: document.getElementById('f-rol').value, ...(password && { password }) };
  if (!body.nombre || !body.apellido) { mostrarAlert('alert-modal', 'Nombre y apellido son obligatorios', 'error'); return; }
  if (!id && !password) { mostrarAlert('alert-modal', 'La contraseña es obligatoria para nuevos empleados', 'error'); return; }
  const res = await apiFetch(id ? `/empleados/${id}` : '/empleados', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  if (res.ok) { cerrarModal(); mostrarAlert('alert-empleados', id ? 'Actualizado' : 'Creado', 'success'); renderizarEmpleados(); }
  else { const d = await res.json(); mostrarAlert('alert-modal', d.error || 'Error', 'error'); }
}

async function eliminarEmpleado(id) {
  if (!confirm('¿Eliminar empleado?')) return;
  const res = await apiFetch(`/empleados/${id}`, { method: 'DELETE' });
  if (res.ok) { mostrarAlert('alert-empleados', 'Eliminado', 'success'); renderizarEmpleados(); }
}

// ── REPORTES ──────────────────────────────────────────
const REPORTES_CFG = {
  'ventas-por-empleado':    { desc: 'JOIN entre empleado y venta — total agrupado por empleado.', cols: ['Empleado','Rol','Total ventas','Monto total'], keys: ['empleado','rol','total_ventas','monto_total'] },
  'productos-mas-vendidos': { desc: 'JOIN entre producto y detalle_venta con GROUP BY.', cols: ['Producto','Autor','Unidades vendidas','Ingreso total'], keys: ['nombre','autor','unidades','ingreso'] },
  'stock-bajo':             { desc: 'Subquery con EXISTS — productos bajo el promedio de stock.', cols: ['Producto','Editorial','Stock','Precio'], keys: ['nombre','editorial','stock','precio'] },
  'ventas-por-mes':         { desc: 'GROUP BY con funciones de agregación por mes.', cols: ['Mes','Año','Num. ventas','Total recaudado'], keys: ['mes','anio','num_ventas','total'] },
  'clientes-top':           { desc: 'CTE (WITH) — clientes con mayor gasto total.', cols: ['Cliente','NIT','Compras','Gasto total'], keys: ['nombre','nit','compras','gasto_total'] },
};

let _reporteActual = 'ventas-por-empleado';
let _datosReporte = [];

async function renderizarReportes() {
  document.getElementById('vista-reportes').innerHTML = `
    <div class="topbar">
      <div class="page-header" style="margin-bottom:0"><h1>Reportes</h1><p>Consultas y análisis de datos</p></div>
      <button onclick="exportarCSV()" style="padding:0.5rem 1.2rem;background:rgba(80,200,120,0.15);border:1px solid rgba(80,200,120,0.3);border-radius:8px;color:#80ffaa;font-size:0.82rem;cursor:pointer;font-family:'DM Sans',sans-serif">⬇ Exportar CSV</button>
    </div>
    <div style="display:flex;gap:0.5rem;margin-bottom:1.5rem;flex-wrap:wrap" id="reporte-tabs">
      ${Object.keys(REPORTES_CFG).map((k,i) => `<button class="tab ${i===0?'active':''}" onclick="cambiarReporte('${k}', this)">${REPORTES_CFG[k].cols[0]==='Empleado'?'Ventas por empleado':k.replace(/-/g,' ')}</button>`).join('')}
    </div>
    <div class="card" style="margin-bottom:1rem"><p id="reporte-desc" style="font-size:0.85rem;color:var(--light);font-style:italic"></p></div>
    <div class="table-wrapper"><table><thead><tr id="reporte-thead"></tr></thead><tbody id="reporte-tbody"></tbody></table></div>`;

  // fix tab labels
  const tabs = document.querySelectorAll('#reporte-tabs .tab');
  const labels = ['Ventas por empleado','Más vendidos','Stock bajo','Ventas por mes','Clientes top'];
  tabs.forEach((t, i) => t.textContent = labels[i]);

  await cambiarReporte('ventas-por-empleado', document.querySelector('#reporte-tabs .tab'));
}

async function cambiarReporte(tipo, tabEl) {
  _reporteActual = tipo;
  document.querySelectorAll('#reporte-tabs .tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');
  const cfg = REPORTES_CFG[tipo];
  document.getElementById('reporte-desc').textContent = cfg.desc;
  document.getElementById('reporte-thead').innerHTML = cfg.cols.map(c => `<th>${c}</th>`).join('');
  try {
    const res = await apiFetch(`/reportes/${tipo}`);
    _datosReporte = await res.json();
    document.getElementById('reporte-tbody').innerHTML = _datosReporte.length
      ? _datosReporte.map(row => `<tr>${cfg.keys.map(k => `<td>${row[k]??'—'}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${cfg.cols.length}" style="text-align:center;color:var(--light);padding:2rem">Sin datos</td></tr>`;
  } catch(e) {}
}

function exportarCSV() {
  if (!_datosReporte.length) return;
  const cfg = REPORTES_CFG[_reporteActual];
  const csv = [cfg.cols.join(','), ..._datosReporte.map(r => cfg.keys.map(k => `"${r[k]??''}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `bookinn_${_reporteActual}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}