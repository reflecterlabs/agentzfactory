import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { User, Creation, Wallet, Payment, Language } from '../types';

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;
  
  db = await open({
    filename: './data/agentzfactory.db',
    driver: sqlite3.Database
  });
  
  await createTables();
  return db;
}

async function createTables() {
  if (!db) throw new Error('Database not initialized');
  
  // Tabla de usuarios
  await db.exec(`
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
    )
  `);
  
  // Tabla de creaciones
  await db.exec(`
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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // Tabla de wallets
  await db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      address TEXT NOT NULL UNIQUE,
      encrypted_private_key TEXT NOT NULL,
      public_key TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // Tabla de pagos
  await db.exec(`
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
      confirmed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (creation_id) REFERENCES creations(id)
    )
  `);
}

// User operations
export async function getOrCreateUser(telegramId: string, username?: string, firstName?: string): Promise<User> {
  const db = await initDatabase();
  
  let user = await db.get('SELECT * FROM users WHERE telegram_id = ?', telegramId);
  
  if (!user) {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const isAdmin = telegramId === process.env.OWNER_TELEGRAM_ID ? 1 : 0;
    
    await db.run(
      'INSERT INTO users (id, telegram_id, username, first_name, is_admin) VALUES (?, ?, ?, ?, ?)',
      [id, telegramId, username, firstName, isAdmin]
    );
    
    user = await db.get('SELECT * FROM users WHERE id = ?', id);
  }
  
  return {
    ...user,
    isAdmin: Boolean(user.is_admin),
    tier: user.tier as 'free' | 'pro',
    language: user.language as Language || 'en'
  };
}

export async function getUserByTelegramId(telegramId: string): Promise<User | null> {
  const db = await initDatabase();
  const user = await db.get('SELECT * FROM users WHERE telegram_id = ?', telegramId);
  if (!user) return null;
  return {
    ...user,
    isAdmin: Boolean(user.is_admin),
    tier: user.tier as 'free' | 'pro',
    language: user.language as Language || 'en'
  };
}

export async function updateUserTier(userId: string, tier: 'free' | 'pro'): Promise<void> {
  const db = await initDatabase();
  await db.run('UPDATE users SET tier = ? WHERE id = ?', [tier, userId]);
}

export async function updateUserLanguage(userId: string, language: string): Promise<void> {
  const db = await initDatabase();
  await db.run('UPDATE users SET language = ? WHERE id = ?', [language, userId]);
}

export async function resetDailyGenerations(): Promise<void> {
  const db = await initDatabase();
  await db.run('UPDATE users SET daily_generations = 0');
}

export async function incrementDailyGenerations(userId: string): Promise<void> {
  const db = await initDatabase();
  await db.run(
    'UPDATE users SET daily_generations = daily_generations + 1, last_generation_at = CURRENT_TIMESTAMP WHERE id = ?',
    userId
  );
}

// Creation operations
export async function createCreation(userId: string, name: string, description: string, promptSanitized: string): Promise<Creation> {
  const db = await initDatabase();
  const id = `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.run(
    'INSERT INTO creations (id, user_id, name, description, prompt_sanitized) VALUES (?, ?, ?, ?, ?)',
    [id, userId, name, description, promptSanitized]
  );
  
  return await db.get('SELECT * FROM creations WHERE id = ?', id);
}

export async function getCreationsByUser(userId: string): Promise<Creation[]> {
  const db = await initDatabase();
  return await db.all('SELECT * FROM creations WHERE user_id = ? ORDER BY created_at DESC', userId);
}

export async function getCreationById(id: string): Promise<Creation | null> {
  const db = await initDatabase();
  const creation = await db.get('SELECT * FROM creations WHERE id = ?', id);
  if (!creation) return null;
  return {
    ...creation,
    components: creation.components ? JSON.parse(creation.components) : undefined
  };
}

export async function updateCreationStatus(id: string, status: string, frontendUrl?: string): Promise<void> {
  const db = await initDatabase();
  await db.run(
    'UPDATE creations SET status = ?, frontend_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, frontendUrl, id]
  );
}

export async function updateCreationToPro(id: string, proUrl: string): Promise<void> {
  const db = await initDatabase();
  await db.run(
    'UPDATE creations SET phase = ?, pro_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['pro', proUrl, id]
  );
}

// Wallet operations
export async function getWalletByUser(userId: string): Promise<Wallet | null> {
  const db = await initDatabase();
  return await db.get('SELECT * FROM wallets WHERE user_id = ?', userId);
}

export async function createWallet(userId: string, address: string, encryptedPrivateKey: string, publicKey: string): Promise<Wallet> {
  const db = await initDatabase();
  const id = `wallet_${Date.now()}`;
  
  await db.run(
    'INSERT INTO wallets (id, user_id, address, encrypted_private_key, public_key) VALUES (?, ?, ?, ?, ?)',
    [id, userId, address, encryptedPrivateKey, publicKey]
  );
  
  return await db.get('SELECT * FROM wallets WHERE id = ?', id);
}

// Payment operations
export async function createPayment(userId: string, walletAddress: string, expectedAmount: string, creationId?: string): Promise<Payment> {
  const db = await initDatabase();
  const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
  
  await db.run(
    'INSERT INTO payments (id, user_id, creation_id, wallet_address, expected_amount, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, creationId || null, walletAddress, expectedAmount, expiresAt.toISOString()]
  );
  
  return await db.get('SELECT * FROM payments WHERE id = ?', id);
}

export async function getPendingPayments(): Promise<Payment[]> {
  const db = await initDatabase();
  return await db.all(
    "SELECT * FROM payments WHERE status = 'pending' AND expires_at > datetime('now')"
  );
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  const db = await initDatabase();
  return await db.all('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', userId);
}

export async function markPaymentReceived(id: string, txHash: string): Promise<void> {
  const db = await initDatabase();
  await db.run(
    "UPDATE payments SET status = 'received', tx_hash = ?, received_at = CURRENT_TIMESTAMP WHERE id = ?",
    [txHash, id]
  );
}

export async function markPaymentConfirmed(id: string): Promise<void> {
  const db = await initDatabase();
  await db.run(
    "UPDATE payments SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP WHERE id = ?",
    id
  );
}

// Admin operations
export async function getAllUsers(): Promise<User[]> {
  const db = await initDatabase();
  const users = await db.all('SELECT * FROM users ORDER BY created_at DESC');
  return users.map(u => ({
    ...u,
    isAdmin: Boolean(u.is_admin),
    tier: u.tier as 'free' | 'pro'
  }));
}

export async function getStats(): Promise<{ users: number; creations: number; payments: number; totalRevenue: string }> {
  const db = await initDatabase();
  
  const users = await db.get('SELECT COUNT(*) as count FROM users');
  const creations = await db.get('SELECT COUNT(*) as count FROM creations');
  const payments = await db.get("SELECT COUNT(*) as count FROM payments WHERE status = 'confirmed'");
  const revenue = await db.get("SELECT SUM(CAST(expected_amount AS REAL)) as total FROM payments WHERE status = 'confirmed'");
  
  return {
    users: users.count,
    creations: creations.count,
    payments: payments.count,
    totalRevenue: revenue.total?.toString() || '0'
  };
}

export async function deleteUser(telegramId: string): Promise<void> {
  const db = await initDatabase();
  const user = await db.get('SELECT id FROM users WHERE telegram_id = ?', telegramId);
  if (user) {
    await db.run('DELETE FROM payments WHERE user_id = ?', user.id);
    await db.run('DELETE FROM creations WHERE user_id = ?', user.id);
    await db.run('DELETE FROM wallets WHERE user_id = ?', user.id);
    await db.run('DELETE FROM users WHERE id = ?', user.id);
  }
}
