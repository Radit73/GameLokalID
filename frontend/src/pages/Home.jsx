import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import GameCard from '../components/ui/GameCard.jsx';
import SectionTitle from '../components/ui/SectionTitle.jsx';
import { getGames, getReviewsByGame, getHomeVisitSummary, getRandomEmoji } from '../api.js';
import { getAuth } from '../utils/auth.js';
import { getTheme } from '../utils/theme.js';

const fallbackPopular = [
  {
    id: 1,
    title: 'Legenda Nusantara',
    developer: 'Studio Merah',
    rating: 4.7,
    genre: 'Aksi',
    cover: 'https://via.placeholder.com/320x180?text=Game+1',
  },
  {
    id: 2,
    title: 'Satria Malam',
    developer: 'HantuDev',
    rating: 4.5,
    genre: 'Horor',
    cover: 'https://via.placeholder.com/320x180?text=Game+2',
  },
  {
    id: 3,
    title: 'Pulau Strategis',
    developer: 'ArchiPlay',
    rating: 4.2,
    genre: 'Strategi',
    cover: 'https://via.placeholder.com/320x180?text=Game+3',
  },
  {
    id: 4,
    title: 'Balap Kampung',
    developer: 'Nitro Desa',
    rating: 4.0,
    genre: 'Balapan',
    cover: 'https://via.placeholder.com/320x180?text=Game+4',
  },
];

const latestReviews = [
  {
    id: 1,
    game: 'Legenda Nusantara',
    reviewer: 'Dewi A.',
    excerpt: 'Pertarungan seru dengan sentuhan budaya lokal yang kaya.',
  },
  {
    id: 2,
    game: 'Pulau Strategis',
    reviewer: 'Reyhan P.',
    excerpt: 'Gameplay strategi yang menantang dan visual memukau.',
  },
  {
    id: 3,
    game: 'Satria Malam',
    reviewer: 'Maya R.',
    excerpt: 'Cerita horor yang bikin merinding sepanjang permainan.',
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
    image:
      '/src/assets/1.png',
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
    image:
      '/src/assets/2.png',
    imageAlt: 'Pemain PC memantau data game lokal',
    accent: 'linear-gradient(135deg, rgba(225,29,72,0.45), rgba(8,8,8,0.95))',
  },
];

const heroVisualImage =
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80';

const Home = () => {
  const [auth, setAuth] = useState(() => getAuth());
  const [theme, setTheme] = useState(() => getTheme());
  const [topGames, setTopGames] = useState([]);
  const [error, setError] = useState('');
  const [recentReviews, setRecentReviews] = useState([]);
  const [reviewError, setReviewError] = useState('');
  const [visitData, setVisitData] = useState([]);
  const [visitError, setVisitError] = useState('');
  const [visitLoading, setVisitLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [emoji, setEmoji] = useState('🎮');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => setAuth(getAuth());
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => setTheme(getTheme());
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const data = await getGames();
        const sorted = [...data].sort(
          (a, b) => Number(b.avg_rating || b.rating || 0) - Number(a.avg_rating || a.rating || 0),
        );
        setTopGames(sorted.slice(0, 4));
        const genreMap = new Map();
        data.forEach((game) => {
          const splits = (game.genres || '')
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean);
          splits.forEach((g) => {
            const key = g.toLowerCase();
            if (!genreMap.has(key)) {
              genreMap.set(key, g);
            }
          });
        });
        setGenres(Array.from(genreMap.values()));
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTop();
  }, []);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const games = await getGames();
        const targets = games.slice(0, 6);
        const reviewPromises = targets.map(async (game) => {
          const reviews = await getReviewsByGame(game.id);
          return reviews.map((rev) => ({
            id: rev.id,
            game: game.title,
            reviewer: rev.user_name,
            excerpt: rev.comment,
            created_at: rev.created_at,
          }));
        });
        const collected = (await Promise.all(reviewPromises)).flat();
        const sorted = collected.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setRecentReviews(sorted.slice(0, 4));
      } catch (err) {
        setReviewError(err.message);
        setRecentReviews([]);
      }
    };
    fetchRecentReviews();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const rows = document.querySelectorAll('.home-showcase__row');
    const animatables = document.querySelectorAll('.animate-on-scroll');
    if (!rows.length && !animatables.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    [...rows, ...animatables].forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const captureAndLoad = async () => {
      try {
        setVisitLoading(true);
        const stats = await getHomeVisitSummary(auth?.token);
        if (!cancelled) {
          setVisitData(stats);
          setVisitError('');
        }
      } catch (err) {
        if (!cancelled) {
          setVisitError(err.message || 'Gagal memuat data kunjungan.');
        }
      } finally {
        if (!cancelled) {
          setVisitLoading(false);
        }
      }
    };

    captureAndLoad();

    return () => {
      cancelled = true;
    };
  }, [auth?.token]);

  const developerCtaLink = auth ? '/games?submit=true' : '/login?role=developer';
  const maxVisit = useMemo(
    () => (visitData.length ? Math.max(...visitData.map((item) => item.count), 1) : 1),
    [visitData],
  );

  const visitPoints = useMemo(() => {
    if (!visitData.length) return '';
    const lastIndex = visitData.length - 1;
    return visitData
      .map((item, idx) => {
        const x = lastIndex === 0 ? 50 : (idx / lastIndex) * 100;
        const y = 100 - (item.count / maxVisit) * 80 - 10;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [visitData, maxVisit]);

  const formatMonthLabel = (month) => {
    if (!month) return '';
    const [year, mm] = month.split('-');
    const date = new Date(`${month}-01T00:00:00Z`);
    const short = date.toLocaleString('default', { month: 'short' });
    return `${short} ${year.slice(2)}`;
  };

  const gridLines = useMemo(() => {
    const lines = [];
    const steps = 4;
    for (let i = 0; i <= steps; i += 1) {
      const y = 10 + (80 / steps) * i;
      lines.push({ y: 100 - y });
    }
    return lines;
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => Math.max(prev - 1, 0)), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldown]);

  const generateQr = async (value) => {
    const text = `GameLokalID Emoji: ${value}`;
    const dataUrl = await QRCode.toDataURL(text, { width: 300, margin: 1 });
    setQrDataUrl(dataUrl);
  };

  const handleEmojiQR = async () => {
    if (cooldown > 0) return;
    try {
      setQrLoading(true);
      const res = await getRandomEmoji();
      setEmoji(res.emoji);
      await generateQr(res.emoji);
      setCooldown(10);
    } catch (err) {
      setQrDataUrl('');
      setEmoji('🙈');
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className={`page home-page ${theme === 'light' ? 'theme-light' : ''}`}>
      <section className="hero hero--card animate-on-scroll">
      <div className="hero-card hero-card--primary">
        <div className="hero-card__text">
          <div className="hero__content hero__content--left">
            <p className="hero__tagline">Skor Komunitas Game Lokal</p>
            <h1>Portal Penilaian Game Indonesia</h1>
            <p className="hero__subtitle">
              Telusuri ratusan game karya anak bangsa, bandingkan rating antar platform, dan baca
              review autentik dari komunitas gamer Indonesia.
            </p>
            <div className="hero__actions">
              <Link className="btn-primary" to="/games">
                Jelajahi Koleksi Game
              </Link>
              {auth ? (
                <Link className="btn-outline" to="/games?submit=true">
                  Tambahkan Penilaian Game-mu
                </Link>
              ) : (
                <Link className="btn-outline" to="/login">
                  Gabung & Beri Review
                </Link>
              )}
              <Link className="btn-secondary" to={developerCtaLink}>
                Developer? Submit Game Kamu
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-card__visual">
          <div className="hero__visual">
            <div className="hero__device">
              <img src={heroVisualImage} alt="Pemain menikmati game lokal" />
            </div>
            <div className="hero__card hero__card--score">
              <p>Skor komunitas</p>
              <strong>4.9</strong>
              <small>+120 ulasan minggu ini</small>
            </div>
            <div className="hero__card hero__card--review">
              <div className="hero__reviewer">
                <span className="hero__avatar">AN</span>
                <div>
                  <p>Arman N.</p>
                  <small>Reviewer Bandung</small>
                </div>
                <span className="hero__rating-pill">5.0</span>
              </div>
              <p>
                "Lore Nusantara di game strategi ini paling imersif. Kontrol taktisnya juga makin
                halus!"
              </p>
              <span className="hero__tag">Strategi</span>
            </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-showcase animate-on-scroll">
        <div className="home-showcase__analytics card">
          <div className="home-showcase__analytics-header">
            <p className="hero__tagline">Kunjungan Login</p>
            <h3>Line Chart Kunjungan Website</h3>
            <p>Hitungan user yang berhasil login per bulan (Nov 2025 - Des 2026).</p>
          </div>
          {visitError ? (
            <p className="error-text">{visitError}</p>
          ) : (
            <div className="home-showcase__chart">
              {visitLoading && <p className="muted-text">Memuat data kunjungan...</p>}
              {!visitLoading && visitData.length === 0 && (
                <p className="muted-text">Belum ada kunjungan tercatat.</p>
              )}
              {visitData.length > 0 && (
                <div className="chart-wrapper">
                  <svg viewBox="0 0 100 110" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="visitArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(225,29,72,0.35)" />
                        <stop offset="100%" stopColor="rgba(225,29,72,0.05)" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {gridLines.map((line, idx) => (
                      <line
                        key={`grid-${idx}`}
                        x1="0"
                        x2="100"
                        y1={line.y}
                        y2={line.y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="0.4"
                      />
                    ))}
                    <polyline
                      fill="none"
                      stroke="rgba(225,29,72,0.8)"
                      strokeWidth="1.2"
                      filter="url(#glow)"
                      points={visitPoints}
                    />
                    <polygon
                      fill="url(#visitArea)"
                      points={`${visitPoints} 100,100 0,100`}
                      opacity="0.9"
                    />
                    {visitData.map((item, idx) => {
                      const lastIndex = visitData.length - 1;
                      const x = lastIndex === 0 ? 50 : (idx / lastIndex) * 100;
                      const y = 100 - (item.count / maxVisit) * 80 - 10;
                      return (
                        <g key={item.month}>
                          <circle cx={x} cy={y} r="1.3" fill="#e11d48" />
                        </g>
                      );
                    })}
                  </svg>
                  <div className="chart-legend">
                    {visitData.map((item) => (
                      <div key={item.month} className="chart-legend__item">
                        <span className="chart-legend__label">{formatMonthLabel(item.month)}</span>
                        <span className="chart-legend__value">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {showcaseSections.map((feature, index) => (
          <div
            key={feature.id}
            className={`home-showcase__row ${index % 2 !== 0 ? 'home-showcase__row--reverse' : ''}`}
          >
            <div className="home-showcase__text">
              <p className="hero__tagline">{feature.tagline}</p>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
              <ul className="home-showcase__points">
                {feature.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="home-showcase__image" style={{ background: feature.accent }}>
              <img src={feature.image} alt={feature.imageAlt} loading="lazy" />
            </div>
          </div>
        ))}
      </section>

      <section className="section animate-on-scroll">
        <SectionTitle
          title="Game Lokal Terpopuler"
          subtitle="Pilihan community dengan rating tertinggi minggu ini."
        />
        {error && <p className="error-text">{error}</p>}
        <div className="game-grid">
          {(topGames.length > 0 ? topGames : fallbackPopular).map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section className="section animate-on-scroll">
        <SectionTitle
          title="Review Terbaru"
          subtitle="Komentar segar dari komunitas gamer lokal."
        />
        {reviewError && <p className="error-text">{reviewError}</p>}
        <div className="review-list">
          {(recentReviews.length > 0 ? recentReviews : latestReviews).map((review) => (
            <div key={review.id} className="review-card card">
              <div>
                <p className="review-card__game">{review.game}</p>
                <p className="review-card__reviewer">oleh {review.reviewer}</p>
              </div>
              <p className="review-card__text">{review.excerpt}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section animate-on-scroll">
        <SectionTitle
          title="Kategori & Genre"
          subtitle="Jelajahi game sesuai minatmu."
        />
        <div className="genre-pills">
          {genres.length === 0 ? (
            <span className="pill">Genre belum tersedia</span>
          ) : (
            genres.map((genre) => (
              <Link key={genre} className="pill" to={`/games?genre=${encodeURIComponent(genre)}`}>
                {genre}
              </Link>
            ))
          )}
        </div>

        <div className="qr-card animate-on-scroll">
          <div>
            <p className="hero__tagline">Mini Games</p>
            <h3>QR Emoji Random</h3>
            <p>Scan dengan ponsel untuk dapat emoji acak. Rate limit: 1 QR / 10 detik.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={handleEmojiQR}
              disabled={qrLoading || cooldown > 0}
            >
              {qrLoading ? 'Mengambil...' : cooldown > 0 ? `Tunggu ${cooldown}s` : 'Generate QR'}
            </button>
          </div>
          <div className="qr-card__image">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR emoji acak" loading="lazy" />
            ) : (
              <div className="qr-placeholder">QR belum tersedia</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


