// Bot de comandos por texto - Funciona dentro de OpenClaw
import { t } from './i18n';
import * as db from './services/database';
import { walletService } from './services/wallet';
import { generateAndDeploy } from './services/generation-real';
import { User } from './types';

// Sesiones simples en memoria
const sessions = new Map<string, { awaitingDescription: boolean; step?: string }>();

// Parsear comandos de texto
export function parseCommand(text: string): { command: string; args: string } {
  const lower = text.toLowerCase().trim();
  
  // Detectar comandos con prefijo
  if (lower.startsWith('new:') || lower.startsWith('create:')) {
    return { command: 'new', args: text.substring(text.indexOf(':') + 1).trim() };
  }
  
  if (lower.startsWith('lang:') || lower.startsWith('language:')) {
    return { command: 'lang', args: text.substring(text.indexOf(':') + 1).trim() };
  }
  
  // Language codes direct
  if (['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja'].includes(lower)) {
    return { command: 'lang', args: lower };
  }
  
  // Comandos directos
  if (lower === 'apps' || lower === 'my apps' || lower === 'list') {
    return { command: 'apps', args: '' };
  }
  
  if (lower === 'pro' || lower === 'upgrade' || lower === 'premium') {
    return { command: 'pro', args: '' };
  }
  
  if (lower === 'status' || lower === 'stats' || lower === 'account') {
    return { command: 'status', args: '' };
  }
  
  if (lower === 'help' || lower === '?' || lower === 'commands') {
    return { command: 'help', args: '' };
  }
  
  if (lower === 'cancel' || lower === 'stop') {
    return { command: 'cancel', args: '' };
  }
  
  if (lower === 'start' || lower === 'hello' || lower === 'hi') {
    return { command: 'start', args: '' };
  }
  
  // Admin commands
  if (lower.startsWith('admin ')) {
    const parts = text.split(' ');
    return { command: 'admin', args: parts.slice(1).join(' ') };
  }
  
  // Si está esperando descripción
  return { command: 'text', args: text };
}

// Procesar comando
export async function processCommand(
  userId: string, 
  telegramId: string, 
  username: string | undefined,
  firstName: string | undefined,
  text: string
): Promise<{ type: 'text' | 'markdown' | 'buttons'; content: string; buttons?: any[] }> {
  
  // Obtener o crear usuario
  let user = await db.getOrCreateUser(telegramId, username, firstName);
  const lang = user.language || 'en';
  const session = sessions.get(user.id);
  
  const { command, args } = parseCommand(text);
  
  // Si está esperando descripción
  if (session?.awaitingDescription && command === 'text') {
    sessions.delete(user.id);
    return await handleCreation(user, args);
  }
  
  switch (command) {
    case 'start':
      return handleStart(user);
    
    case 'lang':
      return await handleLang(user, args);
    
    case 'new':
      if (args) {
        return await handleCreation(user, args);
      }
      sessions.set(user.id, { awaitingDescription: true });
      return {
        type: 'text',
        content: t('newCreation', lang)
      };
    
    case 'apps':
      return await handleApps(user);
    
    case 'status':
      return await handleStatus(user);
    
    case 'pro':
      return await handlePro(user);
    
    case 'help':
      return handleHelp(user);
    
    case 'cancel':
      sessions.delete(user.id);
      return { type: 'text', content: t('cancelled', lang) };
    
    case 'admin':
      return await handleAdmin(user, args);
    
    default:
      return {
        type: 'text',
        content: `I don't understand. Try:\n` +
                 `• "new: description" - Create app\n` +
                 `• "apps" - View your apps\n` +
                 `• "pro" - Upgrade to PRO\n` +
                 `• "status" - Your status\n` +
                 `• "help" - Full help`
      };
  }
}

async function handleStart(user: User): Promise<any> {
  const lang = user.language || 'en';
  
  // Si es primera vez, mostrar selección de idioma
  if (!user.lastGenerationAt) {
    return {
      type: 'buttons',
      content: t('chooseLanguage', lang),
      buttons: [
        [{ text: '🇺🇸 English', callback: 'lang:en' }],
        [{ text: '🇪🇸 Español', callback: 'lang:es' }],
        [{ text: '🇫🇷 Français', callback: 'lang:fr' }],
        [{ text: '🇩🇪 Deutsch', callback: 'lang:de' }]
      ]
    };
  }
  
  return { type: 'text', content: t('welcome', lang) };
}

async function handleLang(user: User, langCode: string): Promise<any> {
  const validLangs = ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja'];
  const lang: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' = validLangs.includes(langCode) ? (langCode as any) : 'en';
  
  await db.updateUserLanguage(user.id, lang);
  user.language = lang;
  
  return { type: 'text', content: t('languageSet', lang, lang.toUpperCase()) };
}

async function handleCreation(user: User, description: string): Promise<any> {
  const lang = user.language || 'en';
  
  if (description.length < 10) {
    return { type: 'text', content: '❌ Description too short (min 10 chars)' };
  }
  
  // Verificar límites
  if (user.tier === 'free') {
    const creations = await db.getCreationsByUser(user.id);
    if (creations.length >= 3) {
      return { type: 'text', content: t('limitReached', lang, 'Max 3 free apps. Use "pro" to upgrade.') };
    }
    if (user.dailyGenerations >= 3) {
      return { type: 'text', content: t('limitReached', lang, 'Daily limit reached. Try tomorrow.') };
    }
  }
  
  // Generar y deployar app REAL
  const result = await generateAndDeploy(description, user.id);
  
  if (!result.success) {
    return { type: 'text', content: `❌ Error: ${result.error}` };
  }
  
  // Guardar en DB
  const name = description.split(' ').slice(0, 5).join(' ') + '...';
  await db.createCreation(user.id, name, description, description);
  await db.incrementDailyGenerations(user.id);
  await db.updateCreationStatus(result.creationId, 'deployed', result.url);
  
  // Verificar si es generación parcial
  if (result.tokenCount >= 3500) {
    return {
      type: 'text',
      content: `⏹️ PARTIAL GENERATION\n\n` +
               `${result.componentCount} components generated.\n\n` +
               `✅ Preview: ${result.url}\n\n` +
               `💎 To complete all components: Reply "pro"\n\n` +
               `📊 Stats: ${result.tokenCount} tokens used`
    };
  }
  
  return {
    type: 'text',
    content: `✅ APP CREATED!\n\n` +
             `🔗 ${result.url}\n\n` +
             `📊 Stats:\n` +
             `• Components: ${result.componentCount}\n` +
             `• Tokens: ${result.tokenCount}\n\n` +
             `💎 To add backend: Reply "pro"`
  };
}

async function handleApps(user: User): Promise<any> {
  const lang = user.language || 'en';
  const creations = await db.getCreationsByUser(user.id);
  
  if (creations.length === 0) {
    return { type: 'text', content: t('noApps', lang) };
  }
  
  let message = t('yourApps', lang, creations.length, 3);
  
  for (let i = 0; i < creations.length; i++) {
    const app = creations[i];
    const status = app.phase === 'pro' ? '✅ PRO' : '🟢';
    message += `${i + 1}. ${status} ${app.name}\n`;
    if (app.frontendUrl) {
      message += `   🔗 ${app.frontendUrl}\n`;
    }
  }
  
  return { type: 'text', content: message };
}

async function handleStatus(user: User): Promise<any> {
  const lang = user.language || 'en';
  const creations = await db.getCreationsByUser(user.id);
  const tier = user.tier === 'pro' ? '💎 PRO' : '🆓 Free';
  
  return {
    type: 'text',
    content: t('status', lang, tier, creations.length, 3, user.dailyGenerations, 3)
  };
}

async function handlePro(user: User): Promise<any> {
  const lang = user.language || 'en';
  
  let wallet = await db.getWalletByUser(user.id);
  if (!wallet) {
    const walletData = await walletService.generateWallet(user.id);
    wallet = await db.createWallet(user.id, walletData.address, walletData.encryptedPrivateKey, walletData.publicKey);
  }
  
  const creations = await db.getCreationsByUser(user.id);
  const pending = creations.filter(c => c.phase === 'frontend' && c.status === 'deployed');
  
  if (pending.length === 0) {
    return { type: 'text', content: '💎 No pending apps. Create one with "new: description"' };
  }
  
  // Crear pago para la primera app
  await db.createPayment(user.id, wallet.address, '100', pending[0].id);
  
  return {
    type: 'markdown',
    content: t('activatePro', lang, pending[0].name, wallet.address, '100')
  };
}

function handleHelp(user: User): Promise<any> {
  const lang = user.language || 'en';
  return Promise.resolve({
    type: 'text',
    content: t('help', lang, 3, 4000, 8, 5)
  });
}

async function handleAdmin(user: User, args: string): Promise<any> {
  const OWNER_ID = '6180369194';
  
  if (user.telegramId !== OWNER_ID) {
    return { type: 'text', content: '⛔ You are not authorized.' };
  }
  
  const parts = args.split(' ');
  const subcommand = parts[0];
  
  switch (subcommand) {
    case 'stats': {
      const stats = await db.getStats();
      return {
        type: 'text',
        content: `📊 STATS\n\n` +
                 `Users: ${stats.users}\n` +
                 `Apps: ${stats.creations}\n` +
                 `PRO: ${stats.payments}\n` +
                 `Revenue: ${stats.totalRevenue} STRK`
      };
    }
    
    case 'users': {
      const users = await db.getAllUsers();
      let msg = `👥 USERS (${users.length})\n\n`;
      users.slice(0, 10).forEach((u: User) => {
        msg += `${u.username || u.firstName || 'Unknown'} (${u.telegramId})\n`;
      });
      return { type: 'text', content: msg };
    }
    
    default:
      return {
        type: 'text',
        content: `Admin commands:\n` +
                 `• admin stats\n` +
                 `• admin users`
      };
  }
}
