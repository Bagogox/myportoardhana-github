// Vercel Serverless Function (Node.js runtime)
// Endpoint: /api/download-cv
// Membaca file CV PDF dari folder assets/docs lalu mengirimkannya
// sebagai file attachment agar otomatis ter-download di browser.

const fs = require('fs');
const path = require('path');

const CV_FILENAME = 'CV_Ilham_Yudhistira_Ardhana.pdf';
const CV_PATH = path.join(process.cwd(), 'assets', 'docs', CV_FILENAME);

module.exports = (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    if (!fs.existsSync(CV_PATH)) {
      res.status(404).json({ error: 'File CV tidak ditemukan di server.' });
      return;
    }

    const stat = fs.statSync(CV_PATH);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${CV_FILENAME}"`
    );
    res.setHeader('Content-Length', stat.size);
    // Cache ringan di CDN Vercel, browser tetap boleh cek ulang
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }

    const stream = fs.createReadStream(CV_PATH);
    stream.on('error', () => {
      res.status(500).json({ error: 'Gagal membaca file CV.' });
    });
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
};
