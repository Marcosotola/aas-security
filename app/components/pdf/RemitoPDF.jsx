import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos para el PDF
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
    fontSize: 20,
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
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 5,
  },
  col1: {
    flex: 1,
  },
  col4: {
    flex: 4,
  },
  colHeader: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  colContent: {
    fontSize: 9,
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
  tableHeader: {
    backgroundColor: '#1A5276',
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontSize: 10,
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 5,
    fontSize: 9,
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  notes: {
    fontSize: 9,
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
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

const RemitoPDF = ({ remito }) => {
  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

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
            <Text>Email: contacto@aassecurity.com.ar</Text>
            <Text>Teléfono: (351) 311 2962</Text>
            <Text>Web: www.aassecurity.com.ar</Text>
          </View>
        </View>

        {/* Nueva Fila de Encabezado con Fecha, Título y Número */}
        <View style={styles.headerRow}>
          <Text style={styles.headerRowText}>Fecha: {formatDate(remito.fecha)}</Text>
          <Text style={styles.title}>REMITO</Text>
          <Text style={styles.headerRowText}>N.º {remito.numero || ''}</Text>
        </View>

        {/* Información del remito y cliente en horizontal */}
        <View style={styles.horizontalInfoBlocks}>
          {/* Información del remito */}
          <View style={[styles.infoBlock, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.sectionTitle}>Referencia</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>N.º de Remito:</Text>
              <Text style={styles.value}>{remito.numero || ''}</Text>
            </View>
          </View>

          {/* Información del cliente */}
          <View style={[styles.infoBlock, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{remito.cliente?.nombre || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Empresa:</Text>
              <Text style={styles.value}>{remito.cliente?.empresa || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{remito.cliente?.direccion || ''}</Text>
            </View>
          </View>
        </View>

        {/* Tabla de items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Artículos</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.col4, styles.colHeader]}>Descripción</Text>
            <Text style={[styles.col1, styles.colHeader]}>Cantidad</Text>
            <Text style={[styles.col1, styles.colHeader]}>Unidad</Text>
          </View>

          {(remito.items || []).map((item, index) => (
            <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.oddRow : {}]} wrap={false}>
              <Text style={[styles.col4, styles.colContent]}>{item.descripcion || ''}</Text>
              <Text style={[styles.col1, styles.colContent]}>{item.cantidad || ''}</Text>
              <Text style={[styles.col1, styles.colContent]}>{item.unidad || ''}</Text>
            </View>
          ))}
        </View>

        {/* Observaciones */}
        {remito.observaciones && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <Text style={styles.colContent}>{remito.observaciones}</Text>
          </View>
        )}


        {/* Firma */}
        <View style={[styles.section, { marginTop: 40 }]}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '50%' }}>
              {remito.firma && (
                <Image
                  src={remito.firma}
                  style={{
                    width: 150,
                    height: 60,
                    marginBottom: 5,
                    alignSelf: 'center'
                  }}
                />
              )}
              <Text style={{
                borderTopWidth: 1,
                borderTopColor: '#333',
                paddingTop: 5,
                fontSize: 9,
                textAlign: 'center'
              }}>
                Recibí conforme
              </Text>
              <Text style={{ fontSize: 9, marginTop: 3, textAlign: 'center', fontWeight: 'bold' }}>
                {remito.aclaracionFirma || 'Sin aclaración'}
              </Text>
              {/*               <Text style={{ fontSize: 8, marginTop: 2, textAlign: 'center' }}>
                Firma y aclaración
              </Text> */}
            </View>
          </View>
        </View>

        {/* Pie de página con numeración */}
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

export default RemitoPDF;