import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatearFecha } from '../../lib/fecha';
import { esHtmlEnriquecido } from '../../lib/richText';
import { renderHtmlEnriquecidoParaPdf } from './htmlToPdf';
import { OrdenTrabajoPagina } from './OrdenTrabajoPDF';

// Certificado de instalaciones contra incendio, con el mismo formato que
// usa ARIFA (encabezado con cuadro de rubro/fecha/página, tabla de datos,
// memoria descriptiva, registro fotográfico, declaración jurada y firmas;
// la del profesional queda en blanco para firmar y sellar a mano),
// pero con la marca de AAS. Al final se anexan las OT / mantenimientos
// vinculados y la credencial del profesional.

export const DECLARACION_JURADA = 'La información consignada precedentemente reviste el carácter de Declaración Jurada; su omisión o falsedad procederá al decaimiento de su validez, sin perjuicio de las sanciones que pudiera corresponder. El profesional interviniente declara que cumple con las competencias exigidas por ley para completar el presente trabajo.';

export const EMPRESA_CERTIFICANTE = 'AAS SECURITY — SEGURIDAD CONTRA INCENDIOS  |  CUIT 20-24471842-7\naas-security.vercel.app';

const AZUL = '#1A5276';
const AZUL_CLARO = '#2E86C1';
const ROJO = '#A31F1D';
const BORDE = '#1A5276';

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingHorizontal: 32,
    paddingBottom: 60,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#222'
  },
  // Encabezado
  header: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDE,
    height: 86,
    marginBottom: 14
  },
  headerLogo: {
    width: 92,
    borderRightWidth: 1,
    borderRightColor: BORDE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4
  },
  // Marca en texto, igual que el resto de los PDF de AAS (no hay logo en imagen).
  logoAas: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: AZUL, lineHeight: 1 },
  logoSecurity: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: AZUL_CLARO, marginTop: 1 },
  logoSub: { fontSize: 6, fontFamily: 'Helvetica-Oblique', color: '#666', marginTop: 6, textAlign: 'center' },
  headerCentro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  headerTitulo: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: AZUL, textAlign: 'center' },
  headerDj: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: ROJO, textAlign: 'center', marginTop: 5 },
  headerNumero: { fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginTop: 8 },
  headerDatos: {
    width: 150,
    borderLeftWidth: 1,
    borderLeftColor: BORDE
  },
  headerFila: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: BORDE
  },
  headerFilaUltima: { borderBottomWidth: 0 },
  headerEtiqueta: { width: 52, fontSize: 7, fontFamily: 'Helvetica-Bold' },
  headerValor: { flex: 1, fontSize: 7 },
  // Tabla de datos
  tabla: { borderWidth: 1, borderColor: BORDE, marginBottom: 16 },
  fila: { flexDirection: 'row', minHeight: 24, alignItems: 'center' },
  filaGris: { backgroundColor: '#f4f6f8' },
  filaDestacada: { backgroundColor: '#eef4fa' },
  celdaEtiqueta: { width: 128, paddingHorizontal: 8, paddingVertical: 6, fontFamily: 'Helvetica-Bold', color: '#444' },
  celdaValor: { flex: 1, paddingHorizontal: 8, paddingVertical: 6 },
  celdaMedia: { width: 110, paddingHorizontal: 8, paddingVertical: 6 },
  // Secciones
  barraTitulo: {
    backgroundColor: AZUL,
    color: '#fff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 8
  },
  seccion: { marginBottom: 16 },
  texto: { fontSize: 9, lineHeight: 1.4 },
  rtParrafo: { fontSize: 9, lineHeight: 1.4, marginBottom: 6 },
  rtTitulo: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: AZUL, marginTop: 4, marginBottom: 4 },
  rtLista: { marginBottom: 6 },
  rtItemLista: { flexDirection: 'row', marginBottom: 2 },
  rtVinieta: { width: 12, fontSize: 9 },
  rtTextoItemLista: { flex: 1, fontSize: 9, lineHeight: 1.4 },
  rtNegrita: { fontFamily: 'Helvetica-Bold' },
  rtCursiva: { fontFamily: 'Helvetica-Oblique' },
  // Fotos
  fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  fotoItem: { width: '49%', marginBottom: 8 },
  foto: { width: '100%', height: 170, objectFit: 'cover' },
  // Declaración jurada y firmas
  djTitulo: {
    backgroundColor: '#f4f6f8',
    color: AZUL,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 6
  },
  firmas: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  firmaCaja: { width: '48%', height: 120, borderWidth: 1, borderColor: BORDE, padding: 6 },
  firmaEtiqueta: { fontSize: 7.5, color: '#555' },
  firmaImagen: { flex: 1, objectFit: 'contain', marginTop: 4 },
  firmaAclaracion: { fontSize: 7.5, textAlign: 'center', marginTop: 2 },
  // Credencial
  credencialTitulo: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: AZUL, marginBottom: 10 },
  credencial: { width: '100%', objectFit: 'contain' },
  // Pie
  pie: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#bbb',
    paddingTop: 5,
    fontSize: 7,
    fontFamily: 'Helvetica-Oblique',
    color: '#888'
  }
});

// react-pdf corta palabras con guion para justificar ("certifica-do",
// "aas-securi-ty"); en la tabla de datos se prefiere pasar la palabra entera.
const sinGuiones = (palabra) => [palabra];

const responsableDe = (c) => c ? [c.titulo, c.nombre].filter(Boolean).join(' ') + (c.matricula ? ` - MP ${c.matricula}` : '') : '-';

function Encabezado({ cert }) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerLogo}>
        <Text style={styles.logoAas}>AAS</Text>
        <Text style={styles.logoSecurity}>Security</Text>
        <Text style={styles.logoSub}>Seguridad contra incendios</Text>
      </View>
      <View style={styles.headerCentro}>
        <Text style={styles.headerTitulo}>Certificado de Instalaciones</Text>
        <Text style={styles.headerTitulo}>contra incendio y emergencias</Text>
        <Text style={styles.headerDj}>DOCUMENTO CON CARÁCTER DE DECLARACIÓN JURADA.</Text>
        <Text style={styles.headerNumero}>CERTIFICADO N° {cert.numero || '----'}</Text>
      </View>
      <View style={styles.headerDatos}>
        <View style={styles.headerFila}>
          <Text style={styles.headerEtiqueta}>Rubro:</Text>
          <Text style={styles.headerValor}>{cert.rubro || '-'}</Text>
        </View>
        <View style={styles.headerFila}>
          <Text style={styles.headerEtiqueta}>Fecha:</Text>
          <Text style={styles.headerValor}>{formatearFecha(cert.fechaInspeccion) || '-'}</Text>
        </View>
        <View style={styles.headerFila}>
          <Text style={styles.headerEtiqueta}>Rev. planos:</Text>
          <Text style={styles.headerValor}>{cert.revPlanos || '-'}</Text>
        </View>
        <View style={[styles.headerFila, styles.headerFilaUltima]}>
          <Text style={styles.headerEtiqueta}>Página:</Text>
          <Text style={styles.headerValor} render={({ pageNumber }) => String(pageNumber)} />
        </View>
      </View>
    </View>
  );
}

function Pie({ cert }) {
  return (
    <View style={styles.pie} fixed>
      <Text>Emitido el {formatearFecha(cert.fechaInspeccion)}.</Text>
      <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
      <Text>AAS Security - Seguridad contra incendios</Text>
    </View>
  );
}

function Fila({ etiqueta, children, estilo }) {
  return (
    <View style={[styles.fila, estilo]} wrap={false}>
      <Text style={styles.celdaEtiqueta} hyphenationCallback={sinGuiones}>{etiqueta}</Text>
      <View style={styles.celdaValor}>{children}</View>
    </View>
  );
}

const CertificacionPDF = ({ certificacion: cert }) => {
  const cliente = cert.cliente || {};
  const clienteTexto = [cliente.nombre || cliente.empresa, cliente.sedeNombre ? `SEDE: ${cliente.sedeNombre}` : null].filter(Boolean).join(' - ');

  return (
    <Document title={`Certificado N° ${cert.numero || ''}`}>
      <Page size="A4" style={styles.page}>
        <Encabezado cert={cert} />

        {/* Datos */}
        <View style={styles.tabla}>
          <View style={styles.fila} wrap={false}>
            <Text style={styles.celdaEtiqueta}>Fecha de Inspección</Text>
            <Text style={styles.celdaMedia}>{formatearFecha(cert.fechaInspeccion) || '-'}</Text>
            <Text style={[styles.celdaEtiqueta, { width: 110 }]}>Fecha de Vencimiento</Text>
            <Text style={styles.celdaValor}>{formatearFecha(cert.fechaVencimiento) || '-'}</Text>
          </View>
          <Fila etiqueta="Sistema certificado:" estilo={styles.filaGris}>
            <Text style={{ fontFamily: 'Helvetica-Bold', color: ROJO }} hyphenationCallback={sinGuiones}>{cert.sistemaCertificado || '-'}</Text>
          </Fila>
          <Fila etiqueta="Cliente:">
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{clienteTexto || '-'}</Text>
          </Fila>
          <Fila etiqueta="Razón social:" estilo={styles.filaGris}>
            <Text>{cliente.razonSocial || '-'}</Text>
          </Fila>
          <Fila etiqueta="CUIT:">
            <Text>{cliente.cuit || '-'}</Text>
          </Fila>
          {cert.expediente ? (
            <Fila etiqueta="N° de Expediente:" estilo={styles.filaGris}>
              <Text>{cert.expediente}</Text>
            </Fila>
          ) : null}
          <Fila etiqueta="Domicilio:" estilo={cert.expediente ? null : styles.filaGris}>
            <Text>{cliente.direccion || '-'}</Text>
          </Fila>
          <Fila etiqueta="Responsable certificado:" estilo={cert.expediente ? styles.filaGris : null}>
            <Text hyphenationCallback={sinGuiones}>{responsableDe(cert.certificador).toUpperCase()}</Text>
          </Fila>
          <Fila etiqueta="Empresa Certificante:" estilo={styles.filaDestacada}>
            <Text style={{ fontFamily: 'Helvetica-Bold', color: AZUL }} hyphenationCallback={sinGuiones}>{EMPRESA_CERTIFICANTE}</Text>
          </Fila>
        </View>

        {/* Memoria descriptiva */}
        {cert.memoria ? (
          <View style={styles.seccion}>
            <Text style={styles.barraTitulo} minPresenceAhead={40}>MEMORIA DESCRIPTIVA</Text>
            {esHtmlEnriquecido(cert.memoria) ? (
              renderHtmlEnriquecidoParaPdf(cert.memoria, {
                parrafo: styles.rtParrafo,
                titulo: styles.rtTitulo,
                lista: styles.rtLista,
                itemLista: styles.rtItemLista,
                vinieta: styles.rtVinieta,
                textoItemLista: styles.rtTextoItemLista,
                negrita: styles.rtNegrita,
                cursiva: styles.rtCursiva
              })
            ) : (
              <Text style={styles.texto}>{cert.memoria}</Text>
            )}
          </View>
        ) : null}

        {/* Registro fotográfico */}
        {cert.fotos?.length > 0 ? (
          <View style={styles.seccion}>
            {/* Título pegado a la primera fila: nunca queda solo al pie. */}
            <View wrap={false}>
              <Text style={styles.barraTitulo}>REGISTRO FOTOGRÁFICO</Text>
              <View style={styles.fotosGrid}>
                {cert.fotos.slice(0, 2).map((foto, i) => (
                  <View key={foto.path || i} style={styles.fotoItem}>
                    <Image src={foto.url} style={styles.foto} />
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.fotosGrid}>
              {cert.fotos.slice(2).map((foto, i) => (
                <View key={foto.path || i} style={styles.fotoItem} wrap={false}>
                  <Image src={foto.url} style={styles.foto} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Declaración jurada y firmas */}
        <View wrap={false}>
          <Text style={styles.djTitulo}>DECLARACIÓN JURADA</Text>
          <Text style={styles.texto}>{DECLARACION_JURADA}</Text>
          <View style={styles.firmas}>
            <View style={styles.firmaCaja}>
              {/* Vacío a propósito: el profesional firma y sella a mano el impreso. */}
              <Text style={styles.firmaEtiqueta}>Firma y Sello Profesional Interviniente</Text>
              <View style={{ flex: 1 }} />
              {cert.certificador ? <Text style={styles.firmaAclaracion} hyphenationCallback={sinGuiones}>{responsableDe(cert.certificador)}</Text> : null}
            </View>
            <View style={styles.firmaCaja}>
              <Text style={styles.firmaEtiqueta}>Firma Propietario/Responsable del Inmueble</Text>
              {cert.firmaResponsable ? (
                <Image src={cert.firmaResponsable} style={styles.firmaImagen} />
              ) : <View style={{ flex: 1 }} />}
              {cert.aclaracionResponsable ? <Text style={styles.firmaAclaracion}>{cert.aclaracionResponsable}</Text> : null}
            </View>
          </View>
        </View>

        <Pie cert={cert} />
      </Page>

      {/* Anexo: OT y mantenimientos vinculados, con su formato habitual */}
      {(cert.vinculados || []).map((v) => (
        <OrdenTrabajoPagina
          key={`${v.tipo}-${v.id}`}
          orden={v.datos}
          titulo={v.tipo === 'mantenimiento' ? 'MANTENIMIENTO PREVENTIVO' : 'ORDEN DE TRABAJO'}
        />
      ))}

      {/* Credencial del profesional */}
      {cert.certificador?.credencial ? (
        <Page size="A4" style={styles.page}>
          <Encabezado cert={cert} />
          <Text style={styles.credencialTitulo}>CREDENCIAL DEL PROFESIONAL</Text>
          <Image src={cert.certificador.credencial} style={styles.credencial} />
          <Pie cert={cert} />
        </Page>
      ) : null}
    </Document>
  );
};

export default CertificacionPDF;
