import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatearFecha } from '../../lib/fecha';

const ESTADO_LABEL = { OK: 'OK', NOK: 'N OK', NA: 'N/A' };
const ESTADO_COLOR = { OK: '#27AE60', NOK: '#C0392B', NA: '#888888' };

// Estilos para el PDF (mismo esquema de color y estructura que RemitoPDF.jsx)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 75,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1A5276',
    paddingBottom: 10
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerInfo: {
    fontSize: 9,
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A5276',
    textDecoration: 'underline'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  headerRowText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
    padding: 5,
    color: '#1A5276'
  },
  infoBlock: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  horizontalInfoBlocks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  value: {
    fontSize: 9,
    flex: 2,
  },
  colContent: {
    fontSize: 9,
  },
  notes: {
    fontSize: 9,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  fotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  fotoItem: {
    width: '46%',
    marginHorizontal: '2%',
    marginBottom: 10,
  },
  foto: {
    width: '100%',
    height: 160,
    objectFit: 'cover',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  firmasRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  firmaBlock: {
    width: '40%',
    alignItems: 'center',
  },
  firmaImagen: {
    width: 140,
    height: 60,
    marginBottom: 5,
    alignSelf: 'center'
  },
  firmaLinea: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 5,
    fontSize: 9,
    textAlign: 'center',
    width: '100%'
  },
  firmaAclaracion: {
    fontSize: 9,
    marginTop: 3,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  planillaBloque: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 3,
  },
  planillaTitulo: {
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  planillaGrupo: {
    fontSize: 7,
    color: '#888',
    textTransform: 'uppercase',
  },
  planillaNombre: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A5276',
  },
  checklistHeader: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingTop: 4,
  },
  checklistRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  checklistDescripcion: {
    flex: 3,
    fontSize: 8,
  },
  checklistEstado: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checklistObservacion: {
    flex: 3,
    fontSize: 8,
    color: '#555',
  },
  checklistColHeader: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
  },
  checklistSubtitulo: {
    backgroundColor: '#eef2f5',
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#444',
    textTransform: 'uppercase',
  },
  tablaHeaderRow: {
    flexDirection: 'row',
  },
  tablaHeaderCellId: {
    padding: 3,
    fontSize: 7,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#1A5276',
    borderWidth: 0.5,
    borderColor: '#fff',
  },
  tablaHeaderCellCol: {
    width: 38,
    minHeight: 32,
    borderWidth: 0.5,
    borderColor: '#fff',
    backgroundColor: '#1A5276',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 1,
  },
  tablaHeaderCellColTexto: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  tablaRow: {
    flexDirection: 'row',
  },
  tablaCellId: {
    padding: 3,
    fontSize: 7,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  tablaCellValor: {
    width: 38,
    padding: 2,
    fontSize: 6,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  tablaNota: {
    fontSize: 8,
    marginTop: 3,
    color: '#555',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#1A5276',
    paddingTop: 10,
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
});

const OrdenTrabajoPDF = ({ orden }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header} fixed>
          <View style={styles.logoContainer}>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoText}>
                <Text style={{ color: '#1A5276' }}>AAS</Text>
                <Text style={{ color: '#2E86C1' }}> Security</Text>
              </Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text>Email: alexalanspitel.security@gmail.com</Text>
            <Text>Teléfono: (351) 311 2962</Text>
            <Text>Web: www.aassecurity.com.ar</Text>
          </View>
        </View>

        {/* Fecha, título y número */}
        <View style={styles.headerRow}>
          <Text style={styles.headerRowText}>Fecha: {formatearFecha(orden.fecha)}</Text>
          <Text style={styles.title}>ORDEN DE TRABAJO</Text>
          <Text style={styles.headerRowText}>N.º {orden.numero || ''}</Text>
        </View>

        {/* Cliente y sede */}
        <View style={styles.horizontalInfoBlocks}>
          <View style={[styles.infoBlock, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{orden.cliente?.nombre || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Empresa:</Text>
              <Text style={styles.value}>{orden.cliente?.empresa || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{orden.cliente?.direccion || ''}</Text>
            </View>
            {orden.cliente?.sedeNombre && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Sede:</Text>
                <Text style={styles.value}>{orden.cliente.sedeNombre}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Descripción del trabajo realizado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción del trabajo realizado</Text>
          <Text style={styles.colContent}>{orden.descripcionTrabajo || ''}</Text>
        </View>

        {/* Observaciones */}
        {orden.observaciones && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <Text style={styles.colContent}>{orden.observaciones}</Text>
          </View>
        )}

        {/* Firmas */}
        <View style={styles.firmasRow} wrap={false}>
          <View style={styles.firmaBlock}>
            {orden.firmaTecnico && <Image src={orden.firmaTecnico} style={styles.firmaImagen} />}
            <Text style={styles.firmaLinea}>Firma del técnico</Text>
            <Text style={styles.firmaAclaracion}>{orden.aclaracionFirmaTecnico || 'Sin aclaración'}</Text>
          </View>
          <View style={styles.firmaBlock}>
            {orden.firmaCliente && <Image src={orden.firmaCliente} style={styles.firmaImagen} />}
            <Text style={styles.firmaLinea}>Conformidad del cliente</Text>
            <Text style={styles.firmaAclaracion}>{orden.aclaracionFirmaCliente || 'Sin aclaración'}</Text>
          </View>
        </View>

        {/* Planillas de inspección adjuntas */}
        {orden.planillasAdjuntas?.length > 0 && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Se adjunta la siguiente inspección</Text>
            {orden.planillasAdjuntas.map((planilla, i) => (
              <View key={i} style={styles.planillaBloque}>
                {planilla.tipo === 'tabular' ? (
                  <View style={{ padding: 5 }}>
                    <View wrap={false}>
                      <View style={styles.planillaTitulo}>
                        <Text style={styles.planillaGrupo}>{planilla.grupo}</Text>
                        <Text style={styles.planillaNombre}>{planilla.titulo}</Text>
                      </View>
                      <View style={styles.tablaHeaderRow}>
                        <View style={[styles.tablaHeaderCellId, { width: 18 }]}><Text>Nº</Text></View>
                        {(planilla.camposTexto || []).map((campo) => (
                          <View key={campo} style={[styles.tablaHeaderCellId, { width: 50 }]}><Text>{campo}</Text></View>
                        ))}
                        {planilla.columnas.map((col) => (
                          <View key={col} style={styles.tablaHeaderCellCol}>
                            <Text style={styles.tablaHeaderCellColTexto}>{col}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    {(planilla.unidades || []).map((unidad, k) => (
                      <View key={k} style={styles.tablaRow} wrap={false}>
                        <Text style={[styles.tablaCellId, { width: 18 }]}>{unidad.numero}</Text>
                        {(planilla.camposTexto || []).map((campo) => (
                          <Text key={campo} style={[styles.tablaCellId, { width: 50 }]}>{unidad.campos?.[campo] || ''}</Text>
                        ))}
                        {planilla.columnas.map((col) => {
                          const valor = unidad.valores?.[col];
                          return (
                            <Text key={col} style={[styles.tablaCellValor, { color: ESTADO_COLOR[valor] || '#999' }]}>
                              {ESTADO_LABEL[valor] || '-'}
                            </Text>
                          );
                        })}
                      </View>
                    ))}

                    {(planilla.unidades || []).some((u) => u.observacion) && (
                      <View style={{ marginTop: 6 }}>
                        {planilla.unidades.filter((u) => u.observacion).map((u, k) => (
                          <Text key={k} style={styles.tablaNota}>
                            {planilla.nombreUnidad} {u.numero}{u.severidad ? ` — ${u.severidad}` : ''}: {u.observacion}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <>
                    <View wrap={false}>
                      <View style={styles.planillaTitulo}>
                        <Text style={styles.planillaGrupo}>{planilla.grupo}</Text>
                        <Text style={styles.planillaNombre}>{planilla.titulo}</Text>
                      </View>
                      <View style={styles.checklistHeader}>
                        <Text style={[styles.checklistDescripcion, styles.checklistColHeader]}>Ítem</Text>
                        <Text style={[styles.checklistEstado, styles.checklistColHeader]}>Estado</Text>
                        <Text style={[styles.checklistObservacion, styles.checklistColHeader]}>Observación</Text>
                      </View>
                    </View>
                    {planilla.items.map((item, j) => (
                      <View key={j} wrap={false}>
                        {item.subtitulo && (
                          <Text style={styles.checklistSubtitulo}>{item.subtitulo}</Text>
                        )}
                        <View style={styles.checklistRow}>
                          <Text style={styles.checklistDescripcion}>{j + 1}. {item.descripcion}</Text>
                          <Text style={[styles.checklistEstado, { color: ESTADO_COLOR[item.estado] || '#999' }]}>
                            {ESTADO_LABEL[item.estado] || '-'}
                          </Text>
                          <Text style={styles.checklistObservacion}>
                            {item.observacion || ''}
                            {item.severidad ? ` (${item.severidad})` : ''}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Fotos (última sección) */}
        {orden.fotos?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <View style={styles.fotosGrid}>
              {orden.fotos.map((foto, index) => (
                <View key={foto.path || index} style={styles.fotoItem} wrap={false}>
                  <Image src={foto.url} style={styles.foto} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pie de página */}
        <View style={styles.footer} fixed>
          <Text>AAS Security - CUIT: 20-24471842-7</Text>
          <Text>Ceferino Namuncura 5400, 5000 - Córdoba - Tel: (351) 311 2962 - www.aassecurity.com.ar</Text>
          <Text style={{ marginTop: 5 }} render={({ pageNumber, totalPages }) => (
            `Hoja ${pageNumber} de ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};

export default OrdenTrabajoPDF;
