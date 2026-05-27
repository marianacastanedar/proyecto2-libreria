// verificar sesion activa
function requireAuth() {
  if (!localStorage.getItem('token')) window.location.href = 'login.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('empleado');
  localStorage.removeItem('permisos');
  window.location.href = 'login.html';
}

function getEmpleado() {
  return JSON.parse(localStorage.getItem('empleado') || '{}');
}

function getPermisos() {
  return JSON.parse(localStorage.getItem('permisos') || '[]');
}

function tienePermiso(seccion) {
  return getPermisos().includes(seccion);
}

// fetch con token jwt
async function apiFetch(url, options = {}) {
  const res = await fetch(`http://localhost:3000${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (res.status === 401) { logout(); return; }
  return res;
}

// mostrar alerta temporal
function mostrarAlert(selectorId, mensaje, tipo) {
  const el = document.getElementById(selectorId);
  if (!el) return;
  el.textContent = mensaje;
  el.className = `alert ${tipo}`;
  setTimeout(() => el.className = 'alert', 3000);
}

// abrir modal global
function abrirModal(html) {
  document.getElementById('modal-contenido').innerHTML = html;
  document.getElementById('modal-global').classList.add('open');
}

function cerrarModal() {
  document.getElementById('modal-global').classList.remove('open');
  document.getElementById('modal-contenido').innerHTML = '';
}