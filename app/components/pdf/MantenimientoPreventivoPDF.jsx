import React from 'react';
import { Document } from '@react-pdf/renderer';
import { OrdenTrabajoPagina } from './OrdenTrabajoPDF';

// Mismo formato que la Orden de Trabajo (antes era una copia entera del
// archivo); solo cambia el título.
const MantenimientoPreventivoPDF = ({ mantenimiento }) => (
  <Document>
    <OrdenTrabajoPagina orden={mantenimiento} titulo="MANTENIMIENTO PREVENTIVO" />
  </Document>
);

export default MantenimientoPreventivoPDF;
