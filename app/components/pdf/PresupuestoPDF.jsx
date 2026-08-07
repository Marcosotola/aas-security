// components/pdf/PresupuestoPDF.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { formatearFecha } from '../../lib/fecha';

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
  col4: {
    flex: 4,
  },
  col3: {
    flex: 3,
  },
  col2: {
    flex: 2,
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
  },
  // Nuevo estilo específico para la descripción con padding derecho
  colContentDescription: {
    fontSize: 9,
    paddingRight: 15, // Agrega espacio a la derecha de la descripción
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
  // Nuevos estilos para descuentos
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  discountLabel: {
    fontSize: 9,
    color: '#e74c3c', // Color rojo para descuentos
  },
  discountValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#e74c3c', // Color rojo para descuentos
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
  // Manejar casos donde el valor no es válido
  if (valor === null || valor === undefined || isNaN(valor) || valor === '') {
    return "0,00";
  }

  // Convertir a número si es string
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;

  // Verificar nuevamente después de la conversión
  if (isNaN(num)) {
    return "0,00";
  }

  // Formatear con separador de miles (punto) y decimales (coma)
  return num.toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const PresupuestoPDF = ({ presupuesto }) => {

  // Verificar que cliente existe y tiene propiedades
  const clienteData = presupuesto.cliente || {};

  // Verificar si hay descuento aplicado
  const tieneDescuento = presupuesto.montoDescuento && presupuesto.montoDescuento > 0;

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
          <Text style={styles.headerRowText}>Fecha: {formatearFecha(presupuesto.fecha)}</Text>
          <Text style={styles.title}>PRESUPUESTO</Text>
          <Text style={styles.headerRowText}>N.º {presupuesto.numero || ''}</Text>
        </View>

        {/* Información del presupuesto y cliente en horizontal */}
        <View style={styles.horizontalInfoBlocks}>
          {/* Información del presupuesto */}
          <View style={[styles.infoBlock, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.sectionTitle}>Condiciones</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Validez:</Text>
              <Text style={styles.value}>{presupuesto.validez || ''}</Text>
            </View>
          </View>

          {/* Información del cliente */}
          <View style={[styles.infoBlock, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{presupuesto.cliente?.nombre || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Empresa:</Text>
              <Text style={styles.value}>{presupuesto.cliente?.empresa || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{presupuesto.cliente?.email || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tel:</Text>
              <Text style={styles.value}>{presupuesto.cliente?.telefono || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{presupuesto.cliente?.direccion || ''}</Text>
            </View>
            {presupuesto.cliente?.sedeNombre && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Sede:</Text>
                <Text style={styles.value}>{presupuesto.cliente.sedeNombre}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Detalle: tabla de items o descripción global según el modo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{presupuesto.modo === 'global' ? 'Descripción' : 'Detalle de Items'}</Text>

          {presupuesto.modo === 'global' ? (
            <View style={{ padding: 8, backgroundColor: '#f9f9f9', borderRadius: 5 }}>
              <Text style={[styles.colContent, { lineHeight: 1.5 }]}>
                {presupuesto.items?.[0]?.descripcion || ''}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.col4, styles.colHeader]}>Descripción</Text>
                <Text style={[styles.col1, styles.colHeader]}>Cant.</Text>
                <Text style={[styles.col2, styles.colHeader]}>Precio Unit.</Text>
                <Text style={[styles.col2, styles.colHeader]}>Subtotal</Text>
              </View>

              {(presupuesto.items || []).map((item, index) => (
                <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.oddRow : {}]} wrap={false}>
                  {/* Aplicamos el nuevo estilo con padding derecho solo a la descripción */}
                  <Text style={[styles.col4, styles.colContentDescription]}>{item.descripcion || ''}</Text>
                  <Text style={[styles.col1, styles.colContent]}>{parseFloat(item.cantidad || 0)}</Text>
                  <Text style={[styles.col2, styles.colContent]}>$ {formatearMonto(parseFloat(item.precioUnitario || 0))}</Text>
                  <Text style={[styles.col2, styles.colContent]}>$ {formatearMonto(parseFloat(item.subtotal || 0))}</Text>
                </View>
              ))}
            </>
          )}

          {/* Totales con descuentos */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>$ {formatearMonto(parseFloat(presupuesto.subtotal || 0))}</Text>
            </View>

            {/* Mostrar descuento si existe */}
            {tieneDescuento && (
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>
                  Descuento {presupuesto.tipoDescuento === 'porcentaje' ?
                    `(${presupuesto.valorDescuento}%)` :
                    '(monto fijo)'
                  }:
                </Text>
                <Text style={styles.discountValue}>-$ {formatearMonto(parseFloat(presupuesto.montoDescuento))}</Text>
              </View>
            )}

            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>TOTAL:</Text>
              <Text style={styles.grandTotalValue}>$ {formatearMonto(parseFloat(presupuesto.total || 0))}</Text>
            </View>
          </View>
        </View>

        {/* Notas */}
        <View style={styles.notes}>
          <Text style={styles.sectionTitle}>Notas y Condiciones</Text>
          <Text style={styles.colContent}>{presupuesto.notas || ''}</Text>
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

export default PresupuestoPDF;

