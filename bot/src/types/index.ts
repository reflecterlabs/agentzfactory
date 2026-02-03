// types/index.ts

export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  createdAt: Date;
  tier: 'free' | 'pro';
  isAdmin: boolean;
  dailyGenerations: number;
  lastGenerationAt?: Date;
}

export interface Creation {
  id: string;
  userId: string;
  name: string;
  description: string;
  promptSanitized: string;
  phase: 'frontend' | 'pro';
  status: 'generating' | 'deployed' | 'error';
  frontendUrl?: string;
  proUrl?: string;
  components?: string[];
  tokenCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  encryptedPrivateKey: string;
  publicKey: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  creationId?: string;
  walletAddress: string;
  expectedAmount: string;
  status: 'pending' | 'received' | 'confirmed' | 'expired';
  txHash?: string;
  createdAt: Date;
  expiresAt: Date;
  receivedAt?: Date;
  confirmedAt?: Date;
}

export interface GenerationRequest {
  userId: string;
  prompt: string;
  creationId: string;
}

export interface GenerationResult {
  success: boolean;
  code?: string;
  error?: string;
  tokenCount: number;
  componentCount: number;
  status: 'complete' | 'partial' | 'error';
  partialCode?: string;
  lastComponent?: string;
}

export interface BotConfig {
  botToken: string;
  ownerTelegramId: string;
  freeTierLimits: {
    maxCreations: number;
    maxTokens: number;
    maxComponents: number;
    dailyGenerations: number;
    cooldownMinutes: number;
  };
  proTierPrice: string;
  proToken: string;
  starknet: {
    network: 'mainnet' | 'testnet';
    strkTokenAddress: string;
  };
}
