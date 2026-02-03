import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from './config';
import * as db from './services/database';
import { User, Language } from './types';
import { t } from './i18n';
import * as userCommands from './commands/user';
import * as adminCommands from './commands/admin';
import { getMaintenanceMode } from './commands/admin';

const bot = new Telegraf(config.botToken || '');

// Mapa de sesiones simple (en producción usar Redis)
const userSessions = new Map<string, { awaitingDescription: boolean }>();

// Middleware para verificar mantenimiento
bot.use(async (ctx, next) => {
  if (getMaintenanceMode() && ctx.from?.id.toString() !== config.ownerTelegramId) {
    // Usar inglés por defecto para mantenimiento
    return ctx.reply(t('maintenance', 'en'));
  }
  return next();
});

// Middleware para obtener/crear usuario
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  
  const telegramId = ctx.from.id.toString();
  const user = await db.getOrCreateUser(
    telegramId,
    ctx.from.username,
    ctx.from.first_name
  );
  
  // Guardar user en contexto
  (ctx as any).user = user;
  return next();
});

// Comando /start
bot.command('start', async (ctx) => {
  const user = (ctx as any).user as User;
  
  // Si es primera vez o no tiene idioma seleccionado, preguntar idioma
  const isNewUser = !user.language || user.language === 'en';
  if (isNewUser && !user.lastGenerationAt) {
    await ctx.reply(t('chooseLanguage', 'en'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🇺🇸 English', callback_data: 'lang:en' }],
          [{ text: '🇪🇸 Español', callback_data: 'lang:es' }],
          [{ text: '🇫🇷 Français', callback_data: 'lang:fr' }],
          [{ text: '🇩🇪 Deutsch', callback_data: 'lang:de' }],
          [{ text: '🇵🇹 Português', callback_data: 'lang:pt' }]
        ]
      }
    });
    return;
  }
  
  await userCommands.handleStart(ctx, user);
});

// Comandos de idioma
bot.command(['lang_en', 'lang_es', 'lang_fr', 'lang_de', 'lang_pt', 'lang_zh', 'lang_ja'], async (ctx) => {
  const user = (ctx as any).user as User;
  const command = ctx.message.text.split(' ')[0];
  const lang = command.replace('/lang_', '') as Language;
  
  await db.updateUserLanguage(user.id, lang);
  user.language = lang;
  
  await ctx.reply(t('languageSet', lang, lang.toUpperCase()));
  await userCommands.handleStart(ctx, user);
});

// Comando /new
bot.command('new', async (ctx) => {
  const user = (ctx as any).user as User;
  await userCommands.handleNew(ctx, user);
  userSessions.set(user.id, { awaitingDescription: true });
});

// Comando /apps
bot.command('apps', async (ctx) => {
  const user = (ctx as any).user as User;
  await userCommands.handleApps(ctx, user);
});

// Comando /pro
bot.command('pro', async (ctx) => {
  const user = (ctx as any).user as User;
  await userCommands.handlePro(ctx, user);
});

// Comando /status
bot.command('status', async (ctx) => {
  const user = (ctx as any).user as User;
  await userCommands.handleStatus(ctx, user);
});

// Comando /help
bot.command('help', async (ctx) => {
  const user = (ctx as any).user as User;
  await userCommands.handleHelp(ctx, user);
});

// Comando /cancel
bot.command('cancel', async (ctx) => {
  const user = (ctx as any).user as User;
  const lang = user.language || 'en';
  userSessions.delete(user.id);
  await ctx.reply(t('cancelled', lang));
});

// Manejar mensajes de texto (para descripción de app)
bot.on(message('text'), async (ctx) => {
  const user = (ctx as any).user as User;
  const lang = user.language || 'en';
  const session = userSessions.get(user.id);
  
  if (session?.awaitingDescription) {
    userSessions.delete(user.id);
    await userCommands.processCreation(ctx, user, ctx.message.text);
  } else {
    await ctx.reply(`I don't understand that message. Use /help to see available commands.\n\nNo entiendo ese mensaje. Usa /help para ver los comandos disponibles.`);
  }
});

// Callback queries (botones inline)
bot.on('callback_query', async (ctx) => {
  const user = (ctx as any).user as User;
  
  // Check if it's a regular callback query with data
  if (!('data' in ctx.callbackQuery)) return;
  const data = ctx.callbackQuery.data;
  
  if (!data) return;
  
  // Selección de idioma
  if (data.startsWith('lang:')) {
    const lang = data.split(':')[1] as Language;
    await db.updateUserLanguage(user.id, lang);
    user.language = lang;
    await ctx.answerCbQuery(t('languageSet', lang, lang.toUpperCase()));
    await ctx.deleteMessage();
    await userCommands.handleStart(ctx, user);
    return;
  }
  
  // Botón de PRO
  if (data.startsWith('pro:')) {
    const creationId = data.split(':')[1];
    await ctx.answerCbQuery();
    await userCommands.handlePro(ctx, user, creationId);
    return;
  }
  
  // Botón de copiar dirección
  if (data.startsWith('copy:')) {
    await ctx.answerCbQuery('Address copied');
    return;
  }
  
  // Botón de nueva app
  if (data === 'new') {
    await ctx.answerCbQuery();
    await userCommands.handleNew(ctx, user);
    userSessions.set(user.id, { awaitingDescription: true });
    return;
  }
  
  // Botón de apps
  if (data === 'apps') {
    await ctx.answerCbQuery();
    await userCommands.handleApps(ctx, user);
    return;
  }
  
  // Admin: eliminar usuario
  if (data.startsWith('admin_delete:')) {
    const targetId = data.split(':')[1];
    await ctx.answerCbQuery();
    await adminCommands.handleAdminDelete(ctx, user, targetId);
    return;
  }
  
  // Admin: upgrade usuario
  if (data.startsWith('admin_upgrade:')) {
    const targetId = data.split(':')[1];
    await ctx.answerCbQuery();
    await ctx.reply(`⬆️ Upgrade requested for ${targetId}. Feature in development.`);
    return;
  }
});

// COMANDOS DE ADMIN
bot.command('admin', async (ctx) => {
  const user = (ctx as any).user as User;
  const args = ctx.message.text.split(' ').slice(1);
  const subcommand = args[0]?.toLowerCase();
  
  switch (subcommand) {
    case 'stats':
      await adminCommands.handleAdminStats(ctx, user);
      break;
    case 'users':
      await adminCommands.handleAdminUsers(ctx, user);
      break;
    case 'user':
      await adminCommands.handleAdminUser(ctx, user, args[1]);
      break;
    case 'delete':
      await adminCommands.handleAdminDelete(ctx, user, args[1]);
      break;
    case 'broadcast':
      await adminCommands.handleAdminBroadcast(ctx, user, args.slice(1).join(' '));
      break;
    case 'maintenance':
      await adminCommands.handleAdminMaintenance(ctx, user, args[1]);
      break;
    case 'funds':
      await adminCommands.handleAdminFunds(ctx, user);
      break;
    case 'setlimit':
      await adminCommands.handleAdminSetLimit(ctx, user, args[1], args[2]);
      break;
    default:
      await adminCommands.handleAdminHelp(ctx, user);
  }
});

// Inicializar base de datos
async function init() {
  await db.initDatabase();
  console.log('✅ Database initialized');
}

// Manejar errores
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An error occurred. Please try again later.').catch(console.error);
});

// Iniciar
init().then(() => {
  bot.launch();
  console.log('🤖 Bot started');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot };
