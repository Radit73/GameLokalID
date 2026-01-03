import { Link } from 'react-router-dom';

const aboutHighlights = [
  {
    id: 'community',
    title: 'Komunitas Terpercaya',
    metric: '12K+',
    metricLabel: 'Member aktif setiap bulan',
    description:
      'Gamers, developer, dan kurator konten lokal saling berbagi review jujur serta tips build strategi favorit.',
    accent: 'rgba(59, 130, 246, 0.15)',
    icon: '🤝',
  },
  {
    id: 'review',
    title: 'Review Terverifikasi',
    metric: '4.8/5',
    metricLabel: 'Rata-rata rating komunitas',
    description:
      'Setiap review melewati moderasi cepat agar bebas spam dengan sorotan sentiment positif-negatif otomatis.',
    accent: 'rgba(16, 185, 129, 0.18)',
    icon: '⭐',
  },
  {
    id: 'event',
    title: 'Event Lokal & Showcase',
    metric: '35',
    metricLabel: 'Kolaborasi developer dalam setahun',
    description:
      'Dari playtest daring sampai festival kampus, kami menjembatani studio lokal dengan komunitas fansnya.',
    accent: 'rgba(249, 115, 22, 0.2)',
    icon: '🎮',
  },
];

const showcaseSections = [
  {
    id: 'discover',
    tagline: 'Review komunitas',
    title: 'Penilaian asli gamers Indonesia untuk setiap game lokal',
    description:
      'Baca ulasan terverifikasi, lihat ringkasan skor, dan pahami apa yang membuat game lokal tertentu dicintai komunitas.',
    points: [
      'Kurasi ulasan terbaru dari pemain sungguhan.',
      'Sistem rating bintang dan sentiment positif/negatif.',
      'Sorotan fitur unik setiap game secara visual.',
    ],
    image: '/src/assets/1.png',
    imageAlt: 'Gamer memberi review lewat ponsel',
    accent: 'linear-gradient(135deg, rgba(225,29,72,0.35), rgba(5,5,7,0.95))',
  },
  {
    id: 'cloud',
    tagline: 'Analitik lokal',
    title: 'Pantau performa game lokal di berbagai platform',
    description:
      'Bandingkan rating versi mobile dan PC, lihat tren genre favorit, serta telusuri review berdasarkan kota atau event komunitas.',
    points: [
      'Grafik rating mingguan dan lonjakan pemain.',
      'Filter genre, perangkat, serta studio pengembang.',
      'Ekosistem komunitas dengan highlight event lokal.',
    ],
    image: '/src/assets/2.png',
    imageAlt: 'Pemain PC memantau data game lokal',
    accent: 'linear-gradient(135deg, rgba(225,29,72,0.45), rgba(8,8,8,0.95))',
  },
];

const About = () => (
  <div className="page about-page">
    <section className="hero hero--card about-hero">
      <div className="hero-card hero-card--primary">
        <div className="hero-card__text">
          <p className="hero__tagline">Tentang GameLokalID</p>
          <h1>Misi kami: sorot game lokal Indonesia</h1>
          <p className="hero__subtitle">
            Kami hadir untuk membantu gamer menemukan karya terbaik anak bangsa, sekaligus
            memberikan panggung bagi developer lokal lewat review autentik, event komunitas, dan
            kurasi editorial.
          </p>
          <div className="hero__actions">
            <Link className="btn-primary" to="/register">
              Gabung Sekarang
            </Link>
            <Link className="btn-outline" to="/games">
              Jelajahi Game Lokal
            </Link>
          </div>
        </div>
        <div className="hero-card__visual">
          <div className="about-hero__visual about-hero__visual--media">
            <img src="/src/assets/3.gif" alt="Kolase komunitas GameLokalID" />
          </div>
        </div>
      </div>
    </section>

    <section className="section about-section about-section--tight">
      <div className="about-section__header">
        <h2>Kenapa bergabung dengan GameLokalID?</h2>
        <p>
          Lebih dari sekadar rating, kami membangun ekosistem kolaboratif di mana developer bisa
          mendapat masukan tepat sasaran dan gamer memperoleh panduan untuk mendukung karya lokal.
        </p>
      </div>
      <div className="about-section__grid">
        {aboutHighlights.map((item) => (
          <div
            key={item.id}
            className="about-card"
            style={{ '--accent-color': item.accent }}
          >
            <span className="about-card__icon" style={{ background: item.accent }}>
              {item.icon}
            </span>
            <p className="about-card__title">{item.title}</p>
            <div className="about-card__metric">
              <strong>{item.metric}</strong>
              <span>{item.metricLabel}</span>
            </div>
            <p className="about-card__description">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default About;
