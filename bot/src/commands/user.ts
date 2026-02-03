import { Context } from 'telegraf';
import { User, Creation } from '../types';
import { config } from '../config';
import * as db from '../services/database';
import { walletService } from '../services/wallet';
import { generationService } from '../services/generation';

// Verificar límites del usuario
async function checkLimits(user: User): Promise<{ allowed: boolean; reason?: string }> {
  // Verificar tier PRO
  if (user.tier === 'pro') {
    return { allowed: true };
  }
  
  // Verificar creaciones totales
  const creations = await db.getCreationsByUser(user.id);
  if (creations.length >= config.freeTierLimits.maxCreations) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${config.freeTierLimits.maxCreations} apps gratuitas. Usa /pro para activar PRO o /delete para liberar espacio.`
    };
  }
  
  // Verificar generaciones diarias
  if (user.dailyGenerations >= config.freeTierLimits.dailyGenerations) {
    return {
      allowed: false,
      reason: `Límite de ${config.freeTierLimits.dailyGenerations} generaciones diarias alcanzado. Vuelve mañana o activa PRO con /pro.`
    };
  }
  
  // Verificar cooldown
  if (user.lastGenerationAt) {
    const lastGen = new Date(user.lastGenerationAt).getTime();
    const now = Date.now();
    const cooldownMs = config.freeTierLimits.cooldownMinutes * 60 * 1000;
    
    if (now - lastGen < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - (now - lastGen)) / 60000);
      return {
        allowed: false,
        reason: `Espera ${remaining} minutos entre creaciones o activa PRO.`
      };
    }
  }
  
  return { allowed: true };
}

// Comando /start
export async function handleStart(ctx: Context, user: User) {
  const welcomeText = `👋 ¡Bienvenido a AgentzFactory!

Soy tu constructor de apps vía Telegram.

🚀 CÓMO FUNCIONA:
1. Describes la app que quieres con /new
2. Genero el código automáticamente  
3. Te doy un link para verla
4. (Opcional) Activa PRO con /pro

⚡ STACK FIJO:
• React + Vite + Tailwind v3 + TypeScript
• Tema oscuro por defecto
• Responsive (mobile-first)

🎯 EJEMPLOS DE LO QUE PUEDO CREAR:
• Landing pages
• Portfolios
• Dashboards simples
• Tiendas (frontend)
• Galerías
• Formularios

📚 COMANDOS:
/new - Crear nueva app
/apps - Ver mis apps  
/pro - Activar PRO
/status - Mi estado y límites
/help - Ayuda completa

¿Empezamos? Usa /new`;

  await ctx.reply(welcomeText);
}

// Comando /new
export async function handleNew(ctx: Context, user: User) {
  const limitCheck = await checkLimits(user);
  
  if (!limitCheck.allowed) {
    return ctx.reply(`⛔ ${limitCheck.reason}`);
  }
  
  // Iniciar conversación de creación
  await ctx.reply(
    `🆕 NUEVA CREACIÓN\n\n` +
    `Describe la aplicación que quieres construir.\n\n` +
    `Ejemplos:\n` +
    `• "Landing page para mi agencia de diseño con hero, servicios y contacto"\n` +
    `• "Portfolio de fotografía con galería masonry"\n` +
    `• "Dashboard para tracking de hábitos con gráficos"\n\n` +
    `📝 Tu descripción (sé específico):`,
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: 'Ej: Landing page para consultora legal...'
      }
    }
  );
  
  // Guardar estado de espera de descripción
  // Esto se manejaría con sesiones en producción
}

// Procesar descripción de creación
export async function processCreation(ctx: Context, user: User, description: string) {
  // Validar descripción
  if (description.length < 10) {
    return ctx.reply('❌ Descripción muy corta. Sé más específico (mínimo 10 caracteres).');
  }
  
  if (description.length > 1000) {
    return ctx.reply('❌ Descripción muy larga. Máximo 1000 caracteres.');
  }
  
  // Mensaje de espera
  const waitMsg = await ctx.reply('🔄 Analizando y generando tu app...\n⏱️ Esto toma ~30-60 segundos.');
  
  try {
    // Crear registro en DB
    const name = description.split(' ').slice(0, 5).join(' ') + '...';
    const creation = await db.createCreation(user.id, name, description, description);
    
    // Generar código
    const result = await generationService.generateApp({
      userId: user.id,
      prompt: description,
      creationId: creation.id
    });
    
    // Incrementar contador de generaciones
    await db.incrementDailyGenerations(user.id);
    
    if (!result.success || result.status === 'error') {
      await ctx.deleteMessage(waitMsg.message_id);
      return ctx.reply(`❌ Error generando app: ${result.error}`);
    }
    
    // TODO: Deploy a Cloudflare Pages
    // Por ahora simulamos
    const frontendUrl = `https://agentzfactory.com/creations/${creation.id}`;
    
    await db.updateCreationStatus(creation.id, 'deployed', frontendUrl);
    
    await ctx.deleteMessage(waitMsg.message_id);
    
    if (result.status === 'partial') {
      await ctx.reply(
        `⏹️ GENERACIÓN PARCIAL\n\n` +
        `Tu app excedió el límite gratuito.\n` +
        `Se generaron ${result.componentCount} componentes.\n\n` +
        `✅ Ver preview: ${frontendUrl}\n\n` +
        `💎 Para completar todos los componentes y activar backend:\n` +
        `Usa /pro`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '👀 Ver Preview', url: frontendUrl }],
              [{ text: '💎 Activar PRO', callback_data: `pro:${creation.id}` }]
            ]
          }
        }
      );
    } else {
      await ctx.reply(
        `✅ ¡APP CREADA!\n\n` +
        `🔗 ${frontendUrl}\n\n` +
        `📊 Stats:\n` +
        `• Componentes: ${result.componentCount}\n` +
        `• Tokens usados: ${result.tokenCount}\n\n` +
        `💎 Para añadir backend real:\n` +
        `Usa /pro`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Ver App', url: frontendUrl }],
              [{ text: '💎 Activar PRO', callback_data: `pro:${creation.id}` }]
            ]
          }
        }
      );
    }
    
  } catch (error) {
    console.error('Error en processCreation:', error);
    await ctx.deleteMessage(waitMsg.message_id);
    await ctx.reply('❌ Error inesperado. Intenta de nuevo más tarde.');
  }
}

// Comando /apps
export async function handleApps(ctx: Context, user: User) {
  const creations = await db.getCreationsByUser(user.id);
  
  if (creations.length === 0) {
    return ctx.reply(
      '📱 No tienes apps creadas aún.\n\n' +
      'Crea tu primera con /new'
    );
  }
  
  let message = `📱 TUS APPS (${creations.length}/${config.freeTierLimits.maxCreations})\n\n`;
  
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
      message += `   💎 /pro para activar\n`;
    }
    message += '\n';
  }
  
  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '➕ Crear Nueva', callback_data: 'new' }]
      ]
    }
  });
}

// Comando /status
export async function handleStatus(ctx: Context, user: User) {
  const creations = await db.getCreationsByUser(user.id);
  const payments = await db.getPaymentsByUser(user.id);
  
  const status = user.tier === 'pro' ? '💎 PRO' : '🆓 Gratuito';
  const appsCount = creations.length;
  const proApps = creations.filter(c => c.phase === 'pro').length;
  
  let message = `📊 TU ESTADO\n\n`;
  message += `👤 ${user.firstName || user.username || 'Usuario'}\n`;
  message += `🎚️ ${status}\n\n`;
  
  message += `📱 Apps: ${appsCount}/${config.freeTierLimits.maxCreations}\n`;
  message += `   ✅ PRO: ${proApps}\n`;
  message += `   🆓 Gratuitas: ${appsCount - proApps}\n\n`;
  
  if (user.tier === 'free') {
    message += `⚡ Límites (24h):\n`;
    message += `   • Creaciones: ${user.dailyGenerations}/${config.freeTierLimits.dailyGenerations}\n`;
    message += `   • Tokens max: ${config.freeTierLimits.maxTokens}\n`;
    message += `   • Componentes max: ${config.freeTierLimits.maxComponents}\n\n`;
  }
  
  if (payments.length > 0) {
    const pending = payments.filter(p => p.status === 'pending').length;
    if (pending > 0) {
      message += `💳 Pagos pendientes: ${pending}\n`;
    }
  }
  
  message += `\n💎 PRO incluye:\n`;
  message += `• Sin límites\n`;
  message += `• Backend real (Supabase)\n`;
  message += `• Base de datos PostgreSQL\n`;
  message += `• Precio: ${config.proTierPrice} ${config.proToken}\n`;
  
  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💎 Activar PRO', callback_data: 'pro' }],
        [{ text: '📱 Ver Mis Apps', callback_data: 'apps' }]
      ]
    }
  });
}

// Comando /pro
export async function handlePro(ctx: Context, user: User, creationId?: string) {
  // Verificar si usuario tiene wallet
  let wallet = await db.getWalletByUser(user.id);
  
  if (!wallet) {
    // Generar wallet para el usuario
    const walletData = await walletService.generateWallet(user.id);
    wallet = await db.createWallet(
      user.id,
      walletData.address,
      walletData.encryptedPrivateKey,
      walletData.publicKey
    );
  }
  
  // Obtener creaciones pendientes de activar PRO
  const creations = await db.getCreationsByUser(user.id);
  const pendingCreations = creations.filter(c => c.phase === 'frontend' && c.status === 'deployed');
  
  if (pendingCreations.length === 0) {
    return ctx.reply(
      '💎 ACTIVAR PRO\n\n' +
      'No tienes apps pendientes de activación.\n' +
      'Crea una app con /new primero.'
    );
  }
  
  // Si se especificó una creación específica
  if (creationId) {
    const creation = await db.getCreationById(creationId);
    if (!creation || creation.userId !== user.id) {
      return ctx.reply('❌ App no encontrada.');
    }
    
    // Crear registro de pago
    const payment = await db.createPayment(user.id, wallet.address, config.proTierPrice, creationId);
    
    return ctx.reply(
      `💎 ACTIVAR PRO: ${creation.name}\n\n` +
      `Deposita EXACTAMENTE ${config.proTierPrice} ${config.proToken} a:\n\n` +
      `\`${wallet.address}\`\n\n` +
      `⚠️ IMPORTANTE:\n` +
      `• Usa la red Starknet Mainnet\n` +
      `• Token: STRK (0x0471...733e)\n` +
      `• Monto exacto: ${config.proTierPrice}\n` +
      `• ⏱️ Válido por 24 horas\n\n` +
      `Una vez detectado el pago, tu app se activará automáticamente.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 Copiar Dirección', callback_data: `copy:${wallet.address}` }],
            [{ text: '🔍 Ver en Starkscan', url: `https://starkscan.co/contract/${wallet.address}` }]
          ]
        }
      }
    );
  }
  
  // Si tiene múltiples, mostrar selector
  if (pendingCreations.length === 1) {
    // Solo tiene una, ir directo
    return handlePro(ctx, user, pendingCreations[0].id);
  }
  
  const buttons = pendingCreations.map(c => ([{
    text: c.name,
    callback_data: `pro:${c.id}`
  }]));
  
  await ctx.reply(
    '💎 Selecciona la app a activar:\n\n' +
    `Tu dirección de pago: ${wallet.address}`,
    {
      reply_markup: { inline_keyboard: buttons }
    }
  );
}

// Comando /help
export async function handleHelp(ctx: Context) {
  await ctx.reply(
    `❓ AYUDA - AgentzFactory\n\n` +
    `🚀 COMENZAR:\n` +
    `/new - Crear nueva app\n` +
    `/apps - Ver tus apps\n` +
    `/status - Tu estado y límites\n\n` +
    `💎 PRO:\n` +
    `/pro - Activar funcionalidad completa\n` +
    `Precio: ${config.proTierPrice} ${config.proToken}\n\n` +
    `⚙️ GESTIÓN:\n` +
    `/delete - Eliminar app\n` +
    `/cancel - Cancelar operación\n\n` +
    `📝 CONSEJOS:\n` +
    `• Sé específico en tu descripción\n` +
    `• Ejemplo bueno: "Landing page azul marina para consultora legal con formulario de contacto"\n` +
    `• Ejemplo malo: "Una página web"\n\n` +
    `📊 LÍMITES GRATUITOS:\n` +
    `• ${config.freeTierLimits.maxCreations} apps máximo\n` +
    `• ${config.freeTierLimits.maxTokens} tokens por generación\n` +
    `• ${config.freeTierLimits.maxComponents} componentes máximo\n` +
    `• ${config.freeTierLimits.cooldownMinutes} min entre creaciones`
  );
}
