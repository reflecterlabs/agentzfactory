import { Language } from '../types';

interface TranslationSet {
  welcome: string;
  languagePrompt: string;
  languageSelected: (lang: string) => string;
  newCreation: string;
  creating: string;
  creationSuccess: (url: string, components: number, tokens: number) => string;
  creationPartial: (url: string, components: number) => string;
  creationError: (error: string) => string;
  appsEmpty: string;
  appsListHeader: (count: number, max: number) => string;
  appItem: (index: number, status: string, name: string, date: string, url?: string) => string;
  statusHeader: string;
  statusTier: (tier: string) => string;
  statusApps: (count: number, max: number) => string;
  statusLimits: (daily: number, max: number) => string;
  statusCooldown: (minutes: number) => string;
  statusReady: string;
  proBenefits: string;
  proActivatePrompt: (address: string, amount: string) => string;
  proSuccess: string;
  limitReached: (reason: string) => string;
  helpText: (limits: any) => string;
  cancelMessage: string;
  errorGeneric: string;
  buttonView: string;
  buttonActivatePro: string;
  buttonCreateNew: string;
  buttonCopyAddress: string;
  buttonViewExplorer: string;
}

const en: TranslationSet = {
  welcome: `👋 Welcome to AgentzFactory!

I'm your web app builder via Telegram.

🚀 HOW IT WORKS:
1. Describe your app with /new
2. I generate the code automatically
3. You get a link to view it
4. (Optional) Upgrade to PRO with /pro

⚡ FIXED STACK:
• React + Vite + Tailwind v3 + TypeScript
• Dark theme by default
• Responsive (mobile-first)

🎯 EXAMPLES:
• "Landing page for my design agency"
• "Photography portfolio with gallery"
• "Dashboard for habit tracking"

📚 COMMANDS:
/new - Create new app
/apps - View my apps
/pro - Upgrade to PRO
/status - My status and limits
/help - Full help

Ready? Use /new`,

  languagePrompt: `🌍 Choose your language:\n\n🇺🇸 English - /lang_en\n🇪🇸 Español - /lang_es\n🇫🇷 Français - /lang_fr\n🇩🇪 Deutsch - /lang_de\n🇵🇹 Português - /lang_pt`,

  languageSelected: (lang: string) => `✅ Language set to ${lang}`,

  newCreation: `🆕 NEW CREATION

Describe the application you want to build.

Examples:
• "Landing page for my design agency with hero, services, and contact"
• "Photography portfolio with masonry gallery"
• "Dashboard for habit tracking with charts"

📝 Your description (be specific):`,

  creating: `🔄 Analyzing and generating your app...\n⏱️ This takes ~30-60 seconds.`,

  creationSuccess: (url: string, components: number, tokens: number) => 
    `✅ APP CREATED!\n\n` +
    `🔗 ${url}\n\n` +
    `📊 Stats:\n` +
    `• Components: ${components}\n` +
    `• Tokens used: ${tokens}\n\n` +
    `💎 To add real backend:\n` +
    `Use /pro`,

  creationPartial: (url: string, components: number) => 
    `⏹️ PARTIAL GENERATION\n\n` +
    `Your app exceeded the free limit.\n` +
    `${components} components generated.\n\n` +
    `✅ Preview: ${url}\n\n` +
    `💎 To complete all components and activate backend:\n` +
    `Use /pro`,

  creationError: (error: string) => `❌ Error generating app: ${error}`,

  appsEmpty: `📱 You don't have any apps yet.\n\nCreate your first one with /new`,

  appsListHeader: (count: number, max: number) => `📱 YOUR APPS (${count}/${max})\n\n`,

  appItem: (index: number, status: string, name: string, date: string, url?: string) => {
    let item = `${index}. ${status} ${name}\n`;
    item += `   📅 ${date}\n`;
    if (url) item += `   🔗 ${url}\n`;
    return item;
  },

  statusHeader: `📊 YOUR STATUS\n\n`,
  statusTier: (tier: string) => `🎚️ Tier: ${tier}\n`,
  statusApps: (count: number, max: number) => `📱 Apps: ${count}/${max}\n`,
  statusLimits: (daily: number, max: number) => `⚡ Daily generations: ${daily}/${max}\n`,
  statusCooldown: (minutes: number) => `⏱️ Cooldown: ${minutes} minutes\n`,
  statusReady: `✅ Ready to create`,

  proBenefits: `💎 PRO includes:\n• No limits\n• Real backend (Supabase)\n• PostgreSQL database\n• File storage\n`,

  proActivatePrompt: (address: string, amount: string) => 
    `💎 ACTIVATE PRO\n\n` +
    `Deposit EXACTLY ${amount} STRK to:\n\n` +
    `
