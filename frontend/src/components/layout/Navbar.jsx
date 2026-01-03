import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getAuth } from '../../utils/auth.js';

const navbarLinks = [
  { id: 'home', label: 'Beranda', path: '/Home' },
  { id: 'games', label: 'Game', path: '/games' },
];

const drawerBaseLinks = [{ id: 'settings', label: 'Pengaturan', path: '/settings' }];

const Navbar = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(getAuth());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 900 : false,
  );

  useEffect(() => {
    const handleChange = () => setAuth(getAuth());
    window.addEventListener('auth-changed', handleChange);
    return () => window.removeEventListener('auth-changed', handleChange);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    setDrawerOpen(false);
    navigate('/Home', { replace: true });
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const profilePhoto = auth?.user?.profilePhoto;
  const drawerLinks = useMemo(
    () => (isMobile ? [...navbarLinks, ...drawerBaseLinks] : drawerBaseLinks),
    [isMobile],
  );
  const profileInitials = useMemo(() => {
    if (!auth?.user?.name) return 'GL';
    return auth.user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [auth]);

  return (
    <>
      <header className="navbar">
        <div className={drawerOpen ? 'navbar__logo navbar__logo--active' : 'navbar__logo'}>
          GameLokalID
        </div>
        <div className="navbar__controls">
          <nav className="navbar__menu">
            {navbarLinks.map((item) => (
              <Link key={item.id} to={item.path} onClick={closeDrawer}>
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className={`navbar__drawer-toggle ${drawerOpen ? 'is-open' : ''}`}
            onClick={toggleDrawer}
            aria-label="Buka menu navigasi"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`navbar-drawer__overlay ${drawerOpen ? 'is-open' : ''}`}
        onClick={closeDrawer}
      />
      <aside className={`navbar-drawer ${drawerOpen ? 'is-open' : ''}`}>
        <div className="navbar-drawer__header">
          <div>
            <p className="navbar-drawer__title">
              {auth ? `Hi, ${auth.user.name}` : 'Selamat datang di GameLokalID'}
            </p>
            <p className="navbar-drawer__subtitle">
              {auth
                ? 'Kelola profil dan aktivitasmu di sini.'
                : 'Gabung untuk memberi penilaian.'}
            </p>
          </div>
          <button
            type="button"
            className="navbar-drawer__close"
            onClick={closeDrawer}
            aria-label="Tutup menu"
          >
            X
          </button>
        </div>
        <div className="navbar-drawer__body">
          <div className="navbar-drawer__nav">
            {drawerLinks.map((item) => (
              <Link key={item.id} to={item.path} onClick={closeDrawer}>
                {item.label}
              </Link>
            ))}
          </div>
          {auth ? (
            <>
              <div className="navbar-drawer__user-card">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={`Foto profil ${auth.user.name}`}
                    className="navbar__profile-photo navbar__profile-photo--card"
                    loading="lazy"
                  />
                ) : (
                  <span className="navbar__profile-initials navbar__profile-initials--card">
                    {profileInitials}
                  </span>
                )}
                <div>
                  <p className="navbar-drawer__user-name">{auth.user.name}</p>
                  <p className="navbar-drawer__user-role">{auth.user.role}</p>
                </div>
              </div>
              {(auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN') && (
                <Link to="/admin" className="btn-outline" onClick={closeDrawer}>
                  Buka Dashboard Admin
                </Link>
              )}
              <button type="button" className="btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <p>
                Masuk untuk melihat penilaian game lokal, membuat review, dan menyimpan daftar
                favoritmu.
              </p>
              <div className="navbar-drawer__cta">
                <Link to="/login" className="btn-primary" onClick={closeDrawer}>
                  Masuk
                </Link>
                <Link to="/register" className="btn-outline" onClick={closeDrawer}>
                  Daftar Gratis
                </Link>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
