function init() {
  requireAuth();

  // Mostrar nombre del empleado en sidebar
  const emp = getEmpleado();
  const el = document.getElementById('sidebar-nombre');
  if (el) el.textContent = `${emp.nombre || ''} ${emp.apellido || ''}`.trim() || 'Empleado';

  // Cerrar al hacer click fuera
  document.getElementById('modal-global').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-global')) cerrarModal();
  });

  // Ir al dashboard por defecto
  navegarADashboard();
}

init();