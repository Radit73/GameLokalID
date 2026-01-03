import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GameCard from '../components/ui/GameCard.jsx';
import RatingBadge from '../components/ui/RatingBadge.jsx';
import SectionTitle from '../components/ui/SectionTitle.jsx';
import { createReview, getGameById, getGames, getReviewsByGame } from '../api.js';
import { getAuth, getToken } from '../utils/auth.js';
import { getTheme } from '../utils/theme.js';

const buildEditorialScores = (baseRating) => {
  const score = Number(baseRating) || 0;
  return [
    { aspect: 'Gameplay', score: `${Math.min(10, score + 1).toFixed(1)} / 10` },
    { aspect: 'Story', score: `${Math.max(6, score - 0.3).toFixed(1)} / 10` },
    { aspect: 'Visual', score: `${Math.min(10, score + 1.3).toFixed(1)} / 10` },
    { aspect: 'Audio', score: `${Math.min(10, score + 0.8).toFixed(1)} / 10` },
    { aspect: 'Performansi', score: `${Math.min(10, score + 0.5).toFixed(1)} / 10` },
  ];
};

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedGames, setRelatedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ rating: '10', comment: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [auth, setAuth] = useState(getAuth());
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
    body.classList.add('theme-page-game-detail');
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
    return () => {
      body.classList.remove('theme-page-game-detail');
      body.classList.remove('theme-light');
    };
  }, [theme]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        const [gameData, reviewData] = await Promise.all([
          getGameById(id),
          getReviewsByGame(id),
        ]);
        setGame(gameData);
        setReviews(reviewData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const games = await getGames();
        const filtered = games.filter((item) => String(item.id) !== String(id));
        setRelatedGames(filtered.slice(0, 4));
      } catch {
        setRelatedGames([]);
      }
    };
    fetchRelated();
  }, [id]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const refreshReviews = async () => {
    const latest = await getReviewsByGame(id);
    setReviews(latest);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!auth) {
      setFormError('Harus login untuk menulis review.');
      return;
    }
    if (!form.comment.trim()) {
      setFormError('Komentar tidak boleh kosong.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError('');
      await createReview(
        id,
        {
          rating: Number(form.rating),
          comment: form.comment.trim(),
        },
        getToken(),
      );
      setForm({ rating: '10', comment: '' });
      await refreshReviews();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`page game-detail-page section ${theme === 'light' ? 'theme-light' : ''}`}>
        <p>Sedang memuat detail game...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className={`page game-detail-page section ${theme === 'light' ? 'theme-light' : ''}`}>
        <p className="error-text">{error || 'Game tidak ditemukan.'}</p>
      </div>
    );
  }

  const platforms = game.platform ? game.platform.split(',').map((p) => p.trim()) : [];
  const genres = game.genres ? game.genres.split(',').map((g) => g.trim()) : [];
  const summaryParagraphs = game.description
    ? game.description.split('\n').filter((text) => text.trim().length > 0)
    : ['Belum ada deskripsi lengkap untuk game ini.'];
  const avgRating = Number(game.avg_rating || 0).toFixed(1);
  const reviewCount = Number(game.review_count || 0);
  const editorialScores = buildEditorialScores(game.avg_rating);

  return (
    <div className={`page game-detail-page ${theme === 'light' ? 'theme-light' : ''}`}>
      <section className="section detail-hero">
        <p className="detail-hero__breadcrumb">Game #{id} • Eksklusif Portal Review Lokal</p>
        <div className="game-detail__header card">
          <div className="game-detail__cover">
            <img
              src={
                game.cover_image ||
                'https://images.unsplash.com/photo-1472457974886-0ebcd59440cc?auto=format&fit=crop&w=900&q=80'
              }
              alt={game.title}
            />
          </div>
          <div className="game-detail__info">
            <p className="game-detail__tag">{game.title}</p>
            <h1>{game.title}</h1>
            <p className="detail-subtitle">
              oleh <strong>{game.developer || '-'}</strong> • dipublikasikan{' '}
              <strong>{game.publisher || '-'}</strong>
            </p>

            <div className="detail-badges">
              {platforms.map((platform) => (
                <span key={platform} className="badge badge--solid">
                  {platform}
                </span>
              ))}
              {genres.map((genre) => (
                <span key={genre} className="badge badge--outline">
                  {genre}
                </span>
              ))}
            </div>

            <div className="game-detail__rating">
              <div>
                <span className="game-detail__rating-number">{avgRating}</span>
                <p className="rating-caption">Rata-rata {reviewCount} review komunitas</p>
              </div>
              <RatingBadge rating={avgRating >= 8 ? 'Hot Pick' : 'Community Choice'} />
            </div>

            <div className="detail-meta">
              <div className="detail-meta__item">
                <span>Rilis</span>
                <strong>{game.release_date || '-'}</strong>
              </div>
              <div className="detail-meta__item">
                <span>Platform</span>
                <strong>{game.platform || '-'}</strong>
              </div>
              <div className="detail-meta__item">
                <span>Mode</span>
                <strong>{game.mode || 'Single / Co-op'}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card detail-summary">
          <SectionTitle title="Ringkasan" />
          {summaryParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="card game-detail__players">
          <SectionTitle title="Review Pemain" subtitle="Langsung dari komunitas gamer lokal." />

          <div className="player-rating">
            <p>Skor Pemain</p>
            <h3>
              {avgRating} / 10 <span>• {reviewCount} review</span>
            </h3>
          </div>

          {auth && (
            <form className="user-review-form" onSubmit={handleReviewSubmit}>
              {formError && <p className="error-text">{formError}</p>}
              <label>
                Pilih Rating
                <select name="rating" value={form.rating} onChange={handleFormChange}>
                  {[...Array(10)].map((_, idx) => {
                    const value = 10 - idx;
                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>
                Komentar Kamu
                <textarea
                  name="comment"
                  rows={4}
                  placeholder="Bagikan pengalaman bermainmu di sini..."
                  value={form.comment}
                  onChange={handleFormChange}
                />
              </label>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Mengirim...' : 'Kirim Review'}
              </button>
            </form>
          )}

          {!auth && <p className="muted-text">Masuk untuk menulis review versimu.</p>}

          <div className="player-review-list">
            {reviews.length === 0 && (
              <p className="muted-text">Belum ada review pemain untuk game ini.</p>
            )}
            {reviews.map((review) => (
              <div key={review.id} className="player-review">
                <div className="player-review__header">
                  <div>
                    <p className="player-review__name">{review.user_name}</p>
                    <span className="player-review__date">
                      {new Date(review.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <RatingBadge rating={`${review.rating} / 10`} />
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section detail-related">
        <SectionTitle title="Game Terkait" subtitle="Rekomendasi lain dari komunitas." />
        <div className="game-grid">
          {relatedGames.length === 0 && <p className="muted-text">Belum ada rekomendasi.</p>}
          {relatedGames.map((item) => (
            <GameCard key={item.id} game={item} compact />
          ))}
        </div>
      </section>
    </div>
  );
};

export default GameDetail;
