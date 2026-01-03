import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'gamelokalid',
  DB_PORT = 3306,
  DB_SEED_PATH = './db/seed.sql',
} = process.env;

const ensureDatabase = async () => {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  );
  await connection.end();
};

const importDatabase = async () => {
  const seedPath = path.resolve(DB_SEED_PATH);
  try {
    await fs.access(seedPath);
  } catch {
    console.log(`Seed file not found at ${seedPath}, skipping import.`);
    return;
  }

  const sql = await fs.readFile(seedPath, 'utf8');
  if (!sql.trim()) {
    console.log(`Seed file is empty at ${seedPath}, skipping import.`);
    return;
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
    multipleStatements: true,
  });

  await connection.query(sql);
  await connection.end();
  console.log(`Database imported from ${seedPath}`);
};

const run = async () => {
  await ensureDatabase();
  await importDatabase();
};

run().catch((error) => {
  console.error('Failed to import database', error);
  process.exit(1);
});
