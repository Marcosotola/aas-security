import nodemailer from 'nodemailer';

export async function POST(request) {
  const data = await request.json();
  const { nombre, email, telefono, mensaje } = data;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Formulario Web" <${process.env.EMAIL_USER}>`,
    to: 'contacto@aassecurity.com.ar', // <-- CAMBIÁ ESTE MAIL por uno real
    subject: `Nuevo mensaje de ${nombre}`,
    text: `
📩 Nuevo mensaje de contacto:

🧑 Nombre: ${nombre}
📧 Email: ${email}
📞 Teléfono: ${telefono}
📝 Mensaje: ${mensaje}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.response); // 👈 AGREGADO

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error al enviar el correo:', error); // 👈 AGREGADO
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

