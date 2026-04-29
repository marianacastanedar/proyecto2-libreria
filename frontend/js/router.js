const VISTAS = [
  'dashboard', 'productos', 'clientes',
  'ventas', 'proveedores', 'empleados', 'reportes'
];

function mostrarSolo(vistaId) {
  VISTAS.forEach(v => {
    document.getElementById(`vista-${v}`).style.display = 'none';
    const nav = document.getElementById(`nav-${v}`);
    if (nav) nav.classList.remove('active');
  });
  document.getElementById(`vista-${vistaId}`).style.display = 'block';
  const nav = document.getElementById(`nav-${vistaId}`);
  if (nav) nav.classList.add('active');
}

function navegarADashboard() {
  mostrarSolo('dashboard');
  renderizarDashboard();
}

function navegarAProductos() {
  mostrarSolo('productos');
  renderizarProductos();
}

function navegarAClientes() {
  mostrarSolo('clientes');
  renderizarClientes();
}

function navegarAVentas() {
  mostrarSolo('ventas');
  renderizarVentas();
}

function navegarAProveedores() {
  mostrarSolo('proveedores');
  renderizarProveedores();
}

function navegarAEmpleados() {
  mostrarSolo('empleados');
  renderizarEmpleados();
}

function navegarAReportes() {
  mostrarSolo('reportes');
  renderizarReportes();
}