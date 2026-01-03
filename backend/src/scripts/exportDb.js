import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import mysqlBase from 'mysql2';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'gamelokalid',
  DB_PORT = 3306,
  DB_SEED_PATH = './db/seed.sql',
} = process.env;

const ensureDir = async (filePath) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
};

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (Buffer.isBuffer(value)) {
    return mysqlBase.escape(value.toString('hex'));
  }
  if (typeof value === 'object') {
    return mysqlBase.escape(JSON.stringify(value));
  }
  return mysqlBase.escape(value);
};

const exportDatabase = async () => {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
  });

  const [tables] = await connection.query(
    'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
    [DB_NAME],
  );

  const lines = [
    '-- GameLokalID database export',
    `-- Generated at ${new Date().toISOString()}`,
    'SET FOREIGN_KEY_CHECKS=0;',
    '',
  ];

  for (const row of tables) {
    const tableName = row.TABLE_NAME;
    const [createRows] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
    const createSql = createRows[0]['Create Table'];

    lines.push(`DROP TABLE IF EXISTS \`${tableName}\`;`);
    lines.push(`${createSql};`);

    const [dataRows] = await connection.query(`SELECT * FROM \`${tableName}\``);
    if (dataRows.length > 0) {
      const columns = Object.keys(dataRows[0]).map((col) => `\`${col}\``).join(', ');
      for (const dataRow of dataRows) {
        const values = Object.values(dataRow).map(formatValue).join(', ');
        lines.push(`INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});`);
      }
    }

    lines.push('');
  }

  lines.push('SET FOREIGN_KEY_CHECKS=1;');

  const outputPath = path.resolve(DB_SEED_PATH);
  await ensureDir(outputPath);
  await fs.writeFile(outputPath, lines.join('\n'), 'utf8');

  await connection.end();
  console.log(`Database exported to ${outputPath}`);
};

exportDatabase().catch((error) => {
  console.error('Failed to export database', error);
  process.exit(1);
});
