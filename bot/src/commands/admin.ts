import { Context } from 'telegraf';
import { User } from '../types';
import { config } from '../config';
import * as db from '../services/database';
import { starknetMonitor } from '../services/starknet';

// Verificar si es admin
function isAdmin(user: User): boolean {
  return user.telegramId === config.ownerTelegramId || user.isAdmin;
}

// Comando /admin stats
export async function handleAdminStats(ctx: Context, user: User) {
  if (!isAdmin(user)) {
    return ctx.reply('⛔ You do not have admin permissions.');
  }
  
  const stats = await db.getStats();
  
  const message = `📊 STATS GLOBALES\n\n` +
    `👥 Users: ${stats.users}\n` +
    `📱 Apps created: ${stats.creations}\n` +
    `💎 PRO activations: ${stats.payments}\n` +
    `💰 Total revenue: ${stats.totalRevenue} ${config.proToken}\n\n` +
    `🕐 Updated: ${new Date().toLocaleString()}`;
  
  await ctx.reply(message);
}

// Comando /admin users
export async function handleAdminUsers(ctx: Context, user: User) {
  if (!isAdmin(user)) {
    return ctx.reply('⛔ You do not have admin permissions.');
  }
  
  const users = await db.getAllUsers();
  const limit = 20; // Mostrar últimos 20
  const recentUsers = users.slice(0, limit);
  
  let message = `👥 USUARIOS (${users.length} total)\n\n`;
  
  for (const u of recentUsers) {
    const tier = u.tier === 'pro' ? '💎' : '🆓';
    const date = new Date(u.createdAt).toLocaleDateString();
    const username = u.username ? `@${u.username}` : u.firstName || 'Sin nombre';
    message += `${tier} ${username} (${u.telegramId})\n   📅 ${date} | Apps: ${u.dailyGenerations}\n`;
  }
  
  if (users.length > limit) {
    message += `\n... y ${users.length - limit} más`;
  }
  
  await ctx.reply(message);
}

// Comando /admin user @username o ID
export async function handleAdminUser(ctx: Context, user: User, targetId: string) {
  if (!isAdmin(user)) {
    return ctx.reply('⛔ You do not have admin permissions.');
  }
  
  if (!targetId) {
    return ctx.reply('Usage: /admin user <@username o telegramId>');
  }
  
  // Limpiar @ si existe
  const cleanId = targetId.replace('@', '');
  
  // Buscar por username o ID
  let targetUser: User | null = null;
  
  if (/^\d+$/.test(cleanId)) {
    // Es un ID numérico
    targetUser = await db.getUserByTelegramId(cleanId);
  } else {
    // Buscar por username en la lista
    const users = await db.getAllUsers();
    targetUser = users.find(u => u.username?.toLowerCase() === cleanId.toLowerCase()) || null;
  }
  
  if (!targetUser) {
    return ctx.reply(`❌ User not found: ${targetId}`);
  }
  
  const creations = await db.getCreationsByUser(targetUser.id);
  const payments = await db.getPaymentsByUser(targetUser.id);
  
  const message = `👤 USUARIO: ${targetUser.username || targetUser.firstName || 'Sin nombre'}\n` +
    `🆔 ID: ${targetUser.telegramId}\n` +
    `🎚️ Tier: ${targetUser.tier}\n` +
    `📅 Registered: ${new Date(targetUser.createdAt).toLocaleString()}\n\n` +
    `📱 Apps: ${creations.length}\n` +
    `💎 PRO: ${creations.filter(c => c.phase === 'pro').length}\n` +
    `💳 Payments: ${payments.filter(p => p.status === 'confirmed').length} confirmed\n\n` +
    `⚡ Daily limits: ${targetUser.dailyGenerations}/${config.freeTierLimits.dailyGenerations}`;
  
  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🗑️ Eliminar Usuario', callback_data: `admin_delete:${targetUser.telegramId}` }],
        [{ text: '⬆️ Upgrade a PRO', callback_data: `admin_upgrade:${targetUser.telegramId}` }]
      ]
    }
  });
}

// Comando /admin delete @username
export async function handleAdminDelete(ctx: Context, user: User, targetId: string) {
  if (!isAdmin(user)) {
    return ctx.reply('⛔ You do not have admin permissions.');
  }
  
  if (!targetId) {
    return ctx.reply('Usage: /admin delete <@username o telegramId>');
  }
  
  const cleanId = targetId.replace('@', '');
  
  // No permitir DELETEse a sí mismo
  if (cleanId === user.telegramId) {
    return ctx.reply('❌ No puedes DELETEte a ti mismo.');
  }
  
  await db.deleteUser(cleanId);
  
  await ctx.reply(`✅ Usuario ${targetId} eliminado.\nTodas sus apps y data has been deleted.`);
}

// Comando /admin broadcast mensaje
export async function handleAdminBroadcast(ctx: Context, user: User, message: string) {
  if (!isAdmin(user)) {
    return ctx.reply('⛔ You do not have admin permissions.');
  }
  
  if (!message || message.length < 5) {
    return ctx.reply('Usage: /admin broadcast <mensaje de al menos 5 caracteres>');
  }
  
  const users = await db.getAllUsers();
  let sent = 0;
  let failed = 0;
  
  await ctx.reply(`📢 Sending broadcast to ${users.length} users...`);
  
  for (const u of users) {
    try {
      await ctx.telegram.sendMessage(u.telegramId, 
        `📢 MENSAJE DEL ADMIN:\n\n${message}`
      );
      sent++;
    } catch (error) {
      failed++;
    }
  }
  
  await ctx.reply(`✅ Broadcast completed:\n• Sent: ${sent}\n• Failed: ${failed}`);
}

// Comando /admin maintenance on/off
let maintenanceMode = false;

export async function handleAdminMaintenance(ctx: Context, user: User, status?: string) {
  if (!isAdmin(user)) {
    return ctx.reply('⛔ You do not have admin permissions.');
  }
  
  if (!status || !['on', 'off'].includes(status.toLowerCase())) {
    return ctx.reply(
      `Usage: /admin maintenance <on|off>\n\n` +
      `Current status: ${maintenanceMode ? '🔧 ON' : '✅ OFF'}`
    );
  }
  
  maintenanceMode = status.toLowerCase() === 'on';
  
  await ctx.reply(
    `🔧 MAINTENANCE MODE: ${maintenanceMode ? 'ACTIVATED' : 'DESACTIVATED'}\n\n` +
    `${maintenanceMode ? 'Los users verán un maintenance message al usar el bot.' : 'The bot is working normally.'}`
  );
}

// Comando /admin funds
export async function handleAdminFunds(ctx: Context, user: User) {
  if (!isAdmin(user)) {
    return ctx.reply('⛔ You do not have admin permissions.');
  }
  
  // Obtener todas las wallets de users
  const users = await db.getAllUsers();
  const wallets = [];
  
  for (const u of users) {
    const wallet = await db.getWalletByUser(u.id);
    if (wallet) {
      wallets.push(wallet);
    }
  }
  
  await ctx.reply(`💰 WALLET FUNDS\n\nScanning ${wallets.length} addresses...\n(This may take a moment)`);
  
  let totalBalance = 0n;
  const withBalance = [];
  
  for (const wallet of wallets) {
    try {
      const balance = await starknetMonitor.checkBalance(wallet.address);
      if (balance > 0n) {
        totalBalance += balance;
        withBalance.push({ address: wallet.address, balance });
      }
      await new Promise(r => setTimeout(r, 100)); // Rate limiting
    } catch (e) {
      // Ignorar errores
    }
  }
  
  const strkBalance = Number(totalBalance) / 1e18;
  
  let message = `💰 FUNDS SUMMARY\n\n`;
  message += `Addresses with balance: ${withBalance.length}/${wallets.length}\n`;
  message += `Total balance: ${strkBalance.toFixed(4)} ${config.proToken}\n\n`;
  
  if (withBalance.length > 0) {
    message += `📍 Direcciones con fondos:\n`;
    for (const w of withBalance.slice(0, 10)) { // Mostrar máximo 10
      const bal = Number(w.balance) / 1e18;
      message += `${w.address.substring(0, 20)}...: ${bal.toFixed(4)}\n`;
    }
  }
  
  await ctx.reply(message);
}

// Comando /admin setlimit @username número
export async function handleAdminSetLimit(ctx: Context, user: User, targetId: string, limitStr: string) {
  if (!isAdmin(user)) {
    return ctx.reply('⛔ You do not have admin permissions.');
  }
  
  if (!targetId || !limitStr) {
    return ctx.reply('Usage: /admin setlimit <@username> <número_de_creaciones>');
  }
  
  // Esta función requeriría añadir un campo personalizado en la DB
  // Por ahora, es un placeholder
  await ctx.reply(`⚙️ Custom limits function in development.\nUsuario: ${targetId}\nRequested limit: ${limitStr}`);
}

// Obtener estado de mantenimiento
export function getMaintenanceMode(): boolean {
  return maintenanceMode;
}

// Comando /admin help
export async function handleAdminHelp(ctx: Context, user: User) {
  if (!isAdmin(user)) {
    return ctx.reply('⛔ You do not have admin permissions.');
  }
  
  await ctx.reply(
    `🔐 ADMIN COMMANDS\n\n` +
    `/admin stats - Global statistics\n` +
    `/admin users - User list\n` +
    `/admin user @usuario - Ver detalles de usuario\n` +
    `/admin delete @usuario - Delete user\n` +
    `/admin broadcast mensaje - Broadcast message\n` +
    `/admin maintenance on/off - Maintenance mode\n` +
    `/admin funds - View wallet funds\n` +
    `/admin setlimit @usuario N - Change limits\n\n` +
    `Tu ID: ${user.telegramId}\n` +
    `Owner ID: ${config.ownerTelegramId}`
  );
}
