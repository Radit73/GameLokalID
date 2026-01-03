const sections = [
  {
    id: 'collection',
    title: 'Data yang Kami Kumpulkan',
    description:
      'Kami mengumpulkan data akun (nama, email, kata sandi terenkripsi) saat kamu registrasi. Selain itu kami menyimpan aktivitas review, rating, dan preferensi genre untuk meningkatkan rekomendasi konten.',
    points: [
      'Informasi akun: nama lengkap, alamat email, dan role (user/admin).',
      'Aktivitas komunitas: review, rating, komentar, dan daftar game favorit.',
      'Data teknis: log akses, perangkat, dan kota untuk analitik agregat.',
    ],
  },
  {
    id: 'usage',
    title: 'Bagaimana Data Digunakan',
    description:
      'Data membantu menjaga integritas review dan memberikan insight bagi developer game lokal.',
    points: [
      'Menampilkan statistik rating dan highlight komunitas secara real-time.',
      'Mengirim notifikasi terkait respon review atau kampanye game yang kamu ikuti.',
      'Moderasi otomatis untuk mendeteksi spam dan konten yang menyalahi panduan.',
    ],
  },
  {
    id: 'sharing',
    title: 'Berbagi Data',
    description:
      'Kami tidak menjual data pribadimu. Informasi hanya dibagikan secara agregat kepada partner developer atau institusi pendidikan untuk riset game lokal.',
    points: [
      'Data pribadi yang dapat mengidentifikasi individu tidak dibagikan tanpa persetujuan.',
      'Partner menerima insight anonim seperti rating rata-rata, genre populer, atau trend kota.',
      'Akses admin internal dicatat dan diaudit secara berkala.',
    ],
  },
  {
    id: 'control',
    title: 'Kontrol & Hak Pengguna',
    description:
      'Kamu berhak meminta salinan data, memperbarui profil, atau menghapus akun kapan saja.',
    points: [
      'Gunakan halaman profil untuk update data atau mengunduh arsip review.',
      'Kirim permintaan penghapusan melalui email support@gamelokal.id.',
      'Kami akan merespon permintaan privasi maksimal 7 hari kerja.',
    ],
  },
];

import { useEffect, useState } from 'react';
import { getTheme } from '../utils/theme.js';

const PrivacyPolicy = () => {
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
      <p className="hero__tagline">Kebijakan Privasi GameLokalID</p>
      <h1>Menjaga kepercayaan komunitas reviewer game lokal</h1>
      <p>
        Dokumen ini menjelaskan bagaimana kami mengelola data pengguna, tujuan pemrosesan, serta
        hak kamu sebagai bagian dari komunitas GameLokalID. Harap baca secara menyeluruh sebelum
        menggunakan platform kami.
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
        <p className="policy-faq__question">Bagaimana jika ada pelanggaran data?</p>
        <p>
          Kami akan mengirim pemberitahuan ke email terdaftar, melakukan reset kredensial, serta
          memberikan laporan lengkap dalam 72 jam.
        </p>
      </div>
      <div className="policy-faq__item">
        <p className="policy-faq__question">Apakah anak di bawah 16 tahun boleh menggunakan platform?</p>
        <p>
          Pengguna berusia di bawah 16 tahun membutuhkan persetujuan orang tua. Kami akan menghapus
          data jika mengetahui ada pelanggaran usia.
        </p>
      </div>
      <div className="policy-faq__item">
        <p className="policy-faq__question">Kontak privasi</p>
        <p>
          Email{' '}
          <a href="mailto:privacy@gamelokal.id" className="policy-link">
            privacy@gamelokal.id
          </a>{' '}
          untuk pertanyaan tambahan terkait kebijakan ini.
        </p>
      </div>
    </section>
  </div>
  );
};

export default PrivacyPolicy;
