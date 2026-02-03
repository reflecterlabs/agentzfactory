import { Context } from 'telegraf';
import { User, Creation } from '../types';
import { config } from '../config';
import { t } from '../i18n';
import * as db from '../services/database';
import { walletService } from '../services/wallet';
import { generationService } from '../services/generation';

// Verificar límites del usuario
async function checkLimits(user: User): Promise<{ allowed: boolean; reason?: string }> {
  const lang = user.language || 'en';
  
  if (user.tier === 'pro') {
    return { allowed: true };
  }
  
  const creations = await db.getCreationsByUser(user.id);
  if (creations.length >= config.freeTierLimits.maxCreations) {
    return {
      allowed: false,
      reason: t('limitReached', lang, 
        `Max ${config.freeTierLimits.maxCreations} free apps reached. Use /pro to upgrade or /delete to free space.`)
    };
  }
  
  if (user.dailyGenerations >= config.freeTierLimits.dailyGenerations) {
    return {
      allowed: false,
      reason: t('limitReached', lang,
        `Daily limit of ${config.freeTierLimits.dailyGenerations} generations reached. Come back tomorrow or use /pro.`)
    };
  }
  
  if (user.lastGenerationAt) {
    const lastGen = new Date(user.lastGenerationAt).getTime();
    const now = Date.now();
    const cooldownMs = config.freeTierLimits.cooldownMinutes * 60 * 1000;
    
    if (now - lastGen < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - (now - lastGen)) / 60000);
      return {
        allowed: false,
        reason: t('limitReached', lang,
          `Wait ${remaining} minutes between creations or upgrade to PRO.`)
      };
    }
  }
  
  return { allowed: true };
}

// Comando /start
export async function handleStart(ctx: Context, user: User) {
  const lang = user.language || 'en';
  await ctx.reply(t('welcome', lang));
}

// Comando /new
export async function handleNew(ctx: Context, user: User) {
  const lang = user.language || 'en';
  const limitCheck = await checkLimits(user);
  
  if (!limitCheck.allowed) {
    return ctx.reply(t('limitReached', lang, limitCheck.reason || 'Limit reached'));
  }
  
  await ctx.reply(t('newCreation', lang), {
    reply_markup: {
      force_reply: true,
      input_field_placeholder: 'e.g., Landing page for legal firm with contact form...'
    }
  });
}

// Procesar descripción de creación
export async function processCreation(ctx: Context, user: User, description: string) {
  const lang = user.language || 'en';
  
  if (description.length < 10) {
    return ctx.reply('❌ Description too short. Be more specific (min 10 characters).');
  }
  
  if (description.length > 1000) {
    return ctx.reply('❌ Description too long. Maximum 1000 characters.');
  }
  
  const waitMsg = await ctx.reply(t('creating', lang));
  
  try {
    const name = description.split(' ').slice(0, 5).join(' ') + '...';
    const creation = await db.createCreation(user.id, name, description, description);
    
    const result = await generationService.generateApp({
      userId: user.id,
      prompt: description,
      creationId: creation.id
    });
    
    await db.incrementDailyGenerations(user.id);
    
    if (!result.success || result.status === 'error') {
      await ctx.deleteMessage(waitMsg.message_id);
      return ctx.reply(t('errorCreating', lang, result.error || 'Unknown error'));
    }
    
    const frontendUrl = `https://agentzfactory.com/creations/${creation.id}`;
    await db.updateCreationStatus(creation.id, 'deployed', frontendUrl);
    
    await ctx.deleteMessage(waitMsg.message_id);
    
    if (result.status === 'partial') {
      await ctx.reply(
        t('partialGeneration', lang, frontendUrl, result.componentCount),
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: t('btnView', lang), url: frontendUrl }],
              [{ text: t('btnActivatePro', lang), callback_data: `pro:${creation.id}` }]
            ]
          }
        }
      );
    } else {
      await ctx.reply(
        t('appCreated', lang, frontendUrl, result.componentCount, result.tokenCount),
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: t('btnView', lang), url: frontendUrl }],
              [{ text: t('btnActivatePro', lang), callback_data: `pro:${creation.id}` }]
            ]
          }
        }
      );
    }
    
  } catch (error) {
    console.error('Error in processCreation:', error);
    await ctx.deleteMessage(waitMsg.message_id);
    await ctx.reply(t('errorGeneric', lang));
  }
}

// Comando /apps
export async function handleApps(ctx: Context, user: User) {
  const lang = user.language || 'en';
  const creations = await db.getCreationsByUser(user.id);
  
  if (creations.length === 0) {
    return ctx.reply(t('noApps', lang));
  }
  
  let message = t('yourApps', lang, creations.length, config.freeTierLimits.maxCreations);
  
  for (let i = 0; i < creations.length; i++) {
    const app = creations[i];
    const status = app.phase === 'pro' ? '✅ PRO' : (app.status === 'deployed' ? '🟢' : '🟡');
    const date = new Date(app.createdAt).toLocaleDateString();
    
    message += `${i + 1}. ${status} ${app.name}\n`;
    message += `   📅 ${date}\n`;
    if (app.frontendUrl) {
      message += `   🔗 ${app.frontendUrl}\n`;
    }
    if (app.phase === 'frontend' && app.status === 'deployed') {
      message += `   💎 /pro\n`;
    }
    message += '\n';
  }
  
  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: t('btnCreateNew', lang), callback_data: 'new' }]
      ]
    }
  });
}

// Comando /status
export async function handleStatus(ctx: Context, user: User) {
  const lang = user.language || 'en';
  const creations = await db.getCreationsByUser(user.id);
  
  const tier = user.tier === 'pro' ? '💎 PRO' : '🆓 Free';
  
  const message = t('status', lang, tier, creations.length, config.freeTierLimits.maxCreations,
    user.dailyGenerations, config.freeTierLimits.dailyGenerations);
  
  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: t('btnActivatePro', lang), callback_data: 'pro' }],
        [{ text: '📱 ' + (lang === 'es' ? 'Mis Apps' : 'My Apps'), callback_data: 'apps' }]
      ]
    }
  });
}

// Comando /pro
export async function handlePro(ctx: Context, user: User, creationId?: string) {
  const lang = user.language || 'en';
  
  let wallet = await db.getWalletByUser(user.id);
  
  if (!wallet) {
    const walletData = await walletService.generateWallet(user.id);
    wallet = await db.createWallet(
      user.id,
      walletData.address,
      walletData.encryptedPrivateKey,
      walletData.publicKey
    );
  }
  
  const creations = await db.getCreationsByUser(user.id);
  const pendingCreations = creations.filter(c => c.phase === 'frontend' && c.status === 'deployed');
  
  if (pendingCreations.length === 0) {
    return ctx.reply(lang === 'es' 
      ? '💎 No tienes apps pendientes. Crea una con /new primero.'
      : '💎 No pending apps. Create one with /new first.');
  }
  
  if (creationId) {
    const creation = await db.getCreationById(creationId);
    if (!creation || creation.userId !== user.id) {
      return ctx.reply('❌ App not found.');
    }
    
    await db.createPayment(user.id, wallet.address, config.proTierPrice, creationId);
    
    return ctx.reply(
      t('activatePro', lang, creation.name, wallet.address, config.proTierPrice),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: t('btnCopyAddress', lang), callback_data: `copy:${wallet.address}` }],
            [{ text: t('btnViewExplorer', lang), url: `https://starkscan.co/contract/${wallet.address}` }]
          ]
        }
      }
    );
  }
  
  if (pendingCreations.length === 1) {
    return handlePro(ctx, user, pendingCreations[0].id);
  }
  
  const buttons = pendingCreations.map(c => ([{
    text: c.name,
    callback_data: `pro:${c.id}`
  }]));
  
  await ctx.reply(t('selectAppToActivate', lang), {
    reply_markup: { inline_keyboard: buttons }
  });
}

// Comando /help
export async function handleHelp(ctx: Context, user: User) {
  const lang = user.language || 'en';
  await ctx.reply(t('help', lang, config.freeTierLimits.maxCreations, 
    config.freeTierLimits.maxTokens, config.freeTierLimits.maxComponents, 
    config.freeTierLimits.cooldownMinutes));
}
