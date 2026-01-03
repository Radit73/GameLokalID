import { useState } from 'react';

const StickyAdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="sticky-ad">
      <div className="sticky-ad__content">
        <div>
          <p className="sticky-ad__title">Slot iklan masih tersedia</p>
          <p className="sticky-ad__text">
            Promosikan produk kamu di GameLokalID. Hubungi kami di{' '}
            <a href="mailto:support@gamelokal.id">support@gamelokal.id</a>.
          </p>
        </div>
        <div className="sticky-ad__actions">
          <a className="btn-outline sticky-ad__cta" href="mailto:support@gamelokal.id">
            Hubungi
          </a>
          <button
            type="button"
            className="sticky-ad__close"
            onClick={() => setIsVisible(false)}
            aria-label="Tutup banner iklan"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyAdBanner;
