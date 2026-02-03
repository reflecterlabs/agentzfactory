import sqlite3 from 'sqlite3';
import { User, Creation, Wallet, Payment, Language } from '../types';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/agentzfactory.db');
let db: sqlite3.Database | null = null;

function getDb(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
}

export async function initDatabase(): Promise<sqlite3.Database> {
  const database = getDb();
  
  return new Promise((resolve, reject) => {
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        telegram_id TEXT UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tier TEXT DEFAULT 'free',
        is_admin INTEGER DEFAULT 0,
        daily_generations INTEGER DEFAULT 0,
        last_generation_at DATETIME,
        language TEXT DEFAULT 'en'
      );
      
      CREATE TABLE IF NOT EXISTS creations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        prompt_sanitized TEXT NOT NULL,
        phase TEXT DEFAULT 'frontend',
        status TEXT DEFAULT 'generating',
        frontend_url TEXT,
        pro_url TEXT,
        components TEXT,
        token_count INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL UNIQUE,
        encrypted_private_key TEXT NOT NULL,
        public_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        creation_id TEXT,
        wallet_address TEXT NOT NULL,
        expected_amount TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        tx_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        received_at DATETIME,
        confirmed_at DATETIME
      );
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(database);
      }
    });
  });
}

// Helper function to run queries
function run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// User operations
export async function getOrCreateUser(telegramId: string, username?: string, firstName?: string): Promise<User> {
  let user = await get('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
  
  if (!user) {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const isAdmin = telegramId === process.env.OWNER_TELEGRAM_ID ? 1 : 0;
    
    await run(
      'INSERT INTO users (id, telegram_id, username, first_name, is_admin) VALUES (?, ?, ?, ?, ?)',
      [id, telegramId, username, firstName, isAdmin]
    );
    
    user = await get('SELECT * FROM users WHERE id = ?', [id]);
  }
  
  return {
    ...user,
    isAdmin: Boolean(user.is_admin),
    tier: user.tier as 'free' | 'pro',
    language: (user.language as Language) || 'en'
  };
}

export async function getUserByTelegramId(telegramId: string): Promise<User | null> {
  const user = await get('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
  if (!user) return null;
  return {
    ...user,
    isAdmin: Boolean(user.is_admin),
    tier: user.tier as 'free' | 'pro',
    language: (user.language as Language) || 'en'
  };
}

export async function updateUserTier(userId: string, tier: 'free' | 'pro'): Promise<void> {
  await run('UPDATE users SET tier = ? WHERE id = ?', [tier, userId]);
}

export async function updateUserLanguage(userId: string, language: string): Promise<void> {
  await run('UPDATE users SET language = ? WHERE id = ?', [language, userId]);
}

export async function resetDailyGenerations(): Promise<void> {
  await run('UPDATE users SET daily_generations = 0');
}

export async function incrementDailyGenerations(userId: string): Promise<void> {
  await run(
    'UPDATE users SET daily_generations = daily_generations + 1, last_generation_at = CURRENT_TIMESTAMP WHERE id = ?',
    [userId]
  );
}

// Creation operations
export async function createCreation(userId: string, name: string, description: string, promptSanitized: string): Promise<Creation> {
  const id = `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await run(
    'INSERT INTO creations (id, user_id, name, description, prompt_sanitized) VALUES (?, ?, ?, ?, ?)',
    [id, userId, name, description, promptSanitized]
  );
  
  return await get('SELECT * FROM creations WHERE id = ?', [id]);
}

export async function getCreationsByUser(userId: string): Promise<Creation[]> {
  return await all('SELECT * FROM creations WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

export async function getCreationById(id: string): Promise<Creation | null> {
  const creation = await get('SELECT * FROM creations WHERE id = ?', [id]);
  if (!creation) return null;
  return {
    ...creation,
    components: creation.components ? JSON.parse(creation.components) : undefined
  };
}

export async function updateCreationStatus(id: string, status: string, frontendUrl?: string): Promise<void> {
  await run(
    'UPDATE creations SET status = ?, frontend_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, frontendUrl, id]
  );
}

export async function updateCreationToPro(id: string, proUrl: string): Promise<void> {
  await run(
    'UPDATE creations SET phase = ?, pro_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['pro', proUrl, id]
  );
}

// Wallet operations
export async function getWalletByUser(userId: string): Promise<Wallet | null> {
  return await get('SELECT * FROM wallets WHERE user_id = ?', [userId]);
}

export async function createWallet(userId: string, address: string, encryptedPrivateKey: string, publicKey: string): Promise<Wallet> {
  const id = `wallet_${Date.now()}`;
  
  await run(
    'INSERT INTO wallets (id, user_id, address, encrypted_private_key, public_key) VALUES (?, ?, ?, ?, ?)',
    [id, userId, address, encryptedPrivateKey, publicKey]
  );
  
  return await get('SELECT * FROM wallets WHERE id = ?', [id]);
}

// Payment operations
export async function createPayment(userId: string, walletAddress: string, expectedAmount: string, creationId?: string): Promise<Payment> {
  const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  await run(
    'INSERT INTO payments (id, user_id, creation_id, wallet_address, expected_amount, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, creationId || null, walletAddress, expectedAmount, expiresAt.toISOString()]
  );
  
  return await get('SELECT * FROM payments WHERE id = ?', [id]);
}

export async function getPendingPayments(): Promise<Payment[]> {
  return await all(
    "SELECT * FROM payments WHERE status = 'pending' AND expires_at > datetime('now')"
  );
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  return await all('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

export async function markPaymentReceived(id: string, txHash: string): Promise<void> {
  await run(
    "UPDATE payments SET status = 'received', tx_hash = ?, received_at = CURRENT_TIMESTAMP WHERE id = ?",
    [txHash, id]
  );
}

export async function markPaymentConfirmed(id: string): Promise<void> {
  await run(
    "UPDATE payments SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );
}

// Admin operations
export async function getAllUsers(): Promise<User[]> {
  const users = await all('SELECT * FROM users ORDER BY created_at DESC');
  return users.map((u: any) => ({
    ...u,
    isAdmin: Boolean(u.is_admin),
    tier: u.tier as 'free' | 'pro',
    language: (u.language as Language) || 'en'
  }));
}

export async function getStats(): Promise<{ users: number; creations: number; payments: number; totalRevenue: string }> {
  const users = await get('SELECT COUNT(*) as count FROM users');
  const creations = await get('SELECT COUNT(*) as count FROM creations');
  const payments = await get("SELECT COUNT(*) as count FROM payments WHERE status = 'confirmed'");
  const revenue = await get("SELECT SUM(CAST(expected_amount AS REAL)) as total FROM payments WHERE status = 'confirmed'");
  
  return {
    users: users?.count || 0,
    creations: creations?.count || 0,
    payments: payments?.count || 0,
    totalRevenue: revenue?.total?.toString() || '0'
  };
}

export async function deleteUser(telegramId: string): Promise<void> {
  const user = await get('SELECT id FROM users WHERE telegram_id = ?', [telegramId]);
  if (user) {
    await run('DELETE FROM payments WHERE user_id = ?', [user.id]);
    await run('DELETE FROM creations WHERE user_id = ?', [user.id]);
    await run('DELETE FROM wallets WHERE user_id = ?', [user.id]);
    await run('DELETE FROM users WHERE id = ?', [user.id]);
  }
}
