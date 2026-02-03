import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from './config';
import * as db from './services/database';
import { User } from './types';
import * as userCommands from './commands/user';
import * as adminCommands from './commands/admin';
import { getMaintenanceMode } from './commands/admin';

const bot = new Telegraf(config.botToken || '');

// Mapa de sesiones simple (en producción usar Redis)
const userSessions = new Map<string, { awaitingDescription: boolean }>();

// Middleware para verificar mantenimiento
bot.use(async (ctx, next) => {
  if (getMaintenanceMode() && ctx.from?.id.toString() !== config.ownerTelegramId) {
    return ctx.reply('🔧 El bot está en mantenimiento. Vuelve en unos minutos.');
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
  await userCommands.handleStart(ctx, user);
});

// Comando /new
bot.command('new', async (ctx) => {
  const user = (ctx as any).user as User;
  await userCommands.handleNew(ctx, user);
  
  // Marcar que estamos esperando descripción
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
  await userCommands.handleHelp(ctx);
});

// Comando /cancel
bot.command('cancel', async (ctx) => {
  const user = (ctx as any).user as User;
  userSessions.delete(user.id);
  await ctx.reply('❌ Operación cancelada. ¿Qué quieres hacer?\n/new - Crear app | /help - Ayuda');
});

// Manejar mensajes de texto (para descripción de app)
bot.on(message('text'), async (ctx) => {
  const user = (ctx as any).user as User;
  const session = userSessions.get(user.id);
  
  if (session?.awaitingDescription) {
    userSessions.delete(user.id);
    await userCommands.processCreation(ctx, user, ctx.message.text);
  } else {
    // Mensaje no esperado
    await ctx.reply('No entiendo ese mensaje. Usa /help para ver los comandos disponibles.');
  }
});

// Callback queries (botones inline)
bot.on('callback_query', async (ctx) => {
  const user = (ctx as any).user as User;
  const data = ctx.callbackQuery.data;
  
  if (!data) return;
  
  // Botón de PRO
  if (data.startsWith('pro:')) {
    const creationId = data.split(':')[1];
    await ctx.answerCbQuery();
    await userCommands.handlePro(ctx, user, creationId);
  }
  
  // Botón de copiar dirección
  if (data.startsWith('copy:')) {
    const address = data.split(':')[1];
    await ctx.answerCbQuery('Dirección copiada al portapapeles');
    // En móvil no se puede copiar automáticamente, así que solo confirmamos
  }
  
  // Botón de nueva app
  if (data === 'new') {
    await ctx.answerCbQuery();
    await userCommands.handleNew(ctx, user);
    userSessions.set(user.id, { awaitingDescription: true });
  }
  
  // Botón de apps
  if (data === 'apps') {
    await ctx.answerCbQuery();
    await userCommands.handleApps(ctx, user);
  }
  
  // Admin: eliminar usuario
  if (data.startsWith('admin_delete:')) {
    const targetId = data.split(':')[1];
    await ctx.answerCbQuery();
    await adminCommands.handleAdminDelete(ctx, user, targetId);
  }
  
  // Admin: upgrade usuario
  if (data.startsWith('admin_upgrade:')) {
    const targetId = data.split(':')[1];
    await ctx.answerCbQuery();
    // TODO: Implementar upgrade manual
    await ctx.reply(`⬆️ Upgrade solicitado para ${targetId}. Función en desarrollo.`);
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
  console.log('✅ Base de datos inicializada');
}

// Manejar errores
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Ha ocurrido un error. Por favor, intenta de nuevo más tarde.').catch(console.error);
});

// Iniciar
init().then(() => {
  bot.launch();
  console.log('🤖 Bot iniciado');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot };
