import { useEffect, useMemo, useState } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title as ChartTitle,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import SidebarAdmin from '../../components/layout/SidebarAdmin.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import SectionTitle from '../../components/ui/SectionTitle.jsx';
import { getGames } from '../../api.js';
import { getAuth, getToken } from '../../utils/auth.js';
import { getTheme } from '../../utils/theme.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);
ChartJS.defaults.color = '#e5e7eb';
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';

const Dashboard = () => {
  const [auth, setAuth] = useState(getAuth());
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => getTheme());

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
    const body = document.body;
    body.classList.add('theme-page-admin');
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
    return () => {
      body.classList.remove('theme-page-admin');
      body.classList.remove('theme-light');
    };
  }, [theme]);

  useEffect(() => {
    ChartJS.defaults.color = theme === 'light' ? '#111827' : '#e5e7eb';
    ChartJS.defaults.borderColor =
      theme === 'light' ? 'rgba(185, 28, 28, 0.18)' : 'rgba(255, 255, 255, 0.08)';
  }, [theme]);

  useEffect(() => {
    const fetchGames = async () => {
      if (!auth || (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPER_ADMIN')) return;
      try {
        const data = await getGames(getToken());
        setGames(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [auth]);

  if (!auth || (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPER_ADMIN')) {
    return (
      <div className={`admin-layout ${theme === 'light' ? 'theme-light' : ''}`}>
        <SidebarAdmin active="Dashboard" />
        <main className="admin-content">
          <p className="error-text">Akses ditolak. Hanya admin yang dapat melihat halaman ini.</p>
        </main>
      </div>
    );
  }

  const totalReviews = games.reduce((sum, game) => sum + Number(game.review_count || 0), 0);
  const averageRating =
    games.length > 0
      ? (games.reduce((sum, game) => sum + Number(game.avg_rating || 0), 0) / games.length).toFixed(
          1,
        )
      : '0.0';

  const stats = [
    { label: 'Total Game', value: games.length, icon: '🎮' },
    { label: 'Total Review', value: totalReviews, icon: '📝' },
    { label: 'Rata-rata Rating', value: averageRating, icon: '⭐' },
  ];

  const topGames = [...games]
    .sort((a, b) => Number(b.avg_rating) - Number(a.avg_rating))
    .slice(0, 5);

  const recentGames = [...games].slice(0, 5);

  const genreRatings = useMemo(() => {
    const totals = {};

    games.forEach((game) => {
      const genres = (game.genres || '')
        .split(',')
        .map((genre) => genre.trim())
        .filter(Boolean);

      const genresToUse = genres.length > 0 ? genres : ['Tidak ada genre'];
      const ratingCount = Number(game.review_count || 0);

      genresToUse.forEach((genre) => {
        totals[genre] = (totals[genre] || 0) + ratingCount;
      });
    });

    const entries = Object.entries(totals)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    const maxCount = entries.length > 0 ? Math.max(...entries.map((item) => item.count)) : 0;

    return entries.map((item) => ({
      ...item,
      normalized: maxCount > 0 ? (item.count / maxCount) * 10 : 0,
    }));
  }, [games]);

  const genreLineData = {
    labels: genreRatings.map((item) => item.genre),
    datasets: [
      {
        label: 'Total skor rating',
        data: genreRatings.map((item) => item.normalized),
        borderColor: '#e11d48',
        backgroundColor: 'rgba(225, 29, 72, 0.18)',
        pointBackgroundColor: '#f43f5e',
        pointBorderColor: '#0c0d0f',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const genreLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const original = genreRatings[context.dataIndex]?.count ?? 0;
            return `Total rating: ${original} (skala 0-10: ${context.parsed.y.toFixed(1)})`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: theme === 'light' ? 'rgba(185, 28, 28, 0.12)' : 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          maxRotation: 0,
          color: theme === 'light' ? '#111827' : '#e5e7eb',
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 10,
        grid: {
          color: theme === 'light' ? 'rgba(185, 28, 28, 0.12)' : 'rgba(255, 255, 255, 0.08)',
        },
        ticks: {
          precision: 0,
          stepSize: 1,
          color: theme === 'light' ? '#111827' : '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className={`admin-layout ${theme === 'light' ? 'theme-light' : ''}`}>
      <SidebarAdmin active="Dashboard" />
      <main className="admin-content">
        <h1>Dashboard Admin</h1>
        <p className="muted-text">Pantau statistik portal review secara real-time.</p>

        {error && <p className="error-text">{error}</p>}

        <div className="stat-grid">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <SectionTitle
            title="Sebaran Rating per Genre"
            subtitle="Diurutkan dari jumlah skor rating terbanyak hingga paling sedikit."
          />
          {loading ? (
            <p>Sedang memuat grafik rating per genre...</p>
          ) : genreRatings.length === 0 ? (
            <p>Belum ada data genre untuk ditampilkan.</p>
          ) : (
            <div className="chart-container">
              <Line data={genreLineData} options={genreLineOptions} />
            </div>
          )}
        </div>

        {loading ? (
          <p>Sedang memuat data dashboard...</p>
        ) : (
          <div className="admin-panels">
            <div className="card">
              <SectionTitle title="Game dengan Rating Tertinggi" />
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>Developer</th>
                    <th>Rating</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {topGames.map((game) => (
                    <tr key={game.id}>
                      <td>{game.title}</td>
                      <td>{game.developer}</td>
                      <td>{Number(game.avg_rating || 0).toFixed(1)}</td>
                      <td>{game.review_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <SectionTitle title="Game Terbaru" />
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>Platform</th>
                    <th>Dirilis</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGames.map((game) => (
                    <tr key={game.id}>
                      <td>{game.title}</td>
                      <td>{game.platform}</td>
                      <td>{game.release_date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
