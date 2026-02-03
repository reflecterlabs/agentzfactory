# 🔐 Generación Local de Wallets Starknet

## Arquitectura: Una Dirección por Usuario/Creación

```
BOT (Cuenta Maestra)
    ├── Controla operaciones generales
    └── Puede consolidar fondos si es necesario

USUARIO 1 + CREACIÓN A
    ├── Dirección: 0xabc... (generada localmente)
    ├── Private Key: [encriptada en DB]
    └── Estado: Monitoreando...

USUARIO 1 + CREACIÓN B
    ├── Dirección: 0xdef... (generada localmente)
    ├── Private Key: [encriptada en DB]
    └── Estado: Monitoreando...

USUARIO 2 + CREACIÓN C
    ├── Dirección: 0xghi... (generada localmente)
    └── ...
```

## Implementación

### 1. Generador de Wallets

```typescript
// wallet-generator.ts
import { ec, stark, hash, CallData, num } from 'starknet';
import { encrypt } from './crypto'; // AES-256 encryption

interface GeneratedWallet {
  address: string;
  privateKey: string;
  publicKey: string;
  encryptedPrivateKey: string;
  creationId: string;
  userId: string;
  createdAt: Date;
}

class StarknetWalletGenerator {
  /**
   * Genera una wallet única para un usuario/creación específica
   * La dirección puede recibir STRK sin necesidad de deploy previo
   */
  async generateWallet(userId: string, creationId: string): Promise<GeneratedWallet> {
    // Generar private key aleatoria criptográficamente segura
    const privateKey = stark.randomAddress();
    
    // Calcular public key
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    
    // Calcular dirección del contrato de account (Argent X style)
    // Esto es la dirección que el usuario verá y usará para depositar
    const address = this.calculateAccountAddress(publicKey);
    
    // Encriptar private key para almacenamiento seguro
    const encryptedPrivateKey = await encrypt(privateKey);
    
    return {
      address,
      privateKey, // Solo en memoria, no guardar en DB
      publicKey,
      encryptedPrivateKey, // Guardar esto en DB
      creationId,
      userId,
      createdAt: new Date()
    };
  }

  /**
   * Calcula la dirección del contrato de account
   * Usa la clase de account de Argent X (más común)
   */
  private calculateAccountAddress(publicKey: string): string {
    // Class hash del account de Argent X (open source)
    const ARGENT_CLASS_HASH = '0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044d6eaa';
    
    // Constructor calldata para Argent X account
    const constructorCalldata = CallData.compile({
      owner: publicKey,
      guardian: 0 // Sin guardian para simplificar
    });
    
    // Calcular dirección: hash de class_hash + salt + constructor_calldata
    const address = hash.calculateContractAddressFromHash(
      publicKey, // salt
      ARGENT_CLASS_HASH,
      constructorCalldata,
      0 // deployer address (0 para undepolyed)
    );
    
    return address;
  }

  /**
   * Recupera la private key desde almacenamiento encriptado
   */
  async decryptPrivateKey(encryptedPrivateKey: string): Promise<string> {
    return await decrypt(encryptedPrivateKey);
  }
}

export const walletGenerator = new StarknetWalletGenerator();
```

### 2. Monitoreo de Múltiples Direcciones

```typescript
// multi-address-monitor.ts
import { Provider, Contract } from 'starknet';

const STRK_TOKEN = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858cbbd19733e';

interface PaymentAddress {
  id: string;
  address: string;
  userId: string;
  creationId: string;
  expectedAmount: string; // "0.05"
  status: 'pending' | 'received' | 'confirmed';
  createdAt: Date;
  expiresAt: Date;
}

class MultiAddressMonitor {
  private provider: Provider;
  private strkContract: Contract;

  constructor() {
    this.provider = new Provider({
      sequencer: { baseUrl: 'https://alpha-mainnet.starknet.io' }
    });
    
    this.strkContract = new Contract(
      ERC20_ABI,
      STRK_TOKEN,
      this.provider
    );
  }

  /**
   * Verifica el balance de una dirección específica
   */
  async checkAddressBalance(address: string): Promise<bigint> {
    try {
      const balance = await this.strkContract.balanceOf(address);
      return BigInt(balance.toString());
    } catch (error) {
      console.error(`Error checking balance for ${address}:`, error);
      return 0n;
    }
  }

  /**
   * Escanea todas las direcciones pendientes
   */
  async scanPendingAddresses(addresses: PaymentAddress[]): Promise<PaymentAddress[]> {
    const detected: PaymentAddress[] = [];

    for (const payment of addresses) {
      if (payment.status !== 'pending') continue;

      const balance = await this.checkAddressBalance(payment.address);
      const expectedWei = BigInt(parseFloat(payment.expectedAmount) * 1e18);

      // Si el balance es mayor o igual al esperado
      if (balance >= expectedWei) {
        detected.push({
          ...payment,
          status: 'received'
        });
      }
    }

    return detected;
  }

  /**
   * Obtiene historial de transferencias a una dirección
   */
  async getTransferHistory(address: string, fromBlock: number): Promise<any[]> {
    const events = await this.provider.getEvents({
      address: STRK_TOKEN,
      from_block: { block_number: fromBlock },
      to_block: 'latest',
      keys: [hash.getSelectorFromName('Transfer')],
    });

    // Filtrar solo transferencias a nuestra dirección
    return (events.events || []).filter(event => {
      const to = event.data?.[1]; // índice 1 es 'to' en Transfer
      return to === address;
    });
  }
}

export const monitor = new MultiAddressMonitor();
```

### 3. Servicio de Pagos Completo

```typescript
// payment-service.ts
import { walletGenerator } from './wallet-generator';
import { monitor } from './multi-address-monitor';
import { db } from './database'; // Tu DB

interface CreatePaymentRequest {
  userId: string;
  creationId: string;
  amount: string; // "0.05"
}

interface PaymentResponse {
  id: string;
  address: string;
  amount: string;
  expiresAt: Date;
  status: string;
}

class PaymentService {
  /**
   * Crea una solicitud de pago: genera wallet + guarda en DB
   */
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    // Generar wallet única
    const wallet = await walletGenerator.generateWallet(
      request.userId,
      request.creationId
    );

    // Guardar en DB (sin private key en texto plano)
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await db.payments.create({
      id: paymentId,
      userId: request.userId,
      creationId: request.creationId,
      address: wallet.address,
      encryptedPrivateKey: wallet.encryptedPrivateKey,
      expectedAmount: request.amount,
      status: 'pending',
      createdAt: new Date(),
      expiresAt
    });

    return {
      id: paymentId,
      address: wallet.address,
      amount: request.amount,
      expiresAt,
      status: 'pending'
    };
  }

  /**
   * Verifica pagos pendientes y activa los completados
   */
  async processPendingPayments(): Promise<void> {
    // Obtener todos los pagos pendientes no expirados
    const pending = await db.payments.findMany({
      where: {
        status: 'pending',
        expiresAt: { gt: new Date() }
      }
    });

    if (pending.length === 0) return;

    // Verificar balances
    const received = await monitor.scanPendingAddresses(pending);

    for (const payment of received) {
      // Actualizar estado
      await db.payments.update(payment.id, {
        status: 'confirmed',
        receivedAt: new Date()
      });

      // Activar PRO para la creación
      await this.activatePro(payment.creationId);

      // Notificar usuario
      await this.notifyUser(payment.userId, payment.creationId);
    }
  }

  private async activatePro(creationId: string): Promise<void> {
    // Lógica de activación PRO
    console.log(`Activando PRO para ${creationId}`);
    // TODO: Migrar a Supabase, etc.
  }

  private async notifyUser(userId: string, creationId: string): Promise<void> {
    // Enviar mensaje por Telegram
    console.log(`Notificando a ${userId}`);
  }
}

export const paymentService = new PaymentService();
```

### 4. API del Bot (Telegram)

```typescript
// bot-commands.ts
import { Telegraf } from 'telegraf';
import { paymentService } from './payment-service';

const bot = new Telegraf(process.env.BOT_TOKEN!);

// Comando /pro
bot.command('pro', async (ctx) => {
  const userId = ctx.from.id.toString();
  
  // Obtener creaciones del usuario
  const creations = await db.creations.findMany({
    where: { userId, phase: 'frontend' }
  });

  if (creations.length === 0) {
    return ctx.reply('❌ No tienes apps pendientes de activación. Crea una con /new');
  }

  if (creations.length === 1) {
    // Si solo tiene una, proponer directamente
    const creation = creations[0];
    
    // Crear solicitud de pago
    const payment = await paymentService.createPayment({
      userId,
      creationId: creation.id,
      amount: '0.05'
    });

    return ctx.reply(
      `💎 ACTIVAR PRO: ${creation.name}\n\n` +
      `Deposita EXACTAMENTE 100 STRK a:\n` +
      `\`${payment.address}\`\n\n` +
      `⏱️ Válido por 24 horas\n` +
      `✅ Una vez detectado el pago, tu app se activará automáticamente.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 Copiar Dirección', callback_data: `copy:${payment.address}` }],
            [{ text: '🔍 Ver en Starkscan', url: `https://starkscan.co/contract/${payment.address}` }]
          ]
        }
      }
    );
  }

  // Si tiene varias, mostrar selector
  const buttons = creations.map(c => ([{
    text: c.name,
    callback_data: `activate:${c.id}`
  }]));

  return ctx.reply(
    '💎 Selecciona la app a activar:',
    { reply_markup: { inline_keyboard: buttons } }
  );
});

// Handler para selección
bot.action(/activate:(.+)/, async (ctx) => {
  const creationId = ctx.match![1];
  const userId = ctx.from!.id.toString();

  const payment = await paymentService.createPayment({
    userId,
    creationId,
    amount: '0.05'
  });

  await ctx.editMessageText(
    `💎 ACTIVAR PRO\n\n` +
    `Deposita EXACTAMENTE 100 STRK a:\n` +
    `\`${payment.address}\`\n\n` +
    `⏱️ Válido por 24 horas`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Copiar', callback_data: `copy:${payment.address}` }],
          [{ text: '🔍 Starkscan', url: `https://starkscan.co/contract/${payment.address}` }]
        ]
      }
    }
  );
});

export { bot };
```

### 5. Cron Job de Monitoreo

```typescript
// cron-monitor.ts
import { paymentService } from './payment-service';

// Ejecutar cada 2 minutos
async function runMonitor() {
  console.log(`[${new Date().toISOString()}] Escaneando pagos...`);
  
  try {
    await paymentService.processPendingPayments();
    console.log('✅ Escaneo completado');
  } catch (error) {
    console.error('❌ Error en escaneo:', error);
  }
}

// Si ejecutamos directamente
if (require.main === module) {
  runMonitor();
}

export { runMonitor };
```

**crontab:**
```bash
# Ejecutar cada 2 minutos
*/2 * * * * cd /path/to/agentzfactory && npx ts-node scripts/cron-monitor.ts >> logs/cron.log 2>&1
```

---

## Seguridad

### Encriptación de Private Keys

```typescript
// crypto.ts
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes hex
const IV_LENGTH = 16;

export async function encrypt(text: string): Promise<string> {
  const iv = randomBytes(IV_LENGTH);
  const key = await scryptAsync(ENCRYPTION_KEY, 'salt', 32) as Buffer;
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export async function decrypt(encryptedData: string): Promise<string> {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = await scryptAsync(ENCRYPTION_KEY, 'salt', 32) as Buffer;
  
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Variables de Entorno Requeridas

```bash
# .env
BOT_TOKEN=your_telegram_bot_token
ENCRYPTION_KEY=32-byte-hex-key-for-aes256
STARKNET_NETWORK=mainnet
DATABASE_URL=your_postgres_url
```

---

## Flujo Completo

```
Usuario: /pro
    ↓
Bot: Genera wallet localmente (address: 0xabc...)
Bot: Guarda en DB (address + encrypted private key)
Bot: Muestra al usuario:
     "Deposita 100 STRK a: 0xabc..."
     "Válido 24 horas"
    ↓
Cron (cada 2 min):
    Para cada dirección pendiente:
        - Query balanceOf(STRK, address)
        - Si balance >= 100 STRK:
            * Marcar como 'confirmed'
            * Activar PRO
            * Notificar usuario
    ↓
Usuario: Deposita 100 STRK a 0xabc...
    ↓
Cron detecta (próxima ejecución):
    Balance detectado: 100 STRK
    → Activando PRO...
    → Notificación enviada
    ↓
Usuario recibe:
    "✅ ¡Pago recibido! Tu app PRO está activada.
     URL: https://..."
```

---

## Costos

| Concepto | Costo |
|----------|-------|
| Generar wallet | $0 (local) |
| Monitorear balance | $0 (view call) |
| Recibir STRK | $0 (para el receptor) |
| Consolidar fondos (opcional) | ~$0.001 STRK |

**Nota:** Las direcciones generadas son "calculated addresses" - no necesitan deploy para recibir tokens ERC20. Los tokens se almacenan en el contrato del token, no en la cuenta del usuario.

---

## Instalación

```bash
npm install starknet telegraf @types/node
npm install -D typescript ts-node
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```
