import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const {
  DATABASE_URL,
  DB_HOST,
  DB_HOSTADDR,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT = 5432,
  DB_SSL = 'true',
} = process.env;

const useUrl = DATABASE_URL && !DB_HOSTADDR;

const poolConfig = {
  connectionString: useUrl ? DATABASE_URL : undefined,
  host: useUrl ? undefined : DB_HOST,
  hostaddr: DB_HOSTADDR || undefined,
  user: useUrl ? undefined : DB_USER,
  password: useUrl ? undefined : DB_PASSWORD,
  database: useUrl ? undefined : DB_NAME,
  port: useUrl ? undefined : Number(DB_PORT),
  ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

const pool = new Pool(poolConfig);

const ensureTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'USER',
      profile_photo TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      developer VARCHAR(255),
      publisher VARCHAR(255),
      platform TEXT,
      owner_id INT REFERENCES users(id) ON DELETE SET NULL,
      mode VARCHAR(100),
      genres TEXT,
      release_date VARCHAR(50),
      description TEXT,
      cover_image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INT NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_logs (
      id SERIAL PRIMARY KEY,
      user_id INT,
      role VARCHAR(50),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100),
      entity_id INT,
      meta JSONB,
      ip VARCHAR(100),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_user_logs_user_id ON user_logs(user_id)');
};

const ensureDefaultUsers = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gamelokal.id';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const superEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@gamelokal.id';
  const superPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';

  const adminRows = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (adminRows.rows.length === 0) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['Administrator', adminEmail, hashed, 'ADMIN'],
    );
  }

  const superRows = await pool.query('SELECT id FROM users WHERE email = $1', [superEmail]);
  if (superRows.rows.length === 0) {
    const hashed = await bcrypt.hash(superPassword, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['Super Admin', superEmail, hashed, 'SUPER_ADMIN'],
    );
  }
};

const seedSampleData = async () => {
  const { rows } = await pool.query('SELECT COUNT(*)::int as count FROM games');
  if (rows[0]?.count > 0) return;

  const superRow = await pool.query("SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1");
  const adminRow = await pool.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");

  const ownerId = superRow.rows[0]?.id || adminRow.rows[0]?.id || null;
  const reviewerId = adminRow.rows[0]?.id || superRow.rows[0]?.id || null;

  const game1 = await pool.query(
    `INSERT INTO games (title, developer, publisher, platform, owner_id, mode, genres, release_date, description, cover_image)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      'Legenda Nusantara',
      'Studio Merah',
      'Borneo Interactive',
      'PC, Mobile',
      ownerId,
      'Singleplayer',
      'Aksi, RPG',
      '2024-08-12',
      'RPG aksi sinematik yang merayakan mitologi Indonesia.',
      'https://images.unsplash.com/photo-1472457974886-0ebcd59440cc?auto=format&fit=crop&w=900&q=80',
    ],
  );
  const game1Id = game1.rows[0]?.id;
  if (reviewerId && game1Id) {
    await pool.query(
      `INSERT INTO reviews (game_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)`,
      [game1Id, reviewerId, 9, 'Kombinasi budaya lokal dan gameplay modern, solid!'],
    );
    await pool.query(
      `INSERT INTO reviews (game_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)`,
      [game1Id, reviewerId, 8, 'Quest sampingan bervariasi dan seru.'],
    );
  }

  const game2 = await pool.query(
    `INSERT INTO games (title, developer, publisher, platform, owner_id, mode, genres, release_date, description, cover_image)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      'Pulau Strategis',
      'ArchiPlay',
      'Garuda Studio',
      'PC',
      ownerId,
      'Single & Co-op',
      'Strategi, Simulasi',
      '2024-05-10',
      'Strategi real-time dengan latar kepulauan Indonesia.',
      'https://via.placeholder.com/500x300?text=Pulau+Strategis',
    ],
  );
  const game2Id = game2.rows[0]?.id;
  if (reviewerId && game2Id) {
    await pool.query(
      `INSERT INTO reviews (game_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)`,
      [game2Id, reviewerId, 8, 'Mode co-op nya bikin betah main bareng.'],
    );
  }
};

const init = async () => {
  await ensureTables();
  await ensureDefaultUsers();
  await seedSampleData();
};

init().catch((err) => {
  console.error('Failed to initialize database', err);
});

export default pool;
