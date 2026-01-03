import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendChatMessage } from '../api.js';
import { getTheme } from '../utils/theme.js';

const templateQuestions = [
  {
    id: 'dev-register',
    label: 'Bagaimana cara daftar sebagai developer (admin biasa)?',
  },
  {
    id: 'review-game',
    label: 'Komentar ke daftar game',
  },
  {
    id: 'submit-game',
    label: 'Cara menambahkan game baru',
  },
  {
    id: 'event-info',
    label: 'Info event komunitas',
  },
  {
    id: 'account-issue',
    label: 'Lupa password atau akun bermasalah',
  },
];

const initialMessages = [
  {
    id: 'bot-hello',
    role: 'bot',
    text: 'Halo! Aku asisten GameLokalID. Tanyakan soal fitur, alur daftar, atau tips memakai platform.',
  },
  {
    id: 'bot-tip',
    role: 'bot',
    text: 'Coba klik badge pertanyaan cepat di sebelah kanan untuk memulai.',
  },
];

const Help = () => {
  const [theme, setTheme] = useState(() => getTheme());
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const pushMessage = (role, text) => ({
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role,
    text,
  });

  const handleSend = async (text) => {
    const value = text.trim();
    if (!value) return;

    setMessages((prev) => [...prev, pushMessage('user', value)]);
    setInput('');
    setSending(true);

    try {
      const data = await sendChatMessage(value);
      setMessages((prev) => [...prev, pushMessage('bot', data.reply)]);
    } catch (error) {
      const fallback =
        error?.message || 'Maaf, sistem chatbot sedang bermasalah. Coba lagi sebentar ya.';
      setMessages((prev) => [...prev, pushMessage('bot', fallback)]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!sending) {
      handleSend(input);
    }
  };

  const handleTemplateClick = (label) => {
    if (!sending) {
      handleSend(label);
    }
  };

  useEffect(() => {
    const handleThemeChange = () => setTheme(getTheme());
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.add('theme-page-help');
    if (theme === 'light') {
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
    }
    return () => {
      body.classList.remove('theme-page-help');
      body.classList.remove('theme-light');
    };
  }, [theme]);

  return (
    <div className={`page help-page section ${theme === 'light' ? 'theme-light' : ''}`}>
      <section className="help-hero">
        <div>
          <p className="help-kicker">Pusat Bantuan GameLokalID</p>
          <h1>Butuh bantuan cepat? Chat di sini.</h1>
          <p className="help-subtitle">
            Temukan jawaban singkat seputar cara daftar, memberi review, dan mengelola game lokal.
          </p>
          <div className="help-actions">
            <Link className="btn-primary" to="/register">
              Mulai Daftar
            </Link>
            <Link className="btn-outline" to="/games">
              Lihat Daftar Game
            </Link>
          </div>
        </div>
        <div className="help-hero__badge">
          <span>Live Support</span>
          <p>Respon otomatis, admin siap follow up.</p>
        </div>
      </section>

      <section className="help-grid">
        <div className="help-chat">
          <div className="help-chat__header">
            <div>
              <p className="help-chat__title">Chatbot GameLokalID</p>
              <p className="help-chat__subtitle">Demo asisten komunitas</p>
            </div>
            <span className="help-chat__status">Online</span>
          </div>

          <div className="help-chat__messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`help-chat__bubble help-chat__bubble--${message.role}`}
              >
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <form className="help-chat__input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              placeholder="Tulis pertanyaanmu di sini..."
              onChange={(event) => setInput(event.target.value)}
              aria-label="Pertanyaan bantuan"
              disabled={sending}
            />
            <button type="submit" disabled={sending}>
              {sending ? 'Mengirim...' : 'Kirim'}
            </button>
          </form>
        </div>

        <aside className="help-side">
          <div className="help-panel">
            <h3>Template pertanyaan cepat</h3>
            <p className="muted-text">
              Klik badge di bawah untuk mengirimkan pertanyaan otomatis ke chatbot.
            </p>
            <div className="help-badges">
              {templateQuestions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  className="help-badge"
                  onClick={() => handleTemplateClick(question.label)}
                >
                  {question.label}
                </button>
              ))}
            </div>
          </div>

          <div className="help-panel help-panel--accent">
            <h3>Petunjuk penggunaan</h3>
            <ul className="help-list">
              <li>Gunakan badge untuk pertanyaan umum.</li>
              <li>Untuk admin, gunakan halaman khusus di /register/admin.</li>
              <li>Review game tersedia di halaman detail tiap game.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Help;
