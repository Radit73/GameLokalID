import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title as ChartTitle,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import GameCard from '../components/ui/GameCard.jsx';
import { getGames } from '../api.js';
import { getTheme } from '../utils/theme.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);
ChartJS.defaults.color = '#e5e7eb';
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [genres, setGenres] = useState(['ALL']);
  const [platforms, setPlatforms] = useState(['ALL']);
  const [searchParams, setSearchParams] = useSearchParams();
  const [theme, setTheme] = useState(() => getTheme());

  useEffect(() => {
    const handleThemeChange = () => setTheme(getTheme());
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    ChartJS.defaults.color = theme === 'light' ? '#111827' : '#e5e7eb';
    ChartJS.defaults.borderColor =
      theme === 'light' ? 'rgba(185, 28, 28, 0.18)' : 'rgba(255, 255, 255, 0.08)';
  }, [theme]);

  useEffect(() => {
    const body = document.body;
    body.classList.add('theme-page-games');
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
    return () => {
      body.classList.remove('theme-page-games');
      body.classList.remove('theme-light');
    };
  }, [theme]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await getGames();
        setGames(data);
        const genreSet = new Set();
        const platformSet = new Set();
        data.forEach((game) => {
          const splits = game.genres
            ? game.genres.split(',').map((genre) => genre.trim()).filter(Boolean)
            : [];
          splits.forEach((genre) => genreSet.add(genre));
          const platformSplits = game.platform
            ? game.platform.split(',').map((platform) => platform.trim()).filter(Boolean)
            : [];
          platformSplits.forEach((platform) => platformSet.add(platform));
        });
        setGenres(['ALL', ...Array.from(genreSet)]);
        setPlatforms(['ALL', ...Array.from(platformSet)]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    const param = searchParams.get('genre');
    if (param && genres.includes(param)) {
      setSelectedGenre(param);
    } else if (param && !genres.includes(param)) {
      setSelectedGenre('ALL');
    }
  }, [searchParams, genres]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const searchValue = search.trim().toLowerCase();
      const matchesSearch =
        searchValue.length === 0 ||
        game.title.toLowerCase().includes(searchValue) ||
        (game.developer || '').toLowerCase().includes(searchValue);

      const gameGenres = game.genres
        ? game.genres.split(',').map((genre) => genre.trim().toLowerCase())
        : [];
      const matchesGenre =
        selectedGenre === 'ALL' ||
        gameGenres.includes(selectedGenre.toLowerCase());

      const gamePlatforms = game.platform
        ? game.platform.split(',').map((platform) => platform.trim().toLowerCase())
        : [];
      const matchesPlatform =
        selectedPlatform === 'ALL' ||
        gamePlatforms.includes(selectedPlatform.toLowerCase());

      return matchesSearch && matchesGenre && matchesPlatform;
    });
  }, [games, search, selectedGenre, selectedPlatform]);

  const platformCounts = useMemo(() => {
    const totals = {};

    games.forEach((game) => {
      const platforms = (game.platform || '')
        .split(',')
        .map((platform) => platform.trim())
        .filter(Boolean);

      const platformsToUse = platforms.length > 0 ? platforms : ['Tidak ada platform'];

      platformsToUse.forEach((platform) => {
        totals[platform] = (totals[platform] || 0) + 1;
      });
    });

    return Object.entries(totals)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);
  }, [games]);

  const platformBarData = {
    labels: platformCounts.map((item) => item.platform),
    datasets: [
      {
        label: 'Jumlah Game',
        data: platformCounts.map((item) => item.count),
        backgroundColor: 'rgba(99, 102, 241, 0.55)',
        borderColor: '#6366f1',
        borderWidth: 1.5,
        borderRadius: 10,
        maxBarThickness: 38,
      },
    ],
  };

  const platformBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Jumlah game: ${context.parsed.x}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: theme === 'light' ? 'rgba(185, 28, 28, 0.12)' : 'rgba(255, 255, 255, 0.08)',
        },
        ticks: {
          precision: 0,
          stepSize: 1,
          color: theme === 'light' ? '#111827' : '#e5e7eb',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme === 'light' ? '#111827' : '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className={`page game-list-page section ${theme === 'light' ? 'theme-light' : ''}`}>
      <div className="page-header">
        <h2>Semua Game Lokal Indonesia</h2>
        <p>Filter berdasarkan genre favoritmu atau cari judul yang kamu inginkan.</p>
      </div>

      <div className="game-list__filters card">
        <input
          type="text"
          placeholder="Cari judul atau developer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={selectedGenre}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedGenre(value);
            if (value && value !== 'ALL') {
              setSearchParams({ genre: value });
            } else {
              setSearchParams({});
            }
          }}
        >
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre === 'ALL' ? 'Semua Genre' : genre}
            </option>
          ))}
        </select>
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
        >
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform === 'ALL' ? 'Semua Platform' : platform}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Sedang memuat daftar game...</p>
      ) : (
        <>
          <div className="game-grid game-grid--enhanced">
            {filteredGames.length === 0 && (
              <p className="muted-text">Tidak ada game yang cocok dengan filter.</p>
            )}
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          <div className="card chart-card chart-card--below-grid">
            <div className="chart-card__header">
              <h3>Distribusi Game per Platform</h3>
              <p className="muted-text">Data akan menyesuaikan otomatis saat platform baru ditambahkan.</p>
            </div>
            {platformCounts.length === 0 ? (
              <p>Belum ada data platform untuk ditampilkan.</p>
            ) : (
              <div className="chart-container">
                <Bar data={platformBarData} options={platformBarOptions} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GameList;
