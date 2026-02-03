import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long!!!!!'; // Debe ser 32 chars

export async function encrypt(text: string): Promise<string> {
  const iv = randomBytes(16);
  const key = await scryptAsync(ENCRYPTION_KEY, 'salt', 32) as Buffer;
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export async function decrypt(encryptedData: string): Promise<string> {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted data format');
  
  const [ivHex, authTagHex, encrypted] = parts;
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = await scryptAsync(ENCRYPTION_KEY, 'salt', 32) as Buffer;
  
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Sanitización anti-prompt injection
export function sanitizePrompt(prompt: string): { sanitized: string; warnings: string[] } {
  const warnings: string[] = [];
  let sanitized = prompt;
  
  // Detectar patrones peligrosos
  const dangerousPatterns = [
    { pattern: /ignore previous instructions/gi, msg: 'Intento de override de instrucciones detectado' },
    { pattern: /system prompt/gi, msg: 'Referencia a system prompt detectada' },
    { pattern: /you are now/gi, msg: 'Intento de redefinición de rol detectado' },
    { pattern: /\{\{.*?\}\}/g, msg: 'Template injection detectada' },
    { pattern: /<script/gi, msg: 'Script tag detectado' },
    { pattern: /javascript:/gi, msg: 'JavaScript protocol detectado' },
    { pattern: /eval\s*\(/gi, msg: 'Eval detectado' },
    { pattern: /document\.write/gi, msg: 'Document.write detectado' }
  ];
  
  for (const { pattern, msg } of dangerousPatterns) {
    if (pattern.test(prompt)) {
      warnings.push(msg);
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
  }
  
  // Limitar longitud
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
    warnings.push('Prompt truncado a 2000 caracteres');
  }
  
  return { sanitized, warnings };
}

// Contador simple de tokens (aproximado)
export function estimateTokens(text: string): number {
  // Aproximación: ~4 caracteres = 1 token
  return Math.ceil(text.length / 4);
}
