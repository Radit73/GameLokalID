import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api.js';
import { useToast } from '../components/ui/ToastProvider.jsx';
import { getTheme } from '../utils/theme.js';

const avatarOptions = [
  {
    id: 'avatar-alya',
    label: 'Alya',
    url: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight2&accessoriesType=Round&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light',
  },
  {
    id: 'avatar-sena',
    label: 'Sena',
    url: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortWaved&accessoriesType=Wayfarers&hairColor=Black&facialHairType=Blank&clotheType=Overall&clotheColor=Blue03&eyeType=Default&eyebrowType=UpDown&mouthType=Smile&skinColor=Brown',
  },
  {
    id: 'avatar-daru',
    label: 'Daru',
    url: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairDreads01&accessoriesType=Blank&hairColor=Black&facialHairType=BeardMedium&facialHairColor=Black&clotheType=Hoodie&clotheColor=PastelBlue&eyeType=Happy&eyebrowType=RaisedExcited&mouthType=Smile&skinColor=DarkBrown',
  },
  {
    id: 'avatar-lila',
    label: 'Lila',
    url: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Blank&hairColor=Brown&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Pink&eyeType=Wink&eyebrowType=DefaultNatural&mouthType=Twinkle&skinColor=Light',
  },
  {
    id: 'avatar-bima',
    label: 'Bima',
    url: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairTheCaesar&accessoriesType=Sunglasses&hairColor=BrownDark&facialHairType=Blank&clotheType=GraphicShirt&clotheColor=Heather&graphicType=Skull&eyeType=Squint&eyebrowType=AngryNatural&mouthType=Serious&skinColor=Yellow',
  },
];

const Register = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => getTheme());
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: avatarOptions[0].url,
  });
  const [step, setStep] = useState(1);
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

  const handleProfileSelect = (value) => {
    setForm((prev) => ({ ...prev, profilePhoto: value }));
  };

  const validateAccountData = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      addToast('Semua field wajib diisi.', 'error');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      addToast('Konfirmasi password tidak cocok.', 'error');
      return false;
    }
    return true;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateAccountData()) {
      setStep(2);
    }
  };

  const handleBackToAccount = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAccountData()) {
      setStep(1);
      return;
    }
    if (!form.profilePhoto) {
      addToast('Silakan pilih foto profil.', 'error');
      return;
    }
    try {
      setLoading(true);
      await registerApi({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'USER',
        profilePhoto: form.profilePhoto,
      });
      addToast('Registrasi berhasil, silakan login.', 'success');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      addToast(err.message || 'Gagal melakukan registrasi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`page auth-page section ${theme === 'light' ? 'theme-light' : ''}`}>
      <div className="auth-card card">
        <h2>Daftar</h2>
        <p>Bergabung dengan komunitas reviewer game lokal.</p>
        <div className="auth-stepper">
          <div
            className={`auth-stepper__item ${step >= 1 ? 'is-active' : ''} ${
              step > 1 ? 'is-complete' : ''
            }`}
          >
            <span>1</span>
            <p>Data Akun</p>
          </div>
          <div className={`auth-stepper__divider ${step > 1 ? 'is-complete' : ''}`} />
          <div className={`auth-stepper__item ${step === 2 ? 'is-active' : ''}`}>
            <span>2</span>
            <p>Foto Profil</p>
          </div>
        </div>

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleNextStep}>
            <label>
              Nama Lengkap
              <input
                type="text"
                name="name"
                placeholder="Nama kamu"
                value={form.name}
                onChange={handleChange}
              />
            </label>
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
                placeholder="********"
                value={form.password}
                onChange={handleChange}
              />
            </label>
            <label>
              Konfirmasi Password
              <input
                type="password"
                name="confirmPassword"
                placeholder="********"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </label>
            <button type="submit" className="btn-primary auth-btn">
              Lanjut Pilih Avatar
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <p className="avatar-picker__label">
              Pilih gaya avatar animasi yang paling menggambarkan kamu.
            </p>
            <div className="avatar-picker">
              <div className="avatar-picker__grid">
                {avatarOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`avatar-option ${
                      form.profilePhoto === option.url ? 'avatar-option--selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="profilePhoto"
                      value={option.url}
                      checked={form.profilePhoto === option.url}
                      onChange={() => handleProfileSelect(option.url)}
                    />
                    <img src={option.url} alt={`Avatar ${option.label}`} loading="lazy" />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="auth-form__actions">
              <button type="button" className="btn-outline" onClick={handleBackToAccount}>
                Kembali
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Memproses...' : 'Selesai Daftar'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-switch">
          Sudah punya akun? <a href="/login">Masuk</a>
        </p>
        <p className="auth-switch small">
          Developer ingin akses admin? <a href="/register/admin">Gunakan halaman khusus admin</a>.
        </p>
      </div>
    </div>
  );
};

export default Register;
