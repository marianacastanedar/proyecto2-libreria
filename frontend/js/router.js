const VISTAS = ['dashboard','productos','clientes','ventas','proveedores','empleados','reportes'];

// vistas permitidas por rol
const ACCESO_VISTAS = {
  dashboard:    [],
  productos:    ['vendedor','responsable_marketing'],
  clientes:     ['cajero','vendedor'],
  ventas:       ['cajero','vendedor','gerente_financiero'],
  proveedores:  ['responsable_marketing'],
  empleados:    ['gerente_personal'],
  reportes:     ['gerente_financiero'],
};

function puedeAcceder(vista) {
  const requeridos = ACCESO_VISTAS[vista];
  if (!requeridos || requeridos.length === 0) return true;
  return requeridos.includes(getEmpleado().rol);
}

function mostrarSolo(vistaId) {
  if (!puedeAcceder(vistaId)) {
    mostrarAlert('alert-global', 'no tienes permiso para esta seccion', 'error');
    return;
  }
  VISTAS.forEach(v => {
    document.getElementById(`vista-${v}`).style.display = 'none';
    const nav = document.getElementById(`nav-${v}`);
    if (nav) nav.classList.remove('active');
  });
  document.getElementById(`vista-${vistaId}`).style.display = 'block';
  const nav = document.getElementById(`nav-${vistaId}`);
  if (nav) nav.classList.add('active');
}

// ocultar nav items sin permiso
function actualizarSidebar() {
  VISTAS.forEach(v => {
    const nav = document.getElementById(`nav-${v}`);
    if (nav) nav.style.display = puedeAcceder(v) ? 'flex' : 'none';
  });
}

function navegarADashboard()   { mostrarSolo('dashboard');   renderizarDashboard(); }
function navegarAProductos()   { mostrarSolo('productos');   renderizarProductos(); }
function navegarAClientes()    { mostrarSolo('clientes');    renderizarClientes(); }
function navegarAVentas()      { mostrarSolo('ventas');      renderizarVentas(); }
function navegarAProveedores() { mostrarSolo('proveedores'); renderizarProveedores(); }
function navegarAEmpleados()   { mostrarSolo('empleados');   renderizarEmpleados(); }
function navegarAReportes()    { mostrarSolo('reportes');    renderizarReportes(); }