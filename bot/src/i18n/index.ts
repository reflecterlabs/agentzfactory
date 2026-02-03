import { Language } from '../types';

export const translations = {
  en: {
    welcome: `👋 Welcome to AgentzFactory!\n\nI'm your web app builder via Telegram.\n\n🚀 HOW IT WORKS:\n1. Describe your app with /new\n2. I generate the code automatically\n3. You get a link to view it\n4. (Optional) Upgrade to PRO with /pro\n\n⚡ FIXED STACK:\n• React + Vite + Tailwind v3 + TypeScript\n• Dark theme by default\n• Responsive (mobile-first)\n\n🎯 EXAMPLES:\n• "Landing page for my design agency"\n• "Photography portfolio with gallery"\n• "Dashboard for habit tracking"\n\n📚 COMMANDS:\n/new - Create new app\n/apps - View my apps\n/pro - Upgrade to PRO\n/status - My status and limits\n/help - Full help\n\nReady? Use /new`,
    
    chooseLanguage: `🌍 Choose your language:\n\n🇺🇸 English - /lang_en\n🇪🇸 Español - /lang_es\n🇫🇷 Français - /lang_fr\n🇩🇪 Deutsch - /lang_de\n🇵🇹 Português - /lang_pt\n🇨🇳 中文 - /lang_zh\n🇯🇵 日本語 - /lang_ja`,
    
    languageSet: (lang: string) => `✅ Language set to: ${lang}`,
    
    newCreation: `🆕 NEW CREATION\n\nDescribe the application you want to build.\n\nExamples:\n• "Landing page for my design agency with hero, services, and contact"\n• "Photography portfolio with masonry gallery"\n• "Dashboard for habit tracking with charts"\n\n📝 Your description (be specific):`,
    
    creating: `🔄 Analyzing and generating your app...\n⏱️ This takes ~30-60 seconds.`,
    
    appCreated: (url: string, components: number, tokens: number) => `✅ APP CREATED!\n\n🔗 ${url}\n\n📊 Stats:\n• Components: ${components}\n• Tokens used: ${tokens}\n\n💎 To add real backend: Use /pro`,
    
    partialGeneration: (url: string, components: number) => `⏹️ PARTIAL GENERATION\n\nYour app exceeded the free limit. ${components} components generated.\n\n✅ Preview: ${url}\n\n💎 To complete all components: Use /pro`,
    
    errorCreating: (err: string) => `❌ Error: ${err}`,
    
    noApps: `📱 You don't have any apps yet. Create your first with /new`,
    
    yourApps: (count: number, max: number) => `📱 YOUR APPS (${count}/${max})\n\n`,
    
    status: (tier: string, count: number, max: number, daily: number, dailyMax: number) => `📊 YOUR STATUS\n\n👤 User\n🎚️ Tier: ${tier}\n📱 Apps: ${count}/${max}\n⚡ Daily: ${daily}/${dailyMax}\n\n💎 PRO includes:\n• No limits\n• Real backend (Supabase)\n• PostgreSQL database`,
    
    activatePro: (name: string, address: string, amount: string) => 
      `💎 ACTIVATE PRO: ${name}\n\n` +
      `Deposit EXACTLY ${amount} STRK to:\n\n` +
      `${address}\n\n` +
      `⚠️ IMPORTANT:\n` +
      `• Network: Starknet Mainnet\n` +
      `• Token: STRK\n` +
      `• Exact amount: ${amount}\n` +
      `• ⏱️ Valid for 24 hours\n\n` +
      `Once detected, your app will activate automatically.`,
    
    limitReached: (reason: string) => `⛔ ${reason}`,
    
    help: (maxCreations: number, maxTokens: number, maxComponents: number, cooldown: number) => `❓ HELP\n\n🚀 START:\n/new - Create app\n/apps - View apps\n/status - Status & limits\n\n💎 PRO:\n/pro - Activate PRO\nPrice: 100 STRK\n\n⚙️ MANAGE:\n/delete - Delete app\n/cancel - Cancel\n\n📝 TIPS:\n• Be specific in descriptions\n• Good: "Blue landing page for legal firm with contact form"\n• Bad: "A website"\n\n📊 FREE LIMITS:\n• ${maxCreations} apps max\n• ${maxTokens} tokens per gen\n• ${maxComponents} components max\n• ${cooldown}min between creations`,
    
    cancelled: `❌ Cancelled. What's next?\n/new - Create app | /help - Help`,
    
    maintenance: `🔧 Bot under maintenance. Try again later.`,
    
    btnView: `🌐 View`,
    btnActivatePro: `💎 Activate PRO`,
    btnCreateNew: `➕ Create New`,
    btnCopyAddress: `📋 Copy Address`,
    btnViewExplorer: `🔍 View on Explorer`,
    
    paymentReceived: (creationId: string) => `✅ PAYMENT RECEIVED!\n\nPRO activated for your app.\nYour app now has real backend functionality.`,
    
    selectAppToActivate: `💎 Select app to activate:`,
  },
  
  es: {
    welcome: `👋 ¡Bienvenido a AgentzFactory!\n\nSoy tu constructor de apps vía Telegram.\n\n🚀 CÓMO FUNCIONA:\n1. Describe tu app con /new\n2. Genero el código automáticamente\n3. Recibes un link para verla\n4. (Opcional) Activa PRO con /pro\n\n⚡ STACK FIJO:\n• React + Vite + Tailwind v3 + TypeScript\n• Tema oscuro por defecto\n• Responsive (mobile-first)\n\n🎯 EJEMPLOS:\n• "Landing page para mi agencia de diseño"\n• "Portfolio de fotografía con galería"\n• "Dashboard para tracking de hábitos"\n\n📚 COMANDOS:\n/new - Crear app\n/apps - Ver apps\n/pro - Activar PRO\n/status - Estado y límites\n/help - Ayuda completa\n\n¿Empezamos? Usa /new`,
    
    chooseLanguage: `🌍 Elige tu idioma:\n\n🇺🇸 English - /lang_en\n🇪🇸 Español - /lang_es\n🇫🇷 Français - /lang_fr\n🇩🇪 Deutsch - /lang_de\n🇵🇹 Português - /lang_pt\n🇨🇳 中文 - /lang_zh\n🇯🇵 日本語 - /lang_ja`,
    
    languageSet: (lang: string) => `✅ Idioma configurado: ${lang}`,
    
    newCreation: `🆕 NUEVA CREACIÓN\n\nDescribe la aplicación que quieres construir.\n\nEjemplos:\n• "Landing page para mi agencia de diseño con hero, servicios y contacto"\n• "Portfolio de fotografía con galería masonry"\n• "Dashboard para tracking de hábitos con gráficos"\n\n📝 Tu descripción (sé específico):`,
    
    creating: `🔄 Analizando y generando tu app...\n⏱️ Toma ~30-60 segundos.`,
    
    appCreated: (url: string, components: number, tokens: number) => `✅ ¡APP CREADA!\n\n🔗 ${url}\n\n📊 Stats:\n• Componentes: ${components}\n• Tokens usados: ${tokens}\n\n💎 Para añadir backend real: Usa /pro`,
    
    partialGeneration: (url: string, components: number) => `⏹️ GENERACIÓN PARCIAL\n\nTu app excedió el límite gratuito. ${components} componentes generados.\n\n✅ Preview: ${url}\n\n💎 Para completar todos los componentes: Usa /pro`,
    
    errorCreating: (err: string) => `❌ Error: ${err}`,
    
    noApps: `📱 No tienes apps aún. Crea tu primera con /new`,
    
    yourApps: (count: number, max: number) => `📱 TUS APPS (${count}/${max})\n\n`,
    
    status: (tier: string, count: number, max: number, daily: number, dailyMax: number) => `📊 TU ESTADO\n\n👤 Usuario\n🎚️ Tier: ${tier}\n📱 Apps: ${count}/${max}\n⚡ Diario: ${daily}/${dailyMax}\n\n💎 PRO incluye:\n• Sin límites\n• Backend real (Supabase)\n• Base de datos PostgreSQL`,
    
    activatePro: (name: string, address: string, amount: string) => 
      `💎 ACTIVAR PRO: ${name}\n\n` +
      `Deposita EXACTAMENTE ${amount} STRK a:\n\n` +
      `${address}\n\n` +
      `⚠️ IMPORTANTE:\n` +
      `• Red: Starknet Mainnet\n` +
      `• Token: STRK\n` +
      `• Monto exacto: ${amount}\n` +
      `• ⏱️ Válido 24 horas\n\n` +
      `Una vez detectado, tu app se activará automáticamente.`,
    
    limitReached: (reason: string) => `⛔ ${reason}`,
    
    help: (maxCreations: number, maxTokens: number, maxComponents: number, cooldown: number) => `❓ AYUDA\n\n🚀 COMENZAR:\n/new - Crear app\n/apps - Ver apps\n/status - Estado y límites\n\n💎 PRO:\n/pro - Activar PRO\nPrecio: 100 STRK\n\n⚙️ GESTIÓN:\n/delete - Eliminar app\n/cancel - Cancelar\n\n📝 CONSEJOS:\n• Sé específico en descripciones\n• Bueno: "Landing azul para firma legal con formulario"\n• Malo: "Una página web"\n\n📊 LÍMITES GRATIS:\n• ${maxCreations} apps máx\n• ${maxTokens} tokens por gen\n• ${maxComponents} componentes máx\n• ${cooldown}min entre creaciones`,
    
    cancelled: `❌ Cancelado. ¿Qué sigue?\n/new - Crear app | /help - Ayuda`,
    
    maintenance: `🔧 Bot en mantenimiento. Intenta más tarde.`,
    
    btnView: `🌐 Ver`,
    btnActivatePro: `💎 Activar PRO`,
    btnCreateNew: `➕ Crear Nueva`,
    btnCopyAddress: `📋 Copiar Dirección`,
    btnViewExplorer: `🔍 Ver en Explorer`,
    
    paymentReceived: (creationId: string) => `✅ ¡PAGO RECIBIDO!\n\nPRO activado para tu app.\nTu app ahora tiene backend real.`,
    
    selectAppToActivate: `💎 Selecciona app a activar:`,
  }
};

export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang: Language = 'en', ...args: any[]): string {
  const trans = (translations as any)[lang]?.[key] || (translations as any).en[key];
  
  if (typeof trans === 'function') {
    return trans(...args);
  }
  
  return trans || key;
}
