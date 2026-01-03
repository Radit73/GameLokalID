import { sendEmail } from '../utils/email.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email wajib diisi.' });
    }

    const subject = 'Terima kasih telah berlangganan GameLokalID';
    const text =
      'Halo, terima kasih sudah berlangganan update GameLokalID. Kami akan kirim kabar terbaru seputar game lokal ke email ini.';
    const html = `<p>Halo,</p>
<p>Terima kasih sudah berlangganan update <strong>GameLokalID</strong>. Kami akan kirim kabar terbaru seputar game lokal ke email ini.</p>
<p>Jika ini bukan Anda, abaikan email ini.</p>`;

    await sendEmail({ to: email.trim(), subject, text, html });
    return res.json({ message: 'Berhasil berlangganan. Cek inbox Anda.' });
  } catch (error) {
    console.error('subscribeNewsletter error', error);
    return res.status(500).json({ message: 'Gagal mengirim email konfirmasi.' });
  }
};
