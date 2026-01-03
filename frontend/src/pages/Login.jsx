import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api.js';
import { setAuth } from '../utils/auth.js';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { getTheme } from '../utils/theme.js';

const Login = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => getTheme());
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const handleThemeChange = () => setTheme(getTheme());
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.add('theme-page-auth');
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
    return () => {
      body.classList.remove('theme-page-auth');
      body.classList.remove('theme-light');
    };
  }, [theme]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      addToast('Email dan password wajib diisi.', 'error');
      return;
    }
    try {
      setLoading(true);
      const data = await loginApi(form.email, form.password);
      setAuth(data);
      addToast('Berhasil masuk. Selamat datang kembali!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Gagal masuk. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`page auth-page section ${theme === 'light' ? 'theme-light' : ''}`}>
      <div className="auth-card card">
        <h2>Masuk</h2>
        <p>Portal review game lokal terbaik ada di sini.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="email@contoh.com"
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </label>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="auth-switch">
          Belum punya akun? <a href="/register">Daftar</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
