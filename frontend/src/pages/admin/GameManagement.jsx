import { useEffect, useState } from 'react';
import SidebarAdmin from '../../components/layout/SidebarAdmin.jsx';
import SectionTitle from '../../components/ui/SectionTitle.jsx';
import { createGame, deleteGame, getGames, updateGame } from '../../api.js';
import { getAuth, getToken } from '../../utils/auth.js';
import { useToast } from '../../components/ui/ToastProvider.jsx';
import { getTheme } from '../../utils/theme.js';

const initialForm = {
  title: '',
  developer: '',
  publisher: '',
  platform: '',
  mode: '',
  genres: '',
  release_date: '',
  description: '',
  cover_image: '',
};

const GameManagement = () => {
  const [auth, setAuth] = useState(getAuth());
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const { addToast } = useToast();
  const [theme, setTheme] = useState(() => getTheme());

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await getGames(getToken());
      setGames(data);
    } catch (err) {
      addToast(err.message || 'Gagal memuat daftar game.', 'error');
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
      fetchGames();
    }
  }, [auth]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.cover_image) {
      addToast('Minimal judul, deskripsi, dan cover wajib diisi.', 'error');
      return;
    }
    try {
      if (editingId) {
        await updateGame(editingId, form, getToken());
        addToast('Game berhasil diperbarui.', 'success');
      } else {
        await createGame(form, getToken());
        addToast('Game baru berhasil ditambahkan.', 'success');
      }
      setForm(initialForm);
      setEditingId(null);
      fetchGames();
    } catch (err) {
      addToast(err.message || 'Operasi gagal. Coba lagi.', 'error');
    }
  };

  const handleEdit = (game) => {
    setEditingId(game.id);
    setForm({
      title: game.title || '',
      developer: game.developer || '',
      publisher: game.publisher || '',
      platform: game.platform || '',
      mode: game.mode || '',
      genres: game.genres || '',
      release_date: game.release_date || '',
      description: game.description || '',
      cover_image: game.cover_image || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleDelete = async (gameId) => {
    if (!window.confirm('Hapus game ini?')) return;
    try {
      await deleteGame(gameId, getToken());
      fetchGames();
    } catch (err) {
      addToast(err.message || 'Gagal menghapus game.', 'error');
      return;
    }
    addToast('Game berhasil dihapus.', 'success');
  };

  if (!auth || (auth.user.role !== 'ADMIN' && auth.user.role !== 'SUPER_ADMIN')) {
    return (
      <div className={`admin-layout ${theme === 'light' ? 'theme-light' : ''}`}>
        <SidebarAdmin active="Kelola Game" />
        <main className="admin-content">
          <p className="error-text">Akses ditolak.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={`admin-layout ${theme === 'light' ? 'theme-light' : ''}`}>
      <SidebarAdmin active="Kelola Game" />
      <main className="admin-content">
        <div className="admin-content__header">
          <div>
            <h1>Kelola Game</h1>
            <p className="muted-text">Tambah, edit, atau hapus entri game lokal.</p>
          </div>
        </div>

        <div className="card">
          <SectionTitle
            title={editingId ? 'Perbarui Game' : 'Tambah Game'}
            subtitle={editingId ? 'Sedang mengedit data game yang dipilih.' : undefined}
          />
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__grid">
              <label>
                Judul
                <input name="title" value={form.title} onChange={handleChange} />
              </label>
              <label>
                Developer
                <input name="developer" value={form.developer} onChange={handleChange} />
              </label>
              <label>
                Publisher
                <input name="publisher" value={form.publisher} onChange={handleChange} />
              </label>
              <label>
                Platform
                <input
                  name="platform"
                  placeholder="PC, Mobile"
                  value={form.platform}
                  onChange={handleChange}
                />
              </label>
              <label>
                Mode
                <select name="mode" value={form.mode} onChange={handleChange}>
                  <option value="">Pilih Mode</option>
                  <option value="Singleplayer">Singleplayer</option>
                  <option value="Co-op">Co-op</option>
                  <option value="Single & Co-op">Single & Co-op</option>
                  <option value="Multiplayer">Multiplayer</option>
                </select>
              </label>
              <label>
                Genre
                <input
                  name="genres"
                  placeholder="Aksi, RPG"
                  value={form.genres}
                  onChange={handleChange}
                />
              </label>
              <label>
                Tanggal Rilis
                <input
                  name="release_date"
                  placeholder="2024-10-10"
                  value={form.release_date}
                  onChange={handleChange}
                />
              </label>
              <label>
                Cover Image URL
                <input
                  name="cover_image"
                  placeholder="https://..."
                  value={form.cover_image}
                  onChange={handleChange}
                />
              </label>
            </div>
            <label>
              Deskripsi
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </label>
            <div className="admin-form__actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Game' : 'Simpan Game'}
              </button>
              {editingId && (
                <button type="button" className="btn-outline" onClick={handleCancelEdit}>
                  Batalkan Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <SectionTitle title="Daftar Game" />
          {loading ? (
            <p>Sedang memuat daftar game...</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Judul</th>
                    <th>Developer</th>
                    <th>Platform</th>
                    <th>Mode</th>
                    <th>Genre</th>
                    <th>Rating</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id}>
                      <td>
                        <img
                          src={game.cover_image}
                          alt={game.title}
                          className="table-cover"
                        />
                      </td>
                      <td>{game.title}</td>
                      <td>{game.developer}</td>
                      <td>{game.platform}</td>
                      <td>{game.mode || '-'}</td>
                      <td>{game.genres}</td>
                      <td>{Number(game.avg_rating || 0).toFixed(1)}</td>
                      <td className="table-actions">
                        <button
                          type="button"
                          className="btn-outline btn-small"
                          onClick={() => handleEdit(game)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger btn-small"
                          onClick={() => handleDelete(game.id)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GameManagement;
