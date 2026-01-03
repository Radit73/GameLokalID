import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAdmin as registerAdminApi } from '../api.js';
import { useToast } from '../components/ui/ToastProvider.jsx';

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    passcode: '',
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.passcode) {
      addToast('Semua field wajib diisi.', 'error');
      return;
    }
    if (form.password !== form.confirmPassword) {
      addToast('Konfirmasi password tidak cocok.', 'error');
      return;
    }
    try {
      setLoading(true);
      await registerAdminApi(form.name, form.email, form.password, form.passcode);
      addToast('Registrasi admin berhasil. Silakan login.', 'success');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      addToast(err.message || 'Gagal registrasi admin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page section">
      <div className="auth-card card">
        <h2>Daftar Admin</h2>
        <p>Masukkan kode akses admin resmi yang diberikan tim GameLokalID.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nama Lengkap
            <input
              type="text"
              name="name"
              placeholder="Nama developer"
              value={form.name}
              onChange={handleChange}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="email@studio.com"
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
          <label>
            Konfirmasi Password
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </label>
          <label>
            Kode Akses Admin
            <input
              type="password"
              name="passcode"
              placeholder="Masukkan kode rahasia"
              value={form.passcode}
              onChange={handleChange}
            />
          </label>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar Admin'}
          </button>
        </form>
        <p className="auth-switch">
          Bukan developer? <a href="/register">Daftar sebagai user biasa</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterAdmin;
