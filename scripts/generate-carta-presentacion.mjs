// scripts/generate-carta-presentacion.mjs
// Genera de forma estatica public/carta-presentacion-aas-security.pdf
// Ejecutar con: node scripts/generate-carta-presentacion.mjs
import React from 'react';
import { renderToFile, Document, Page, Text, View, StyleSheet, Svg, Circle } from '@react-pdf/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const h = React.createElement;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'carta-presentacion-aas-security.pdf');

const COLORS = {
  primary: '#1A5276',
  secondary: '#2E86C1',
  success: '#27AE60',
  text: '#000000',
  gray: '#444444',
  lightGray: '#666666',
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingTop: 100,
    paddingBottom: 60,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 10,
  },
  emblem: {
    marginRight: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 8,
    color: COLORS.lightGray,
    marginTop: 2,
  },
  headerInfo: {
    fontSize: 8,
    textAlign: 'right',
    color: COLORS.gray,
    lineHeight: 1.5,
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
    color: '#888888',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.secondary,
    alignSelf: 'center',
    marginBottom: 18,
  },
  paragraph: {
    fontSize: 10.5,
    lineHeight: 1.6,
    color: COLORS.text,
    textAlign: 'justify',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 14,
    marginBottom: 10,
  },
  valueCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    backgroundColor: '#f7fafc',
    padding: 10,
    marginBottom: 8,
  },
  valueTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 3,
  },
  valueText: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: COLORS.gray,
  },
  signatureBlock: {
    marginTop: 24,
    alignItems: 'flex-end',
  },
  signatureText: {
    fontSize: 10,
    color: COLORS.text,
    lineHeight: 1.6,
    textAlign: 'right',
  },
  signatureName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 6,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: COLORS.primary,
    padding: 6,
    marginBottom: 10,
    marginTop: 4,
  },
  serviceBlock: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 10,
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingRight: 4,
  },
  bulletDot: {
    fontSize: 9,
    color: COLORS.secondary,
    marginRight: 5,
  },
  bulletText: {
    fontSize: 9,
    color: COLORS.gray,
    lineHeight: 1.4,
    flex: 1,
  },
  modeloRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  modeloTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 140,
  },
  modeloText: {
    fontSize: 9.5,
    color: COLORS.gray,
    flex: 1,
    lineHeight: 1.4,
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  whyCard: {
    width: '48%',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
    backgroundColor: '#f7fafc',
    padding: 10,
    marginBottom: 10,
  },
  whyTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 3,
  },
  whyText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: COLORS.gray,
  },
  ctaBox: {
    marginTop: 10,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  ctaTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  ctaRow: {
    fontSize: 9.5,
    color: COLORS.text,
    marginBottom: 2,
  },
});

const Emblem = ({ size = 22 }) =>
  h(Svg, { width: size, height: size, style: styles.emblem, viewBox: '0 0 24 24' },
    h(Circle, { cx: 12, cy: 12, r: 11, fill: COLORS.primary, fillOpacity: 0.9 }),
    h(Circle, { cx: 12, cy: 12, r: 6.5, fill: COLORS.secondary })
  );

const HeaderBlock = () =>
  h(View, { style: styles.header, fixed: true },
    h(View, { style: styles.logoContainer },
      h(Emblem, null),
      h(View, null,
        h(Text, { style: styles.logoText },
          h(Text, { style: { color: COLORS.primary } }, 'AAS'),
          h(Text, { style: { color: COLORS.secondary } }, ' Security')
        ),
        h(Text, { style: styles.tagline }, 'Detección de incendios y seguridad electrónica')
      )
    ),
    h(View, { style: styles.headerInfo },
      h(Text, null, 'Tel / WhatsApp: (351) 311-2962'),
      h(Text, null, 'Email: alexalanspitel.security@gmail.com'),
      h(Text, null, 'Web: aas-security.vercel.app')
    )
  );

const FooterBlock = () =>
  h(View, { style: styles.footer, fixed: true },
    h(Text, null, 'AAS Security — Ceferino Namuncura 5400, 5000 Córdoba, Argentina · (351) 311-2962 · aas-security.vercel.app'),
    h(Text, {
      style: { marginTop: 4 },
      render: ({ pageNumber, totalPages }) => `Hoja ${pageNumber} de ${totalPages}`,
    })
  );

const Bullet = (text) =>
  h(View, { style: styles.bulletRow, key: text },
    h(Text, { style: styles.bulletDot }, '•'),
    h(Text, { style: styles.bulletText }, text)
  );

const ValueCard = (title, text) =>
  h(View, { style: styles.valueCard, key: title },
    h(Text, { style: styles.valueTitle }, title),
    h(Text, { style: styles.valueText }, text)
  );

const ServiceBlock = (title, bullets) =>
  h(View, { style: styles.serviceBlock, key: title, wrap: false },
    h(Text, { style: styles.serviceTitle }, title),
    ...bullets.map(Bullet)
  );

const WhyCard = (title, text) =>
  h(View, { style: styles.whyCard, key: title },
    h(Text, { style: styles.whyTitle }, title),
    h(Text, { style: styles.whyText }, text)
  );

const ModeloRow = (title, text) =>
  h(View, { style: styles.modeloRow, key: title },
    h(Text, { style: styles.modeloTitle }, title),
    h(Text, { style: styles.modeloText }, text)
  );

const CartaPresentacionDoc = () =>
  h(Document, null,
    // Página 1: carta + propuesta de valor
    h(Page, { size: 'A4', style: styles.page },
      h(HeaderBlock),
      h(Text, { style: styles.title }, 'CARTA DE PRESENTACIÓN'),
      h(View, { style: styles.titleUnderline }),

      h(Text, { style: styles.paragraph },
        'Estimados colaboradores y clientes:'
      ),
      h(Text, { style: styles.paragraph },
        'En AAS Security ponemos a su disposición nuestra experiencia y solidez en el mercado de la seguridad integral y la prevención de siniestros. Nuestra prioridad es responder a sus necesidades de protección con un estándar de excelencia, respaldado por un equipo técnico calificado y una atención cercana en cada etapa del proyecto.'
      ),
      h(Text, { style: styles.paragraph },
        'Nuestra actividad abarca desde el relevamiento inicial y la evaluación de riesgos hasta el diseño, la instalación, la puesta en marcha y el mantenimiento de sistemas tecnológicos avanzados. Diseñamos cada solución a medida de la infraestructura del cliente —hogares, comercios, industrias y consorcios— cuidando lo más importante: la vida de las personas y la integridad de sus bienes.'
      ),
      h(Text, { style: styles.paragraph },
        'A continuación presentamos nuestra propuesta de valor y el portafolio integral de soluciones que ofrecemos. Quedamos a su disposición para coordinar una visita técnica o una auditoría diagnóstica en sus instalaciones.'
      ),

      h(Text, { style: styles.sectionTitle }, 'Nuestra propuesta de valor'),
      ValueCard(
        'Garantía y certificación',
        'Nuestros productos y servicios se encuentran homologados según las normativas vigentes, incluyendo matafuegos con certificación IRAM 3542.'
      ),
      ValueCard(
        'Respaldo tecnológico',
        'Trabajamos con marcas de vanguardia internacional, como las centrales híbridas y direccionables Inim Previdia, con control táctil y supervisión remota en la nube.'
      ),
      ValueCard(
        'Eficiencia y calidad',
        'Aplicamos metodologías ágiles para asegurar instalaciones prolijas, puestas en marcha inmediatas y planes de mantenimiento con tiempos de respuesta mínimos.'
      ),

      h(View, { style: styles.signatureBlock },
        h(Text, { style: styles.signatureText }, 'Atentamente,'),
        h(Text, { style: styles.signatureName }, 'Alex Alan Spitel'),
        h(Text, { style: styles.signatureText }, 'Director'),
        h(Text, { style: styles.signatureText }, 'AAS Security')
      ),

      h(FooterBlock)
    ),

    // Página 2: portafolio de soluciones + modelos de servicio + contacto
    h(Page, { size: 'A4', style: styles.page },
      h(HeaderBlock),
      h(Text, { style: styles.sectionTitle }, 'Portafolio integral de soluciones'),

      h(Text, { style: styles.groupTitle }, 'PROTECCIÓN CONTRA INCENDIOS'),
      ServiceBlock('Detección y extinción de incendios', [
        'Centrales analógicas, inteligentes y direccionables (ej. Inim Previdia) con supervisión remota en la nube',
        'Detección por aspiración y detectores lineales de temperatura',
        'Detectores ópticos de humo, sensores de calor y pulsadores manuales',
        'Rociadores automáticos, agentes limpios para salas de servidores y puertas cortafuego homologadas',
        'Salas de bombas e infraestructura hidráulica contra incendio',
      ]),
      ServiceBlock('Matafuegos y red húmeda', [
        'Venta, recarga e inspección de matafuegos con certificación IRAM 3542',
        'Control automático de vencimientos y prueba hidráulica periódica',
        'Instalación, reparación y mantenimiento de gabinetes de red húmeda',
      ]),
      ServiceBlock('Consorcios', [
        'Mantenimiento de sistemas de incendio y matafuegos en áreas comunes',
        'Planes de evacuación y simulacros',
        'Cámaras y control de accesos en espacios comunes del edificio',
      ]),

      h(Text, { style: styles.groupTitle }, 'SEGURIDAD ELECTRÓNICA'),
      ServiceBlock('Alarmas e intrusión', [
        'Detección de intrusión y protección de puertas, ventanas y perímetros',
        'Alertas inmediatas ante cualquier situación anormal o intento de acceso no autorizado',
        'Integración con monitoreo remoto y alertas automáticas',
      ]),
      ServiceBlock('Cámaras y videovigilancia (CCTV)', [
        'Cámaras IP y analógicas de alta definición',
        'Monitoreo remoto en tiempo real desde celular o PC',
        'Grabación por evento, movimiento o de forma continua',
      ]),
      ServiceBlock('Control de acceso', [
        'Equipos autónomos o conectados a servidor, con registros detallados de cada operación',
        'Trazabilidad por usuario, fecha y horario exacto',
        'Restricción de acceso por áreas y niveles de autorización',
      ]),
      ServiceBlock('Monitoreo remoto', [
        'Supervisión continua 24/7 desde plataformas o dispositivos móviles',
        'Alertas automáticas y seguimiento en tiempo real desde cualquier lugar',
      ]),

      h(FooterBlock)
    ),

    // Página 3: modelos de servicio + por qué elegirnos + contacto
    h(Page, { size: 'A4', style: styles.page },
      h(HeaderBlock),

      h(Text, { style: styles.sectionTitle }, 'Modelos de servicio: continuidad operativa'),
      ModeloRow('Ingeniería y diseño', 'Estudios preliminares de carga de fuego y planos de cobertura de seguridad.'),
      ModeloRow('Mantenimiento preventivo', 'Programas de revisión periódica para el funcionamiento óptimo y continuo de los equipos.'),
      ModeloRow('Mantenimiento correctivo', 'Asistencia técnica calificada ante fallas o emergencias en los sistemas.'),

      h(Text, { style: styles.sectionTitle }, '¿Por qué elegir AAS Security?'),
      h(View, { style: styles.whyGrid },
        WhyCard('Soluciones integrales', 'Integramos incendio, matafuegos, consorcios, alarmas, cámaras, acceso y monitoreo en un enfoque completo.'),
        WhyCard('Diseño a medida', 'Adaptamos cada instalación a las características del inmueble y al nivel de protección requerido.'),
        WhyCard('Instalación y mantenimiento', 'Soporte técnico continuo para que los sistemas funcionen de forma confiable a largo plazo.'),
        WhyCard('Atención personalizada', 'Acompañamos a cada cliente desde la evaluación inicial hasta la puesta en marcha y el seguimiento.')
      ),

      h(View, { style: styles.ctaBox },
        h(Text, { style: styles.ctaTitle }, 'Contacto comercial'),
        h(Text, { style: styles.ctaRow }, 'Para consultas técnicas, cotizaciones o coordinación de inspecciones:'),
        h(Text, { style: styles.ctaRow }, 'Teléfono / WhatsApp: (351) 311-2962'),
        h(Text, { style: styles.ctaRow }, 'Email: alexalanspitel.security@gmail.com'),
        h(Text, { style: styles.ctaRow }, 'Web: aas-security.vercel.app'),
        h(Text, { style: styles.ctaRow }, 'Dirección: Ceferino Namuncura 5400, 5000 Córdoba, Argentina')
      ),

      h(FooterBlock)
    )
  );

await renderToFile(h(CartaPresentacionDoc), OUTPUT_PATH);
console.log('PDF generado en', OUTPUT_PATH);
