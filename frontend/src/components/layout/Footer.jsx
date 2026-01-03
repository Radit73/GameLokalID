import { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeNewsletter } from '../../api.js';
import { useToast } from '../ui/ToastProvider.jsx';

const linkGroups = [
  {
    id: 'platform',
    title: 'Platform',
    links: [
      { label: 'Beranda', to: '/' },
      { label: 'Daftar Game', to: '/games' },
      { label: 'Tentang Kami', to: '/about' },
    ],
  },
  {
    id: 'community',
    title: 'Komunitas',
    links: [
      { label: 'Gabung Reviewer', to: '/register' },
      { label: 'Masuk', to: '/login' },
      { label: 'Forum Discord', url: '#' },
    ],
  },
  {
    id: 'resources',
    title: 'Resource',
    links: [
      { label: 'Kebijakan Privasi', to: '/policy' },
      { label: 'Syarat & Ketentuan', to: '/terms' },
      { label: 'Bantuan', to: '/help' },
    ],
  },
];

const socialLinks = [
  { id: 'yt', label: 'YT', url: '#' },
  { id: 'ig', label: 'IG', url: '#' },
  { id: 'dc', label: 'DC', url: '#' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const year = new Date().getFullYear();

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      addToast('Email wajib diisi.', 'error');
      return;
    }
    try {
      setLoading(true);
      await subscribeNewsletter(email.trim());
      addToast('Berhasil berlangganan. Cek inbox kamu.', 'success');
      setEmail('');
    } catch (err) {
      addToast(err.message || 'Gagal berlangganan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer footer--modern">
      <div className="footer__inner">
        <div className="footer__brand">
          <p className="footer__logo">GameLokalID</p>
          <p className="footer__tagline">
            Platform rating dan kurasi game karya anak bangsa. Bantu developer lokal bersinar lewat
            review autentik dan komunitas positif.
          </p>
          <div className="footer__socials">
            {socialLinks.map((social) => (
              <a key={social.id} href={social.url} aria-label={social.label}>
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__links-grid">
          {linkGroups.map((group) => (
            <div key={group.id}>
              <p className="footer__links-title">{group.title}</p>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to}>{link.label}</Link>
                    ) : (
                      <a href={link.url}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__cta">
          <p className="footer__cta-title">Update rating mingguan</p>
          <p>Dapatkan sorotan game dan event komunitas langsung di inbox kamu.</p>
          <form className="footer__form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="email@contoh.com"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Langganan'}
            </button>
          </form>
        </div>
      </div>
      <div className="footer__bottom">
        <small>&copy; {year} GameLokalID. Seluruh hak cipta dilindungi.</small>
        <span>Made with semangat komunitas.</span>
      </div>
    </footer>
  );
};

export default Footer;
