import 'dotenv/config';
import { query } from '../db/postgres.js';

async function setup() {
  console.log('מתחבר ל-PostgreSQL...');

  await query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL DEFAULT '',
      category VARCHAR(255) DEFAULT '',
      total_amount DECIMAL(10,2) DEFAULT 0,
      remain_amount DECIMAL(10,2) DEFAULT 0,
      description TEXT DEFAULT '',
      expire_date TIMESTAMP,
      purchase_date TIMESTAMP DEFAULT NOW(),
      is_used BOOLEAN DEFAULT FALSE
    );

    CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON coupons(user_id);
  `);

  console.log('✅ הטבלאות נוצרו בהצלחה!');
  console.log('   - users');
  console.log('   - coupons');
  process.exit(0);
}

setup().catch((err) => {
  console.error('שגיאה:', err.message);
  process.exit(1);
});
