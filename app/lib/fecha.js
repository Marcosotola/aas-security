// app/lib/fecha.js
// Utilidades para manejar el campo "fecha" (string "YYYY-MM-DD", el que
// guardan los inputs type="date") sin el corrimiento de un día que aparece
// en husos horarios detrás de UTC como Argentina (UTC-3).

// Fecha de "hoy" en formato YYYY-MM-DD según el huso horario del navegador.
// `new Date().toISOString().split('T')[0]` usa UTC: en las últimas horas del
// día en Argentina ya es "mañana" en UTC, así que un documento creado a la
// noche quedaba precargado con la fecha del día siguiente.
export const fechaHoyLocal = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formatea "YYYY-MM-DD" para mostrar en pantalla o en un PDF.
// `new Date('YYYY-MM-DD')` interpreta el string como medianoche UTC: al
// convertirlo a la hora local de Argentina (UTC-3) cae en el día anterior
// (21hs del día previo), por eso se mostraba un día menos. Se arma la fecha
// a partir de sus componentes en vez de parsear el string completo, para
// evitar ese corrimiento.
export const formatearFecha = (fechaString) => {
  if (!fechaString) return '';
  try {
    const [year, month, day] = fechaString.split('-').map(Number);
    if (!year || !month || !day) return fechaString;
    const fecha = new Date(year, month - 1, day);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return fechaString;
  }
};
