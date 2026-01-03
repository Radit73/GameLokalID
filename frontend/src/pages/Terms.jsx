const sections = [
  {
    id: 'acceptance',
    title: 'Persetujuan Penggunaan',
    description:
      'Dengan mengakses GameLokalID, kamu dianggap memahami dan menyetujui seluruh syarat yang berlaku.',
    points: [
      'Gunakan platform hanya untuk kebutuhan komunitas game lokal.',
      'Akun tidak boleh dipindahtangankan tanpa izin.',
      'Pelanggaran berat dapat berujung pada penangguhan akses.',
    ],
  },
  {
    id: 'accounts',
    title: 'Akun & Keamanan',
    description:
      'Kamu bertanggung jawab menjaga keamanan kredensial dan aktivitas di akunmu.',
    points: [
      'Pastikan email aktif untuk verifikasi dan notifikasi.',
      'Laporkan aktivitas mencurigakan ke admin secepatnya.',
      'Password disimpan terenkripsi untuk keamanan.',
    ],
  },
  {
    id: 'reviews',
    title: 'Konten Review & Komentar',
    description:
      'Review harus jujur, relevan, dan menghormati komunitas serta developer.',
    points: [
      'Dilarang menyebarkan konten spam, hoaks, atau ujaran kebencian.',
      'Konten dapat dimoderasi atau dihapus jika melanggar kebijakan.',
      'Hak cipta tetap milik penulis, namun kami boleh menampilkan di platform.',
    ],
  },
  {
    id: 'liability',
    title: 'Batasan Tanggung Jawab',
    description:
      'Kami berusaha menjaga layanan tetap stabil, namun tidak menjamin bebas gangguan.',
    points: [
      'Downtime atau gangguan teknis dapat terjadi tanpa pemberitahuan.',
      'Kami tidak bertanggung jawab atas kerugian akibat penggunaan pihak ketiga.',
      'Informasi ditampilkan sebagaimana adanya dari komunitas.',
    ],
  },
];

import { useEffect, useState } from 'react';
import { getTheme } from '../utils/theme.js';

const Terms = () => {
  const [theme, setTheme] = useState(() => getTheme());

  useEffect(() => {
    const handleThemeChange = () => setTheme(getTheme());
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.add('theme-page-policy');
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
    return () => {
      body.classList.remove('theme-page-policy');
      body.classList.remove('theme-light');
    };
  }, [theme]);

  return (
  <div className={`page policy-page section ${theme === 'light' ? 'theme-light' : ''}`}>
    <header className="policy-hero">
      <p className="hero__tagline">Syarat & Ketentuan GameLokalID</p>
      <h1>Aturan main untuk menjaga komunitas tetap sehat</h1>
      <p>
        Dokumen ini menjelaskan batasan penggunaan, tanggung jawab pengguna, serta ketentuan
        layanan yang berlaku di GameLokalID.
      </p>
    </header>

    <section className="policy-section">
      {sections.map((section) => (
        <article key={section.id} className="policy-card">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
          <ul>
            {section.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>

    <section className="policy-faq card">
      <h3>Pertanyaan Umum</h3>
      <div className="policy-faq__item">
        <p className="policy-faq__question">Apakah saya bisa menghapus akun kapan saja?</p>
        <p>
          Bisa. Hubungi admin melalui halaman Bantuan atau email support@gamelokal.id untuk
          permintaan penghapusan akun.
        </p>
      </div>
      <div className="policy-faq__item">
        <p className="policy-faq__question">Bagaimana jika ada pelanggaran komunitas?</p>
        <p>
          Laporkan lewat fitur Bantuan. Tim kami akan meninjau dan memberikan tindakan sesuai
          kebijakan.
        </p>
      </div>
      <div className="policy-faq__item">
        <p className="policy-faq__question">Kontak layanan</p>
        <p>
          Email{' '}
          <a href="mailto:support@gamelokal.id" className="policy-link">
            support@gamelokal.id
          </a>{' '}
          untuk pertanyaan tambahan terkait syarat dan ketentuan.
        </p>
      </div>
    </section>
  </div>
  );
};

export default Terms;
