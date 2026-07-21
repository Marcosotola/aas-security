// app/components/pdf/DocumentoPDF.js
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
    borderBottomWidth: 1,
    borderBottomColor: '#1A5276',
    paddingBottom: 8
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextContainer: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfo: {
    fontSize: 8,
    textAlign: 'right',
    color: '#666',
  },
  titleRow: {
    marginBottom: 20,
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
  subtitle: {
    fontSize: 12,
    color: '#666'
  },
  content: {
    marginBottom: 20,
    minHeight: 400,
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#000',
    textAlign: 'justify'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    fontSize: 7,
    textAlign: 'center',
    color: '#888',
  },
});

const DocumentoPDF = ({ documento }) => {
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
            <Text>CUIT: 20-24471842-7</Text>
            <Text>Tel: (351) 681 0777</Text>
            <Text>contacto@aassecurity.com.ar</Text>
          </View>
        </View>

        {/* Nueva Fila de Encabezado con Fecha y Título */}
        <View style={styles.headerRow}>
          <Text style={styles.headerRowText}>Fecha: {formatDate(documento.fecha)}</Text>
          <Text style={styles.title}>{documento.titulo || 'DOCUMENTO'}</Text>
          <Text style={styles.headerRowText}></Text>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <Text style={styles.bodyText}>{documento.contenido || ''}</Text>
        </View>

        {/* Pie de página con numeración */}
        <View style={styles.footer} fixed>
          <Text>AAS Security - Av. Luciano Torrent 4800, 5000 - Córdoba</Text>
          <Text style={{ marginTop: 5 }} render={({ pageNumber, totalPages }) => (
            `Hoja ${pageNumber} de ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};

export default DocumentoPDF;