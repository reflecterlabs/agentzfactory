# 🚀 Starknet Mainnet Setup - AgentzFactory

## Opción Recomendada: Wallet Argent X

### Paso 1: Crear Wallet

1. Ir a https://www.argent.xyz/
2. Descargar extensión (Chrome/Firefox) o app móvil
3. Crear nueva wallet
4. **Guardar la seed phrase en un lugar seguro**
5. Ir a Settings → Security & Privacy → Export Private Key
6. Copiar la private key (empieza con 0x...)

### Paso 2: Configurar en el Bot

```bash
# Crear archivo de configuración
mkdir -p ~/.openclaw/workspace/agentzfactory-web/config
cat > ~/.openclaw/workspace/agentzfactory-web/config/starknet.json << 'EOF'
{
  "network": "mainnet",
  "accountAddress": "0x...tu_direccion...",
  "privateKey": "${STARKNET_PRIVATE_KEY}",
  "tokenAddress": "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858cbbd19733e"
}
EOF

# Setear la private key como variable de entorno (nunca en git)
export STARKNET_PRIVATE_KEY="0x...tu_private_key..."
```

### Paso 3: Obtener STRK para operar

**Opciones:**

#### A) Comprar en exchange (Binance, Coinbase, OKX)
- Comprar STRK
- Retirar a tu dirección Argent X
- Costo: Exchange fee + ~$0.001 network fee

#### B) Bridge desde Ethereum
- Si tienes ETH en mainnet
- Usar https://starkgate.starknet.io
- Costo: Gas ETH (~$5-20) + bridge fee

#### C) On-ramp directo en Argent
- App de Argent tiene on-ramp integrado
- Comprar con tarjeta/directamente

**Cantidad recomendada:** 10-50 STRK (~$3-15 USD)
- Para fees de deploy (si es necesario)
- Para operaciones de monitoreo

---

## Estructura de Cuenta

```
TU CUENTA (Argent X)
    │
    ├── Recibe pagos de usuarios (100 STRK cada uno)
    ├── Usada para verificar balances (view calls - gratis)
    └── Opcional: Distribuir fondos a wallet fría

USUARIO 1
    └── Deposita 100 STRK + memo "AGENTZ-abc123"

USUARIO 2
    └── Deposita 100 STRK + memo "AGENTZ-def456"
```

---

## Código de Monitoreo

```typescript
// monitor.ts
import { Provider, Contract, Account } from 'starknet';
import * as dotenv from 'dotenv';

dotenv.config();

const STRK_TOKEN = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858cbbd19733e';
const ERC20_ABI = [
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [{ "name": "account", "type": "felt" }],
    "outputs": [{ "name": "balance", "type": "Uint256" }],
    "stateMutability": "view"
  },
  {
    "name": "Transfer",
    "type": "event",
    "keys": [],
    "outputs": [
      { "name": "from", "type": "felt" },
      { "name": "to", "type": "felt" },
      { "name": "value", "type": "Uint256" }
    ]
  }
];

interface Payment {
  id: string;
  userId: string;
  creationId: string;
  expectedAmount: string;
  status: 'pending' | 'detected' | 'confirmed';
}

class StarknetPaymentMonitor {
  private provider: Provider;
  private strkContract: Contract;
  private botAddress: string;
  private lastCheckedBlock: number;

  constructor(botAddress: string) {
    this.provider = new Provider({
      sequencer: {
        baseUrl: 'https://alpha-mainnet.starknet.io'
      }
    });
    
    this.strkContract = new Contract(
      ERC20_ABI as any,
      STRK_TOKEN,
      this.provider
    );
    
    this.botAddress = botAddress;
    this.lastCheckedBlock = 0;
  }

  async checkBalance(): Promise<string> {
    const balance = await this.strkContract.balanceOf(this.botAddress);
    return balance.toString();
  }

  async checkIncomingTransfers(pendingPayments: Payment[]): Promise<Payment[]> {
    // Obtener bloque actual
    const currentBlock = await this.provider.getBlock('latest');
    const blockNumber = currentBlock.block_number;
    
    if (this.lastCheckedBlock === 0) {
      this.lastCheckedBlock = blockNumber - 100; // Empezar 100 bloques atrás
    }

    // Obtener eventos Transfer al bot
    const events = await this.provider.getEvents({
      address: STRK_TOKEN,
      from_block: { block_number: this.lastCheckedBlock },
      to_block: { block_number },
      keys: [this.getEventKey('Transfer')],
    });

    const detectedPayments: Payment[] = [];

    for (const event of events.events || []) {
      const [from, to, amountLow, amountHigh] = event.data || [];
      
      // Verificar si es transferencia al bot
      if (to === this.botAddress) {
        const amount = this.parseUint256(amountLow, amountHigh);
        
        // Buscar en pagos pendientes
        for (const payment of pendingPayments) {
          const expectedAmountWei = BigInt(parseFloat(payment.expectedAmount) * 1e18);
          
          if (amount === expectedAmountWei && payment.status === 'pending') {
            // Verificar memo (data availability depende de cómo se envió)
            // Starknet no tiene memo nativo en ERC20, necesitamos otra estrategia
            
            detectedPayments.push({
              ...payment,
              status: 'detected',
              txHash: event.transaction_hash
            });
          }
        }
      }
    }

    this.lastCheckedBlock = blockNumber;
    return detectedPayments;
  }

  private getEventKey(eventName: string): string {
    // Calcular key del evento (keccak del nombre)
    // Simplificado - en producción usar starknet.js utils
    return '0x...';
  }

  private parseUint256(low: string, high: string): bigint {
    return (BigInt(high) << 128n) + BigInt(low);
  }
}

// Uso
async function main() {
  const monitor = new StarknetPaymentMonitor(process.env.BOT_ADDRESS!);
  
  // Verificar balance
  const balance = await monitor.checkBalance();
  console.log(`Balance bot: ${balance} STRK (wei)`);
  
  // Cargar pagos pendientes de DB
  const pendingPayments = await loadPendingPayments();
  
  // Verificar nuevos pagos
  const detected = await monitor.checkIncomingTransfers(pendingPayments);
  
  if (detected.length > 0) {
    console.log(`Detectados ${detected.length} pagos`);
    
    for (const payment of detected) {
      // Actualizar DB
      await markPaymentDetected(payment.id, payment.txHash!);
      
      // Notificar usuario
      await notifyUserPaymentDetected(payment.userId, payment.creationId);
    }
  }
}

main().catch(console.error);
```

---

## Estrategia para Memo/Payment ID

**Problema:** ERC20 en Starknet no tiene campo memo nativo.

**Soluciones:**

### Opción A: Montos Únicos (Recomendada)
Cada usuario deposita un monto ligeramente diferente:

```typescript
// Mapeo de montos a creaciones
const PAYMENT_AMOUNTS = {
  '100.000001': 'creation-abc123',
  '100.000002': 'creation-def456',
  '100.000003': 'creation-ghi789',
  // ... generar secuencialmente
};

// Para el usuario:
"Deposita EXACTAMENTE 100.000001 STRK"
"Deposita EXACTAMENTE 100.000002 STRK"
```

### Opción B: Multi-Call con Memo
El usuario hace un multicall:
1. Approve del token
2. Transfer
3. Llamada a contrato "registrar memo"

**Más complejo para el usuario**

### Opción C: Smart Contract Personalizado
Deployar contrato que acepta STRK + string memo:

```cairo
@external
func deposit_with_memo(memo: felt, amount: Uint256) {
    // Transferir STRK
    // Registrar memo -> cantidad
}
```

**Mejor UX pero requiere deploy**

---

## Setup Rápido

```bash
# 1. Instalar dependencias
cd ~/.openclaw/workspace/agentzfactory-web
npm install starknet dotenv

# 2. Crear .env
cat > .env << 'EOF'
STARKNET_BOT_ADDRESS=0x...
STARKNET_PRIVATE_KEY=0x...
STARKNET_NETWORK=mainnet
EOF

# 3. Testear conexión
npx ts-node scripts/test-starknet.ts
```

**test-starknet.ts:**
```typescript
import { Provider } from 'starknet';

async function test() {
  const provider = new Provider({
    sequencer: { baseUrl: 'https://alpha-mainnet.starknet.io' }
  });
  
  const block = await provider.getBlock('latest');
  console.log('✅ Conectado a Starknet Mainnet');
  console.log('Block:', block.block_number);
}

test();
```

---

## Checklist Pre-Producción

- [ ] Wallet Argent X creada y backup guardado
- [ ] Private key exportada y guardada segura
- [ ] Dirección configurada en variables de entorno
- [ ] Fondos STRK disponibles (10-50 STRK)
- [ ] Script de monitoreo probado
- [ ] Sistema de mapeo de montos funcionando
- [ ] Notificaciones de Telegram configuradas

---

## Costos Operativos Mainnet

| Acción | Costo aproximado |
|--------|------------------|
| View call (balanceOf) | $0 (gratis) |
| Query events | $0 (gratis) |
| Transfer (si el bot envía) | ~$0.001 STRK |
| Deploy cuenta (si es necesario) | ~$0.01-100 STRK |

**Presupuesto mensual estimado:** $1-5 USD en STRK

---

## Recursos

- **Argent X:** https://www.argent.xyz/
- **Starknet Explorer:** https://voyager.online
- **Starkscan:** https://starkscan.co
- **STRK Token Info:** https://starknet.io/strk-token
