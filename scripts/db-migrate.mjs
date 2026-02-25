import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function loadEnvFile(filename) {
  const p = path.join(root, filename);
  if (!fs.existsSync(p)) return;
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx === -1) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const rawConnectionString = process.env.SUPABASE_DB_URL;
if (!rawConnectionString) {
  console.error('❌ Missing SUPABASE_DB_URL. Add it to .env.local');
  process.exit(1);
}

const connectionString = rawConnectionString.includes('sslmode=require')
  ? rawConnectionString.replace('sslmode=require', 'sslmode=no-verify')
  : rawConnectionString;

const migrationsDir = path.join(root, 'supabase', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.error(`❌ Migrations directory not found: ${migrationsDir}`);
  process.exit(1);
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function ensureMigrationsTable() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getApplied() {
  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

async function applyMigration(filename, sql) {
  console.log(`➡️  Applying ${filename}`);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    await client.query('COMMIT');
    console.log(`✅ Applied ${filename}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function main() {
  await client.connect();
  await ensureMigrationsTable();
  const applied = await getApplied();

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let ran = 0;
  for (const filename of files) {
    if (applied.has(filename)) {
      console.log(`⏭️  Skipping ${filename} (already applied)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf8');
    await applyMigration(filename, sql);
    ran += 1;
  }

  if (ran === 0) console.log('✅ No pending migrations');
  else console.log(`✅ Migration complete (${ran} applied)`);

  await client.end();
}

main().catch(async (err) => {
  console.error('❌ Migration failed:', err.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
