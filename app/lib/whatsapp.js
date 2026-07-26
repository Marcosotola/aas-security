// app/lib/whatsapp.js

// Arma un link de WhatsApp a partir de un teléfono en cualquier formato común en Argentina
export const construirLinkWhatsApp = (telefono, mensaje) => {
  if (!telefono) return null;
  const digitos = telefono.replace(/\D/g, '');
  if (!digitos) return null;

  let numero = digitos;
  if (numero.startsWith('549')) {
    // ya viene con código de país + 9
  } else if (numero.startsWith('54')) {
    numero = `549${numero.slice(2)}`;
  } else if (numero.startsWith('9') && numero.length > 10) {
    numero = `54${numero}`;
  } else {
    numero = `549${numero}`;
  }

  const base = `https://wa.me/${numero}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
};
