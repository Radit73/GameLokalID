const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const usageByIp = new Map();

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
};

const checkRateLimit = (ip) => {
  const now = Date.now();
  const entry = usageByIp.get(ip);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    usageByIp.set(ip, { windowStart: now, count: 1 });
    return { blocked: false };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { blocked: true, retryAfterMs };
  }

  entry.count += 1;
  usageByIp.set(ip, entry);
  return { blocked: false };
};

export const createChatCompletion = async (req, res) => {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (rateLimit.blocked) {
    const retryAfterSeconds = Math.ceil(rateLimit.retryAfterMs / 1000);
    res.set('Retry-After', `${retryAfterSeconds}`);
    return res.status(429).json({
      message: `Batas 5 pertanyaan per menit tercapai. Coba lagi dalam ${retryAfterSeconds} detik.`,
    });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Pesan tidak valid.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'GROQ_API_KEY belum diatur di server.' });
  }

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'Kamu adalah asisten GameLokalID. Jawab dalam bahasa Indonesia yang ringkas dan ramah. ' +
              'Fokus pada fitur situs: daftar reviewer, daftar admin di /register/admin dengan passcode, ' +
              'daftar game, review di halaman detail game, dan kebijakan privasi. ' +
              'Jika tidak tahu, arahkan pengguna untuk menghubungi admin melalui halaman Bantuan.',
          },
          { role: 'user', content: message.trim() },
        ],
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMessage = data?.error?.message || 'Gagal mengambil jawaban dari AI.';
      return res.status(502).json({ message: errorMessage });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ message: 'Jawaban AI kosong.' });
    }

    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan saat memproses AI.' });
  }
};
