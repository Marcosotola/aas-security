// app/components/pdf/ReciboPDF.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos compactos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 60,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  reciboNumber: {
    fontSize: 14,
    color: '#1A5276'
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4
  },
  content: {
    marginBottom: 20,
  },
  field: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 100,
    color: '#555',
  },
  value: {
    fontSize: 10,
    flex: 1,
    color: '#000',
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    paddingTop: 20,
  },
  signatureBox: {
    width: '40%',
    alignItems: 'center',
  },
  signatureImage: {
    width: 120,
    height: 50,
    marginBottom: 5,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    width: '100%',
    paddingTop: 3,
  },
  signatureLabel: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
    color: '#666',
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

const ReciboPDF = ({ recibo }) => {
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado compacto */}
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
            <Text>Tel: (351) 311 2962</Text>
            <Text>contacto@aassecurity.com.ar</Text>
          </View>
        </View>

        {/* Nueva Fila de Encabezado con Fecha, Título y Número */}
        <View style={styles.headerRow}>
          <Text style={styles.headerRowText}>Fecha: {formatDate(recibo.fecha)}</Text>
          <Text style={styles.title}>RECIBO</Text>
          <Text style={styles.headerRowText}>N.º {recibo.numero || ''}</Text>
        </View>

        {/* Monto destacado */}
        <View style={styles.amount}>
          <Text>{formatCurrency(recibo.monto)}</Text>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>RECIBÍ DE:</Text>
              <Text style={styles.value}>{recibo.recibiDe || ''}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>LA SUMA DE:</Text>
              <Text style={styles.value}>{recibo.cantidadLetras || ''}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>CONCEPTO:</Text>
              <Text style={styles.value}>{recibo.concepto || ''}</Text>
            </View>
          </View>

        </View>

        {/* Sección de firmas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            {recibo.firma && (
              <Image src={recibo.firma} style={styles.signatureImage} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>FIRMA</Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={{ height: 50, justifyContent: 'flex-end' }}>
              {recibo.aclaracion && (
                <Text style={{ fontSize: 10, textAlign: 'center' }}>{recibo.aclaracion}</Text>
              )}
            </View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>ACLARACIÓN</Text>
          </View>
        </View>

        {/* Pie de página con numeración */}
        <View style={styles.footer} fixed>
          <Text>AAS Security - Ceferino Namuncura 5400, 5000 - Córdoba</Text>
          <Text style={{ marginTop: 5 }} render={({ pageNumber, totalPages }) => (
            `Hoja ${pageNumber} de ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};

export default ReciboPDF;



