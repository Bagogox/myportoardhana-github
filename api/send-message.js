// Vercel Serverless Function (Node.js runtime)
// Endpoint: /api/send-message
// Menerima { name, email, message } dari form contact lalu mengirimkannya
// sebagai email ke alamat pemilik website via Gmail SMTP (Nodemailer).
//
// ENV VARS yang wajib diset di Vercel (Project Settings -> Environment Variables):
//   GMAIL_USER           = alamat gmail pengirim, mis. ilhamyudhistiraardhana10@gmail.com
//   GMAIL_APP_PASSWORD   = App Password 16 digit dari akun Gmail tsb (bukan password biasa)
//   CONTACT_TO_EMAIL     = (opsional) email tujuan, default = GMAIL_USER

const nodemailer = require('nodemailer');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { name, email, message, company } = req.body || {};

    // Honeypot: field tersembunyi ini harus selalu kosong.
    // Kalau terisi, kemungkinan besar itu bot -> diam-diam tolak (jangan beri tahu bot).
    if (company) {
      res.status(200).json({ ok: true });
      return;
    }

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Nama, email, dan pesan wajib diisi.' });
      return;
    }
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Format email tidak valid.' });
      return;
    }
    if (name.length > 150 || email.length > 150) {
      res.status(400).json({ error: 'Input terlalu panjang.' });
      return;
    }
    if (message.length < 5) {
      res.status(400).json({ error: 'Pesan terlalu pendek.' });
      return;
    }
    if (message.length > 5000) {
      res.status(400).json({ error: 'Pesan terlalu panjang (maksimal 5000 karakter).' });
      return;
    }

    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
    const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || GMAIL_USER;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('GMAIL_USER / GMAIL_APP_PASSWORD belum diset di environment variables.');
      res.status(500).json({ error: 'Server belum dikonfigurasi untuk mengirim email. Hubungi admin website.' });
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    await transporter.sendMail({
      from: `"Portfolio Website" <${GMAIL_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Pesan Baru dari Portfolio - ${name}`,
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#1a1b20;">Pesan Baru dari Contact Form Website</h2>
          <p><strong>Nama:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Pesan:</strong></p>
          <p style="background:#F7FAFC;padding:16px;border-radius:8px;">${safeMessage}</p>
          <hr style="border:none;border-top:1px solid #EDF2F7;margin:24px 0;">
          <p style="color:#718096;font-size:12px;">Email ini dikirim otomatis dari form contact di website portfolio Anda.</p>
        </div>
      `
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Gagal mengirim email:', err);
    res.status(500).json({ error: 'Gagal mengirim pesan. Silakan coba lagi nanti.' });
  }
};
