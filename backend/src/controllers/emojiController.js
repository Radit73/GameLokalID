const EMOJIS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '🤣',
  '😂',
  '🙂',
  '🙃',
  '😉',
  '😊',
  '😇',
  '😍',
  '🤩',
  '😘',
  '😗',
  '😜',
  '🤪',
  '😎',
  '🤠',
  '🧐',
  '🤓',
  '😺',
  '😸',
  '😹',
  '😻',
  '😼',
  '😽',
  '🙌',
  '👏',
  '👍',
  '🤝',
  '🔥',
  '⭐',
  '🌟',
  '⚡',
  '🎮',
  '🕹️',
  '🏆',
];

const lastHitByIp = new Map();
const WINDOW_MS = 10 * 1000; // 10 detik

export const getRandomEmoji = (req, res) => {
  const now = Date.now();
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const last = lastHitByIp.get(ip);
  if (last && now - last < WINDOW_MS) {
    const wait = Math.ceil((WINDOW_MS - (now - last)) / 1000);
    return res.status(429).json({ message: `Tunggu ${wait} detik sebelum generate lagi.` });
  }

  lastHitByIp.set(ip, now);
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  return res.json({ emoji, generatedAt: new Date().toISOString() });
};
