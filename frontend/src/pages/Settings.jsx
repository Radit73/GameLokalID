import { useEffect, useState } from 'react';
import { getTheme, setTheme } from '../utils/theme.js';

const Settings = () => {
  const [theme, setThemeState] = useState(() => getTheme());

  useEffect(() => {
    const handleThemeChange = () => setThemeState(getTheme());
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  const isLight = theme === 'light';

  useEffect(() => {
    const body = document.body;
    body.classList.add('theme-page-settings');
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
    return () => {
      body.classList.remove('theme-page-settings');
      body.classList.remove('theme-light');
    };
  }, [theme]);

  return (
    <div className={`page section settings-page ${isLight ? 'theme-light' : ''}`}>
      <div className="settings-header">
        <div>
          <p className="settings-kicker">Pengaturan</p>
          <h2>Tata Pengalamanmu</h2>
          <p className="settings-subtitle">
            Sesuaikan tema, foto profil, dan bahasa favoritmu. Semua perubahan ini belum aktif, tapi
            desainnya sudah siap.
          </p>
        </div>
      </div>
      <div className="settings-stack">
        <section className="settings-card settings-card--accent">
          <header>
            <div>
              <h3>Tema & Tampilan</h3>
              <p>Ganti tampilan ke tema putih-merah yang lebih terang.</p>
            </div>
          </header>
          <div className="setting-item">
            <div>
              <p>Tema Putih & Merah</p>
              <span className="setting-desc">Aktif sekarang untuk halaman Home.</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={isLight}
                onChange={(event) => setTheme(event.target.checked ? 'light' : 'dark')}
              />
              <span className="slider" />
            </label>
          </div>
          <p className="settings-note">
            Tema ini masih diterapkan bertahap. Saat ini hanya memengaruhi halaman Home.
          </p>
        </section>

        <section className="settings-card settings-card--surface">
          <header>
            <div>
              <h3>Foto Profil</h3>
              <p>Ganti tampilan avatar agar sesuai gaya kamu.</p>
            </div>
          </header>
          <div className="avatar-preview">
            <img
              src="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Round&hairColor=Black&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Smile&skinColor=Brown"
              alt="Avatar saat ini"
            />
            <div>
              <p>Avatar Sekarang</p>
              <span className="setting-desc">Klik salah satu pilihan di bawah ini.</span>
            </div>
          </div>
          <div className="avatar-options">
            {['Curly', 'Hijab', 'Shades', 'Casual', 'Sport'].map((label, index) => (
              <button key={label} type="button" className="avatar-option" disabled>
                <img
                  src={`https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&hairColor=BrownDark&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Blue0${index +
                    1}&graphicType=Resist&eyeType=Default`}
                  alt={`Avatar ${label}`}
                />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="settings-actions">
            <button type="button" className="btn-outline" disabled>
              Unggah Nanti
            </button>
            <button type="button" className="btn-primary" disabled>
              Simpan Avatar
            </button>
          </div>
        </section>

        <section className="settings-card settings-card--surface">
          <header>
            <div>
              <h3>Bahasa</h3>
              <p>Pilih bahasa preferensi untuk konten & antarmuka.</p>
            </div>
            <span className="badge badge-beta">Preview</span>
          </header>
          <div className="setting-item setting-select">
            <label htmlFor="language-select">Bahasa Default</label>
            <select id="language-select" disabled>
              <option>Bahasa Indonesia (ID)</option>
              <option>English (US)</option>
              <option>Bahasa Jawa</option>
              <option>Bahasa Sunda</option>
            </select>
          </div>
          <p className="setting-desc">
            Penyesuaian bahasa belum aktif, tetapi akan segera tersedia.
          </p>
          <div className="settings-note">
            <p>Tips</p>
            <span>Bahasa yang kamu pilih akan sinkron ke aplikasi mobile GameLokalID.</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
