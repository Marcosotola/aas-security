// scripts/migrar-empresas.mjs
// Migración de "cliente = cuenta de usuario" a Empresas + Sedes + accesos.
//
// Uso (desde la raíz del proyecto, con las credenciales FIREBASE_ADMIN_*):
//   node --env-file=.env.local scripts/migrar-empresas.mjs respaldo
//   node --env-file=.env.local scripts/migrar-empresas.mjs analizar
//   node --env-file=.env.local scripts/migrar-empresas.mjs ejecutar              (simulación, no escribe)
//   node --env-file=.env.local scripts/migrar-empresas.mjs ejecutar --confirmar  (escribe)
//
// 1. respaldo: copia a migracion/respaldo-<fecha>.json todas las colecciones
//    que toca la migración.
// 2. analizar: arma migracion/plan-empresas.json agrupando las cuentas
//    Cliente que parecen ser la misma empresa (nombre normalizado o CUIT).
//    Ese archivo se revisa y se edita a mano antes de ejecutar.
// 3. ejecutar: crea las empresas con sus sedes, agrega empresaId/sedeId a
//    cada documento y arma los `accesos` de cada usuario para que vea
//    exactamente lo mismo que hoy. No borra nada: clienteId, sedes del
//    usuario y cuentasVinculadas quedan como están.
import fs from 'fs';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

const DIR = path.join(process.cwd(), 'migracion');
const PLAN = path.join(DIR, 'plan-empresas.json');

// Tipo de documento -> colección (mismo registro que TIPOS_DOC en
// app/lib/documentosCliente.js, que no se puede importar desde Node).
const COLECCIONES = {
  presupuesto: 'presupuestos',
  remito: 'remitos',
  recibo: 'recibos',
  factura: 'facturas',
  certificado: 'certificados',
  estado: 'estados',
  orden: 'ordenesTrabajo',
  mantenimiento: 'mantenimientosPreventivos',
  informe: 'documentos'
};

// Además de los documentos, los movimientos de Finanzas también se asocian a
// cliente/sede (solo para agrupar ingresos y gastos, no dan acceso a nadie).
const COLECCIONES_MIGRADAS = { ...COLECCIONES, movimiento: 'movimientos' };

// Tipos cuya sede se guarda arriba de todo (sedeId/sedeNombre); el resto la
// guarda dentro de `cliente`.
const SEDE_ARRIBA = new Set(['recibo', 'factura', 'certificado', 'movimiento']);

// Hoy el portal no muestra Informes: para que cada usuario vea exactamente
// lo mismo que antes, los accesos migrados no incluyen ese tipo.
const TIPOS_ACCESO_MIGRADO = Object.keys(COLECCIONES).filter((t) => t !== 'informe');

// ---------- utilidades ----------

// Misma normalización que app/lib/empresas.js.
const SUFIJOS_SOCIETARIOS = ['sa', 'srl', 'sas', 'sca', 'sh', 'sociedad anonima'];
function normalizarNombreEmpresa(nombre = '') {
  let n = nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' y ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const sufijo of SUFIJOS_SOCIETARIOS) {
    if (n.endsWith(` ${sufijo}`)) n = n.slice(0, -sufijo.length - 1);
  }
  n = n.replace(/ s a$| s r l$| s a s$/, '');
  return n.replace(/ /g, '');
}
const normalizarTexto = (t = '') => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
// Solo un CUIT (11 dígitos) agrupa cuentas; un DNI no identifica a una empresa.
const cuitDe = (valor = '') => {
  const d = String(valor).replace(/\D/g, '');
  return d.length === 11 ? d : '';
};
const nombrePersona = (u) => `${u.nombre || ''} ${u.apellido || ''}`.trim() || u.email || u.id;

function conectar() {
  const { FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY } = process.env;
  if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
    console.error('Faltan FIREBASE_ADMIN_* (corré el script con --env-file=.env.local).');
    process.exit(1);
  }
  const app = initializeApp({
    credential: cert({
      projectId: FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
  return getFirestore(app);
}

async function leerColeccion(db, nombre) {
  const snap = await db.collection(nombre).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function leerTodo(db) {
  const [usuarios, empresas, ...porTipo] = await Promise.all([
    leerColeccion(db, 'usuarios'),
    leerColeccion(db, 'empresas'),
    ...Object.values(COLECCIONES_MIGRADAS).map((c) => leerColeccion(db, c))
  ]);
  const documentos = Object.keys(COLECCIONES_MIGRADAS).flatMap((tipo, i) => porTipo[i].map((d) => ({ ...d, _tipo: tipo })));
  return { usuarios, empresas, documentos };
}

// Sede a la que apunta hoy un documento de una cuenta:
// - su sedeId, si esa sede existe en el perfil de la cuenta;
// - si no hay sedeId, una sede del perfil con el mismo nombre;
// - si el sedeId ya no existe (el cliente la borró), esa sede "huérfana";
// - si no, la "Principal" de la cuenta.
const sedeNombreDe = (doc) => ((SEDE_ARRIBA.has(doc._tipo) ? doc.sedeNombre : doc.cliente?.sedeNombre) || '').trim();

function sedeDelDocumento(doc, usuario) {
  const sedeId = (SEDE_ARRIBA.has(doc._tipo) ? doc.sedeId : doc.cliente?.sedeId) || null;
  const sedeNombre = sedeNombreDe(doc);
  const sedes = usuario.sedes || [];
  if (sedeId) {
    if (sedes.some((s) => s.id === sedeId)) return { id: sedeId };
    return { id: sedeId, huerfana: true, nombre: sedeNombre };
  }
  const porNombre = sedeNombre && sedes.find((s) => normalizarTexto(s.nombre) === normalizarTexto(sedeNombre));
  if (porNombre) return { id: porNombre.id };
  return { id: `principal-${usuario.id}`, principal: true };
}

const escribirJson = (archivo, datos) => {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(archivo, JSON.stringify(datos, (k, v) => {
    if (v && typeof v === 'object' && typeof v.toDate === 'function') return { _timestamp: v.toDate().toISOString() };
    return v;
  }, 2));
};

// ---------- respaldo ----------

async function respaldo(db) {
  const colecciones = ['usuarios', 'empresas', ...Object.values(COLECCIONES_MIGRADAS)];
  const datos = {};
  for (const c of colecciones) datos[c] = await leerColeccion(db, c);
  const archivo = path.join(DIR, `respaldo-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  escribirJson(archivo, datos);
  for (const c of colecciones) console.log(`${c.padEnd(28)} ${datos[c].length}`);
  console.log(`\nRespaldo guardado en ${path.relative(process.cwd(), archivo)}`);
}

// ---------- analizar ----------

async function analizar(db) {
  const { usuarios, empresas, documentos } = await leerTodo(db);
  const clientes = usuarios.filter((u) => (u.role || 'Cliente') === 'Cliente');
  const clientesPorId = new Map(clientes.map((u) => [u.id, u]));

  // Documentos por cuenta y por sede resuelta.
  const docsPorCuenta = new Map();
  const huerfanosPorClienteId = new Map();
  let sinCliente = 0;
  for (const doc of documentos) {
    if (!doc.clienteId) { sinCliente++; continue; }
    const usuario = clientesPorId.get(doc.clienteId);
    if (!usuario) {
      const h = huerfanosPorClienteId.get(doc.clienteId)
        || { clienteId: doc.clienteId, documentos: 0, ejemplo: null, sedes: [], asignarA: null };
      h.documentos++;
      h.ejemplo = h.ejemplo || doc.cliente?.empresa || doc.cliente?.nombre || doc.clienteNombre || doc.recibiDe || null;
      const sedeNombre = sedeNombreDe(doc);
      if (sedeNombre && !h.sedes.includes(sedeNombre)) h.sedes.push(sedeNombre);
      huerfanosPorClienteId.set(doc.clienteId, h);
      continue;
    }
    const lista = docsPorCuenta.get(usuario.id) || [];
    lista.push({ doc, sede: sedeDelDocumento(doc, usuario) });
    docsPorCuenta.set(usuario.id, lista);
  }

  // Sedes de cada cuenta tal como van a quedar en su empresa.
  const sedesDeCuenta = (u) => {
    const docs = docsPorCuenta.get(u.id) || [];
    const contar = (id) => docs.filter((d) => d.sede.id === id).length;
    const sedes = (u.sedes || []).map((s) => ({
      id: s.id, nombre: s.nombre || 'Sin nombre', direccion: s.direccion || '', activa: true,
      cuenta: u.id, documentos: contar(s.id)
    }));
    for (const { sede } of docs) {
      if (sede.huerfana && !sedes.some((s) => s.id === sede.id)) {
        sedes.push({
          id: sede.id, nombre: sede.nombre || 'Sede borrada', direccion: '', activa: false,
          cuenta: u.id, documentos: contar(sede.id),
          nota: 'El cliente borró esta sede pero tiene documentos: se crea archivada.'
        });
      }
    }
    const principalId = `principal-${u.id}`;
    if (sedes.length === 0 || docs.some((d) => d.sede.id === principalId)) {
      sedes.push({
        id: principalId,
        nombre: u.direccion ? `Principal - ${u.direccion}` : `Principal (${nombrePersona(u)})`,
        direccion: u.direccion || '', activa: true, cuenta: u.id, documentos: contar(principalId),
        nota: 'Documentos emitidos sin sede ("Principal") o cuenta sin sedes cargadas.'
      });
    }
    return sedes;
  };

  // Agrupar cuentas por nombre de empresa normalizado o CUIT (union-find).
  const padre = new Map(clientes.map((u) => [u.id, u.id]));
  const raiz = (id) => (padre.get(id) === id ? id : raiz(padre.get(id)));
  const unir = (a, b) => padre.set(raiz(a), raiz(b));
  const primeraPorClave = new Map();
  for (const u of clientes) {
    for (const clave of [normalizarNombreEmpresa(u.empresa || '') && `n:${normalizarNombreEmpresa(u.empresa)}`, cuitDe(u.dniCuit) && `c:${cuitDe(u.dniCuit)}`]) {
      if (!clave) continue;
      if (primeraPorClave.has(clave)) unir(u.id, primeraPorClave.get(clave));
      else primeraPorClave.set(clave, u.id);
    }
  }
  const grupos = new Map();
  for (const u of clientes) {
    const r = raiz(u.id);
    grupos.set(r, [...(grupos.get(r) || []), u]);
  }

  const planEmpresas = [...grupos.values()].map((cuentas) => {
    // Nombre: el que más se repite entre las cuentas; si ninguna cargó
    // empresa, el nombre de la persona (cliente particular).
    const conteo = new Map();
    for (const u of cuentas) if (u.empresa?.trim()) conteo.set(u.empresa.trim(), (conteo.get(u.empresa.trim()) || 0) + 1);
    const nombre = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || nombrePersona(cuentas[0]);
    const cuit = cuentas.map((u) => cuitDe(u.dniCuit)).find(Boolean) || '';
    const existente = empresas.find((e) =>
      normalizarNombreEmpresa(e.nombre) === normalizarNombreEmpresa(nombre) || (cuit && cuitDe(e.cuit) === cuit));

    const sedes = cuentas.flatMap(sedesDeCuenta);
    // Posibles sedes duplicadas (mismo nombre o misma dirección, en la misma
    // cuenta o en otra): solo se marcan, se unen si se completa "unirCon".
    for (const s of sedes) {
      const igual = sedes.find((o) => sedes.indexOf(o) < sedes.indexOf(s) && (
        normalizarTexto(o.nombre) === normalizarTexto(s.nombre)
        || (normalizarTexto(s.direccion) && normalizarTexto(o.direccion) === normalizarTexto(s.direccion))));
      if (igual) s.posibleDuplicadoDe = igual.id;
      s.unirCon = null;
    }

    return {
      nombre,
      razonSocial: '',
      cuit,
      empresaExistenteId: existente?.id || null,
      omitir: false,
      cuentas: cuentas.map((u) => ({
        uid: u.id,
        email: u.email || '',
        persona: nombrePersona(u),
        empresaDeclarada: u.empresa || '',
        dniCuit: u.dniCuit || '',
        documentos: (docsPorCuenta.get(u.id) || []).length,
        cuentasVinculadas: u.cuentasVinculadas || []
      })),
      sedes
    };
  }).sort((a, b) => b.cuentas.length - a.cuentas.length || a.nombre.localeCompare(b.nombre));

  const plan = {
    _instrucciones: [
      'Revisá cada empresa. Podés editar nombre, razonSocial y cuit.',
      'Para fusionar dos empresas, mové las cuentas y sedes de una a la otra y borrá la que queda vacía.',
      'Para separar una cuenta, sacala (con sus sedes: las que tengan su uid en "cuenta") a una empresa nueva.',
      '"omitir": true deja esa empresa fuera de la migración (sus usuarios quedan sin accesos, sus documentos sin empresa).',
      'Para unir una sede con otra de la misma empresa, poné en "unirCon" el id de la sede que queda; sus documentos y accesos pasan a esa.',
      '"posibleDuplicadoDe" es solo una sugerencia; no hace nada por sí solo.',
      '"empresaExistenteId": si no es null, las sedes se agregan a esa empresa ya creada en vez de crear una nueva.',
      'En "documentosDeCuentasInexistentes" (cuentas borradas), "asignarA" con el nombre de una empresa del plan asigna esos documentos a la sede de esa empresa con el mismo nombre.',
      'No cambies los "id" de las sedes ni los "uid" de las cuentas.'
    ],
    generado: new Date().toISOString(),
    resumen: {
      cuentasCliente: clientes.length,
      empresasPropuestas: planEmpresas.length,
      empresasConVariasCuentas: planEmpresas.filter((e) => e.cuentas.length > 1).length,
      documentosDeCuentas: [...docsPorCuenta.values()].reduce((t, l) => t + l.length, 0),
      documentosSinCliente: sinCliente,
      documentosDeCuentasInexistentes: [...huerfanosPorClienteId.values()].reduce((t, h) => t + h.documentos, 0)
    },
    empresas: planEmpresas,
    documentosDeCuentasInexistentes: [...huerfanosPorClienteId.values()]
  };

  escribirJson(PLAN, plan);
  console.log(plan.resumen);
  console.log('\nEmpresas con más de una cuenta:');
  for (const e of planEmpresas.filter((x) => x.cuentas.length > 1)) {
    console.log(`  ${e.nombre}: ${e.cuentas.map((c) => c.email).join(', ')}`);
  }
  const dudosas = planEmpresas.flatMap((e) => e.sedes.filter((s) => s.posibleDuplicadoDe).map((s) => `  ${e.nombre}: "${s.nombre}"`));
  if (dudosas.length) console.log(`\nSedes posiblemente duplicadas:\n${dudosas.join('\n')}`);
  console.log(`\nPlan guardado en ${path.relative(process.cwd(), PLAN)}`);
}

// ---------- ejecutar ----------

async function ejecutar(db, confirmar) {
  if (!fs.existsSync(PLAN)) {
    console.error('No existe migracion/plan-empresas.json: corré primero "analizar".');
    process.exit(1);
  }
  const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
  const { usuarios, empresas, documentos } = await leerTodo(db);
  const usuariosPorId = new Map(usuarios.map((u) => [u.id, u]));
  const errores = [];
  const avisos = [];

  // No correr dos veces.
  if (empresas.some((e) => e.migradoDesde)) errores.push('Ya hay empresas creadas por una migración anterior.');
  if (usuarios.some((u) => u.accesos && Object.keys(u.accesos).length > 0)) errores.push('Ya hay usuarios con accesos asignados.');

  const activas = plan.empresas.filter((e) => !e.omitir);

  // Cada cuenta en una sola empresa; cada sede con id único.
  const empresaDeCuenta = new Map();
  for (const [i, e] of activas.entries()) {
    for (const c of e.cuentas) {
      if (empresaDeCuenta.has(c.uid)) errores.push(`La cuenta ${c.email || c.uid} está en más de una empresa.`);
      empresaDeCuenta.set(c.uid, i);
      if (!usuariosPorId.has(c.uid)) avisos.push(`La cuenta ${c.email || c.uid} ya no existe: se ignora.`);
    }
    const ids = new Set();
    for (const s of e.sedes) {
      if (ids.has(s.id)) errores.push(`${e.nombre}: la sede ${s.id} está repetida.`);
      ids.add(s.id);
    }
  }

  // Sede final (siguiendo "unirCon") de cada sede del plan.
  const destinoSede = new Map(); // `${empresaIndex}:${sedeId}` -> sedeId final
  for (const [i, e] of activas.entries()) {
    const porId = new Map(e.sedes.map((s) => [s.id, s]));
    for (const s of e.sedes) {
      let actual = s;
      const vistos = new Set();
      while (actual.unirCon) {
        if (vistos.has(actual.id)) { errores.push(`${e.nombre}: "unirCon" en círculo en la sede ${s.nombre}.`); break; }
        vistos.add(actual.id);
        const siguiente = porId.get(actual.unirCon);
        if (!siguiente) { errores.push(`${e.nombre}: la sede ${s.nombre} apunta con "unirCon" a ${actual.unirCon}, que no existe en esa empresa.`); break; }
        actual = siguiente;
      }
      destinoSede.set(`${i}:${s.id}`, actual.id);
    }
  }

  // Cada documento de una cuenta migrada tiene que caer en una sede del plan.
  const actualizacionesDocs = [];
  for (const doc of documentos) {
    if (!doc.clienteId || !empresaDeCuenta.has(doc.clienteId)) continue;
    const usuario = usuariosPorId.get(doc.clienteId);
    if (!usuario) continue;
    const i = empresaDeCuenta.get(doc.clienteId);
    const { id: sedeOrigen } = sedeDelDocumento(doc, usuario);
    const sedeFinal = destinoSede.get(`${i}:${sedeOrigen}`);
    if (!sedeFinal) {
      errores.push(`El documento ${doc._tipo} ${doc.id} apunta a la sede ${sedeOrigen}, que no está en el plan de "${activas[i].nombre}" (¿el plan está desactualizado? volvé a correr "analizar").`);
      continue;
    }
    actualizacionesDocs.push({ coleccion: COLECCIONES_MIGRADAS[doc._tipo], id: doc.id, sedeId: sedeFinal, i });
  }

  // Documentos de cuentas borradas asignados a mano a una empresa del plan:
  // van a la sede de esa empresa con el mismo nombre. Nadie los ve hoy, así
  // que no generan accesos nuevos más allá de los de esa sede.
  const asignaciones = new Map((plan.documentosDeCuentasInexistentes || [])
    .filter((h) => h.asignarA).map((h) => [h.clienteId, h.asignarA]));
  for (const doc of documentos) {
    if (!asignaciones.has(doc.clienteId) || empresaDeCuenta.has(doc.clienteId)) continue;
    const nombreEmpresa = asignaciones.get(doc.clienteId);
    const i = activas.findIndex((e) => e.nombre === nombreEmpresa);
    if (i === -1) {
      errores.push(`"asignarA": no hay una empresa (no omitida) llamada "${nombreEmpresa}" en el plan.`);
      continue;
    }
    const sede = activas[i].sedes.find((s) => normalizarTexto(s.nombre) === normalizarTexto(sedeNombreDe(doc)));
    if (!sede) {
      errores.push(`El documento ${doc._tipo} ${doc.id} (cuenta borrada) es de la sede "${sedeNombreDe(doc)}", que no existe en "${nombreEmpresa}".`);
      continue;
    }
    actualizacionesDocs.push({ coleccion: COLECCIONES_MIGRADAS[doc._tipo], id: doc.id, sedeId: destinoSede.get(`${i}:${sede.id}`), i });
  }

  // Accesos: cada cuenta ve sus propias sedes (y las de sus cuentas
  // vinculadas) con los mismos tipos que ve hoy.
  const sedesPropiasDe = (uid) => {
    const i = empresaDeCuenta.get(uid);
    if (i === undefined) return [];
    return activas[i].sedes.filter((s) => s.cuenta === uid).map((s) => ({ i, sedeId: destinoSede.get(`${i}:${s.id}`) }));
  };
  const accesosPorCuenta = new Map();
  for (const uid of empresaDeCuenta.keys()) {
    const usuario = usuariosPorId.get(uid);
    if (!usuario) continue;
    const lista = [...sedesPropiasDe(uid)];
    for (const vinculada of usuario.cuentasVinculadas || []) {
      if (!empresaDeCuenta.has(vinculada)) {
        avisos.push(`${usuario.email}: su cuenta vinculada ${vinculada} no se migra, así que pierde ese acceso.`);
        continue;
      }
      lista.push(...sedesPropiasDe(vinculada));
    }
    accesosPorCuenta.set(uid, lista);
  }

  for (const a of actualizacionesDocs) {
    if (!a.coleccion || !a.sedeId) errores.push(`Registro ${a.id}: colección o sede sin resolver.`);
  }

  if (errores.length) {
    console.error(`No se puede ejecutar:\n- ${errores.join('\n- ')}`);
    process.exit(1);
  }

  const omitidas = plan.empresas.filter((e) => e.omitir);
  console.log({
    empresasACrear: activas.filter((e) => !e.empresaExistenteId).length,
    empresasExistentesACompletar: activas.filter((e) => e.empresaExistenteId).length,
    empresasOmitidas: omitidas.length,
    sedes: activas.reduce((t, e) => t + e.sedes.filter((s) => !s.unirCon).length, 0),
    sedesUnidas: activas.reduce((t, e) => t + e.sedes.filter((s) => s.unirCon).length, 0),
    documentosAActualizar: actualizacionesDocs.length,
    usuariosConAccesos: accesosPorCuenta.size
  });
  if (avisos.length) console.log(`\nAvisos:\n- ${avisos.join('\n- ')}`);

  if (!confirmar) {
    console.log('\nSimulación: no se escribió nada. Para aplicar, agregá --confirmar.');
    return;
  }

  // 1. Empresas: ids fijos antes de escribir, para usarlos en docs y accesos.
  const empresaIds = activas.map((e) => e.empresaExistenteId || db.collection('empresas').doc().id);
  const escritor = db.bulkWriter();
  let fallidas = 0;
  escritor.onWriteError((error) => {
    fallidas++;
    console.error(`Error en ${error.documentRef.path}: ${error.message}`);
    return false;
  });
  for (const [i, e] of activas.entries()) {
    const sedes = e.sedes.filter((s) => !s.unirCon).map((s) => ({
      id: s.id, nombre: s.nombre, direccion: s.direccion || '', activa: s.activa !== false
    }));
    const migradoDesde = e.cuentas.map((c) => c.uid);
    if (e.empresaExistenteId) {
      const existente = empresas.find((x) => x.id === e.empresaExistenteId);
      if (!existente) {
        console.error(`La empresa existente ${e.empresaExistenteId} (${e.nombre}) no se encontró.`);
        process.exit(1);
      }
      const yaEstan = new Set((existente.sedes || []).map((s) => s.id));
      escritor.update(db.collection('empresas').doc(empresaIds[i]), {
        sedes: [...(existente.sedes || []), ...sedes.filter((s) => !yaEstan.has(s.id))],
        migradoDesde,
        fechaActualizacion: FieldValue.serverTimestamp()
      });
    } else {
      escritor.set(db.collection('empresas').doc(empresaIds[i]), {
        nombre: e.nombre, razonSocial: e.razonSocial || '', cuit: e.cuit || '', email: '', telefono: '',
        sedes, migradoDesde,
        fechaCreacion: FieldValue.serverTimestamp()
      });
    }
  }

  // 2. Documentos: solo se agregan empresaId/sedeId.
  for (const a of actualizacionesDocs) {
    escritor.update(db.collection(a.coleccion).doc(a.id), { empresaId: empresaIds[a.i], sedeId: a.sedeId });
  }

  // 3. Accesos de cada usuario.
  for (const [uid, lista] of accesosPorCuenta) {
    const accesos = {};
    for (const { i, sedeId } of lista) {
      accesos[empresaIds[i]] = accesos[empresaIds[i]] || {};
      accesos[empresaIds[i]][sedeId] = TIPOS_ACCESO_MIGRADO;
    }
    escritor.update(db.collection('usuarios').doc(uid), { accesos });
  }

  await escritor.close();

  const resultado = path.join(DIR, `resultado-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  escribirJson(resultado, {
    fecha: Timestamp.now(),
    empresas: activas.map((e, i) => ({ id: empresaIds[i], nombre: e.nombre, cuentas: e.cuentas.map((c) => c.email || c.uid) })),
    documentosActualizados: actualizacionesDocs.length,
    usuariosConAccesos: accesosPorCuenta.size,
    escriturasFallidas: fallidas
  });
  console.log(`\nListo${fallidas ? ` con ${fallidas} escrituras fallidas` : ''}. Detalle en ${path.relative(process.cwd(), resultado)}`);
}

// ---------- main ----------

const [comando, ...flags] = process.argv.slice(2);
const db = conectar();
if (comando === 'respaldo') await respaldo(db);
else if (comando === 'analizar') await analizar(db);
else if (comando === 'ejecutar') await ejecutar(db, flags.includes('--confirmar'));
else {
  console.log('Uso: node --env-file=.env.local scripts/migrar-empresas.mjs <respaldo|analizar|ejecutar [--confirmar]>');
  process.exit(1);
}
