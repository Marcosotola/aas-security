// app/lib/suscripcion.js
// Helper único para el estado de la suscripción de la app, usado tanto en
// server (API routes) como en client (paneles admin). Antes cada lugar
// repetía su propia versión de esta lógica con dos bugs: usaban `<` en vez
// de `<=` (el día del vencimiento todavía dejaba pasar al visitante) y
// `toISOString()` para "hoy", que da la fecha en UTC y no en Argentina
// (falla en particular entre las 21:00 y las 23:59 hora local, donde ya es
// "mañana" en UTC).
const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

// Fecha de "hoy" en formato YYYY-MM-DD según la hora de Argentina, sin
// importar en qué huso horario corre el proceso (server o navegador). El
// locale "en-CA" formatea las fechas como YYYY-MM-DD.
export const fechaHoy = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

// El día del vencimiento ya cuenta como vencida (por eso <=, no <): la
// suscripción cubre "hasta" esa fecha, no "hasta el día siguiente".
export const estaVencida = (config) =>
  Boolean(config?.fechaVencimiento && config.fechaVencimiento <= fechaHoy());

export const estaBloqueada = (config) =>
  estaVencida(config) || config?.appHabilitada === false;

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const esBisiesto = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
const diasEnMes = (year, month) => (month === 2 && esBisiesto(year) ? 29 : DIAS_POR_MES[month - 1]);

// Suma `n` meses a una fecha "YYYY-MM-DD" sin usar Date: `setMonth` desborda
// al mes siguiente cuando el día de origen no existe en el mes de destino
// (31 de enero + 1 mes = 3 de marzo en vez de 28/29 de febrero). Acá el día
// se recorta al último día del mes de destino en vez de desbordar.
export const sumarMeses = (fechaStr, n) => {
  const [year, month, day] = fechaStr.split('-').map(Number);
  const totalMeses = year * 12 + (month - 1) + n;
  const nuevoYear = Math.floor(totalMeses / 12);
  const nuevoMonth = (totalMeses % 12) + 1;
  const nuevoDay = Math.min(day, diasEnMes(nuevoYear, nuevoMonth));
  return `${nuevoYear}-${String(nuevoMonth).padStart(2, '0')}-${String(nuevoDay).padStart(2, '0')}`;
};
