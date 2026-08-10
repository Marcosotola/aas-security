// app/mantenimiento/page.js
import MantenimientoAviso from '../components/MantenimientoAviso';

export const metadata = {
  title: 'Sitio en mantenimiento | AAS Security',
};

export default function Mantenimiento() {
  return <MantenimientoAviso />;
}
