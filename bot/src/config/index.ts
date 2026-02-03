import dotenv from 'dotenv';
import { BotConfig } from './types';

dotenv.config();

export const config: BotConfig = {
  botToken: process.env.BOT_TOKEN || '',
  // Tu Telegram ID como dueño (reemplazar con tu ID real)
  ownerTelegramId: process.env.OWNER_TELEGRAM_ID || '6180369194',
  
  freeTierLimits: {
    maxCreations: 3,
    maxTokens: 4000,
    maxComponents: 8,
    dailyGenerations: 3,
    cooldownMinutes: 5
  },
  
  proTierPrice: '0.05',
  proToken: 'STRK',
  
  starknet: {
    network: (process.env.STARKNET_NETWORK as 'mainnet' | 'testnet') || 'mainnet',
    strkTokenAddress: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858cbbd19733e'
  }
};

export const STRK_TOKEN_ADDRESS = config.starknet.strkTokenAddress;
