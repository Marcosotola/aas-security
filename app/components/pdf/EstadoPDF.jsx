import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

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
    marginTop: -5,
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
  infoColumn: {
    flex: 1,
    marginRight: 10,
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
  col6: {
    flex: 6,
  },
  col5: {
    flex: 5,
  },
  col4: {
    flex: 4,
  },
  col3: {
    flex: 3,
  },
  col25: {
    flex: 2.5,
  },
  col2: {
    flex: 2,
  },
  col15: {
    flex: 1.5,
  },
  col1: {
    flex: 1,
  },
  colHeader: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  colContent: {
    fontSize: 9,
    paddingRight: 12,
  },
  conceptoContent: {
    fontSize: 9,
    paddingRight: 25,
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
    paddingHorizontal: 8,
    fontSize: 10,
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 9,
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  totals: {
    marginTop: 10,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 9,
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 2,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1A5276',
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1A5276',
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

// Función para formatear la fecha a DD/MM/AAAA
const formatDate = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// Función para formatear montos con punto como separador de miles y coma para decimales
const formatearMonto = (valor) => {
  if (isNaN(valor)) return "0,00";

  // Convertir a número si es string
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;

  // Formatear con separador de miles (punto) y decimales (coma)
  return num.toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const EstadoPDF = ({ estado }) => {
  // Verificar que cliente existe y tiene propiedades
  const clienteData = estado.cliente || {};

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
            <Text>Web: aas-security.vercel.app</Text>
          </View>
        </View>

        {/* Nueva Fila de Encabezado con Fecha, Título y Número */}
        <View style={styles.headerRow}>
          <Text style={styles.headerRowText}>Fecha: {formatDate(estado.fecha)}</Text>
          <Text style={styles.title}>ESTADO DE CUENTA</Text>
          <Text style={styles.headerRowText}>N.º {estado.numero || ''}</Text>
        </View>

        {/* Información del presupuesto y cliente en horizontal */}
        <View style={styles.horizontalInfoBlocks}>
          {/* Información del presupuesto */}
          <View style={[styles.infoBlock, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.sectionTitle}>Datos</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>N.º de Estado:</Text>
              <Text style={styles.value}>{estado.numero || ''}</Text>
            </View>
          </View>

          {/* Información del cliente */}
          <View style={[styles.infoBlock, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{estado.cliente.nombre || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Empresa:</Text>
              <Text style={styles.value}>{estado.cliente.empresa || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{estado.cliente.email || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tel:</Text>
              <Text style={styles.value}>{estado.cliente.telefono || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{estado.cliente.direccion || ''}</Text>
            </View>
            {estado.cliente.sedeNombre && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Sede:</Text>
                <Text style={styles.value}>{estado.cliente.sedeNombre}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabla de items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reporte de avances</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.col15, styles.colHeader]}>Fecha</Text>
            <Text style={[styles.col4, styles.colHeader]}>Concepto</Text>
            <Text style={[styles.col25, styles.colHeader]}>Monto</Text>
            <Text style={[styles.col4, styles.colHeader]}>Comentarios</Text>
          </View>

          {(estado.items || []).map((item, index) => (
            <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.oddRow : {}]} wrap={false}>
              <Text style={[styles.col15, styles.colContent]}>{formatDate(item.fecha)}</Text>
              <Text style={[styles.col4, styles.conceptoContent]}>{item.descripcion || ''}</Text>
              <Text style={[styles.col25, styles.colContent]}>$ {formatearMonto(parseFloat(item.precio || 0))}</Text>
              <Text style={[styles.col4, styles.colContent]}>{item.comentarios || ''}</Text>
            </View>
          ))}

          {/* Total */}
          <View style={styles.totals}>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>SALDO: </Text>
              <Text style={styles.grandTotalValue}>$ {formatearMonto(parseFloat(estado.total || 0))}</Text>
            </View>
          </View>
        </View>

        {/* Pie de página con numeración */}
        <View style={styles.footer} fixed>
          <Text>AAS Security - CUIT: 20-24471842-7</Text>
          <Text>Ceferino Namuncura 5400, 5000 - Córdoba - Tel: (351) 311 2962 - aas-security.vercel.app</Text>
          <Text style={{ marginTop: 5 }} render={({ pageNumber, totalPages }) => (
            `Hoja ${pageNumber} de ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};

export default EstadoPDF;