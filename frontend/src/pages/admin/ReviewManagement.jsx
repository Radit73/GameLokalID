import { useEffect, useState } from 'react';
import SidebarAdmin from '../../components/layout/SidebarAdmin.jsx';
import SectionTitle from '../../components/ui/SectionTitle.jsx';
import { deleteReview, getGames, getReviewsByGame } from '../../api.js';
import { getAuth, getToken } from '../../utils/auth.js';
import { getTheme } from '../../utils/theme.js';

const ReviewManagement = () => {
  const [auth, setAuth] = useState(getAuth());
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => getTheme());

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const games = await getGames(getToken());
      const reviewPromises = games.map(async (game) => {
        const gameReviews = await getReviewsByGame(game.id);
        return gameReviews.map((review) => ({
          ...review,
          game_title: game.title,
        }));
      });
      const nested = await Promise.all(reviewPromises);
      setReviews(nested.flat());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    if (auth?.user?.role === 'ADMIN' || auth?.user?.role === 'SUPER_ADMIN') {
      fetchReviews();
    }
  }, [auth]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Hapus review ini?')) return;
    try {
      await deleteReview(reviewId, getToken());
      fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!auth || (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPER_ADMIN')) {
    return (
      <div className={`admin-layout ${theme === 'light' ? 'theme-light' : ''}`}>
        <SidebarAdmin active="Kelola Review" />
        <main className="admin-content">
          <p className="error-text">Akses ditolak.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={`admin-layout ${theme === 'light' ? 'theme-light' : ''}`}>
      <SidebarAdmin active="Kelola Review" />
      <main className="admin-content">
        <div className="admin-content__header">
          <div>
            <h1>Kelola Review Pemain</h1>
            <p className="muted-text">Pantau konten komunitas dengan cepat.</p>
          </div>
        </div>

        <div className="card">
          <SectionTitle title="Daftar Review" />
          {error && <p className="error-text">{error}</p>}
          {loading ? (
            <p>Sedang memuat review...</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama Game</th>
                    <th>User</th>
                    <th>Rating</th>
                    <th>Potongan Komentar</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const snippet = `${review.comment?.slice(0, 60) || ''}${
                      review.comment && review.comment.length > 60 ? '...' : ''
                    }`;
                    return (
                      <tr key={review.id}>
                        <td>{review.game_title}</td>
                        <td>{review.user_name}</td>
                        <td>{review.rating}</td>
                        <td>{snippet}</td>
                        <td>{new Date(review.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="table-actions">
                          <button
                            type="button"
                            className="btn-danger btn-small"
                            onClick={() => handleDelete(review.id)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReviewManagement;
