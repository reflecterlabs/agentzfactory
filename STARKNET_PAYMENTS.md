# ⚡ Starknet + Typhoon Integration - AgentzFactory

## Overview

Usamos `typhoon-starknet-account` para:
1. Crear la **cuenta maestra** del bot en Starknet
2. Generar **sub-direcciones** por cada usuario/creación
3. Monitorear depósitos para activación PRO

## Ventajas de Starknet

- **Fees ultra-bajos:** ~$0.001 por transacción
- **Seguridad post-cuántica:** STARK proofs (hash-based, resistente a quantum)
- **Velocidad:** Finalidad en segundos
- **Privacidad:** Via Typhoon (zk-mixer)

---

## Setup Inicial (Cuenta Maestra del Bot)

### Paso 1: Verificar si existe cuenta
```bash
node ~/.openclaw/workspace/skills/typhoon-starknet-account/scripts/check-account.js
```

### Paso 2: Si no existe, crear via Typhoon

**Instrucciones para nosotros (developers):**

1. Ir a https://www.typhoon-finance.com/app
2. Depositar STRK (recomendado: 50-100 STRK para operaciones del bot)
3. Descargar el "note" (archivo JSON con secret, nullifier, txHash)
4. Ejecutar:
```bash
node ~/.openclaw/workspace/skills/typhoon-starknet-account/scripts/create-account.js '<paste note JSON>'
```

**Output esperado:**
```json
{
  "accountAddress": "0x123...",
  "deployed": true,
  "balance": "100 STRK"
}
```

---

## Sistema de Pagos para Usuarios

### Opción A: Direcciones Derivadas (Recomendada)

Cada usuario/creación tiene una dirección única derivada de la cuenta maestra:

```typescript
// Sistema de tracking por índice
interface UserPayment {
  userId: string;           // Telegram ID
  creationId: string;       // UUID de la creación
  index: number;            // Índice derivado
  expectedAmount: string;   // "0.05" (en STRK)
  status: 'pending' | 'paid' | 'expired';
  createdAt: Date;
  expiresAt: Date;          // 24 horas
}

// El usuario deposita a esta dirección:
// = cuenta_maestra + índice (similar a HD wallets)
// O usamos un sistema de "payment IDs" en el memo
```

**Para el usuario:**
```
[Bot] 💎 ACTIVAR PRO

Deposita EXACTAMENTE 100 STRK a:

📍 0x742d35Cc6634C0532925a3b8D4e6D3b6e8d3e8B9

⚠️ IMPORTANTE:
• Monto exacto: 100 STRK
• En el campo "Memo" incluye: AGENTZ-abc123
• Red: Starknet Mainnet

⏱️ Válido por: 24 horas

[Ver en Voyager] [Copiar Address]
```

### Paso 2: Monitoreo de Depósitos

```bash
# Verificar balance de la cuenta maestra
node ~/.openclaw/workspace/skills/typhoon-starknet-account/scripts/call-contract.js '{
  "contractAddress": "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858cbbd19733e",
  "method": "balanceOf",
  "args": ["0x...cuenta_maestra..."]
}'

# Para STRK token específicamente
```

**Automatización (Node.js):**
```typescript
import { Provider } from 'starknet';

const STRK_TOKEN = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858cbbd19733e';

async function checkPayment(paymentId: string, expectedAmount: string) {
  // Query blockchain por transferencias a cuenta maestra
  // con memo que coincida con paymentId
  
  const provider = new Provider({ sequencer: { network: 'mainnet' } });
  
  // Buscar eventos Transfer del token STRK
  const events = await provider.getEvents({
    from_block: { block_number: lastCheckedBlock },
    to_block: 'latest',
    address: STRK_TOKEN,
    keys: [hash.getSelectorFromName('Transfer')],
  });
  
  // Filtrar por destinatario = cuenta_maestra
  // y memo = paymentId
  
  return {
    detected: true,
    amount: '0.05',
    txHash: '0x...',
    confirmations: 5
  };
}
```

---

## Flujo Completo de Pago

```
Usuario: /pro
  ↓
Bot: Muestra dirección + paymentId único
  ↓
Usuario: Deposita 100 STRK a dirección del bot
         (con memo AGENTZ-{creationId})
  ↓
Cron (cada 2 min): Revisa blockchain
  ↓
Pago detectado: 
  • Monto correcto: 100 STRK
  • Memo válido: AGENTZ-abc123
  • Confirmaciones: >3
  ↓
Bot:
  • Activa PRO en base de datos
  • Migra datos mock a Supabase
  • Notifica usuario
  ↓
Usuario: Recibe URL PRO activada
```

---

## Estructura de Datos

```typescript
// Tabla: payments
interface Payment {
  id: string;              // AGENTZ-{creationId}
  userId: string;          // Telegram ID
  creationId: string;      // UUID
  
  // Dirección
  toAddress: string;       // Cuenta maestra del bot
  expectedAmount: string;  // "0.05"
  token: string;           // "STRK"
  
  // Estado
  status: 'pending' | 'detected' | 'confirmed' | 'expired' | 'failed';
  
  // Si se detecta
  detectedAmount?: string;
  txHash?: string;
  blockNumber?: number;
  detectedAt?: Date;
  confirmedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date;         // createdAt + 24h
}
```

---

## Scripts de Monitoreo

### `check-payments.js`
```bash
node scripts/check-payments.js
```

Verifica todos los pagos pendientes y actualiza estado.

### `cron-payments.sh`
```bash
#!/bin/bash
# Ejecutar cada 2 minutos

while true; do
  node scripts/check-payments.js
  sleep 120
done
```

---

## Gestión de Errores

### Pago incorrecto
```
[Usuario] Deposita 0.03 STRK (en vez de 0.05)

[Bot] ⚠️ PAGO INCOMPLETO

Detectado: 0.03 STRK
Requerido: 100 STRK
Faltante: 0.02 STRK

Deposita el monto faltante a la misma dirección.

[Ver Transacción]
```

### Pago con memo incorrecto
```
[Bot] ⚠️ PAGO SIN IDENTIFICAR

Detectamos un depósito de 100 STRK
pero sin memo de identificación.

Para vincularlo a tu app, responde con:
"/link 0x...tx_hash..."

[Ver Transacción]
```

### Expiración
```
[Bot] ⏱️ PAGO EXPIRADO

El tiempo límite (24h) ha pasado.

Tu dirección de pago ya no es válida.
Genera una nueva con /pro
```

---

## Costos de Operación

| Acción | Costo Starknet |
|--------|----------------|
| Verificar balance | ~0 (view call) |
| Detectar eventos | ~0 (query) |
| Ejecutar activación | ~0.0001 STRK |

**Presupuesto mensual estimado:**
- 100 activaciones PRO: ~0.01 STRK ($0.02)
- Queries de monitoreo: ~0 STRK
- **Total:** Prácticamente gratis

---

## Backup y Seguridad

### Cuenta Maestra
- **Private key:** Almacenada en AWS Secrets Manager / HashiCorp Vault
- **Backup:** Multi-sig con 2-of-3
- **Límite de retiro:** Máximo 500 STRK por día

### Rotación de Claves
Si se compromete la cuenta maestra:
1. Crear nueva cuenta via Typhoon
2. Migrar fondos
3. Actualizar dirección en config
4. Notificar a todos los usuarios con pagos pendientes

---

## Integración con Supabase (PRO Activation)

```typescript
// Al detectar pago confirmado:
async function activatePro(creationId: string) {
  // 1. Crear proyecto Supabase
  const project = await supabaseManagement.createProject({
    name: `agentz-${creationId}`,
    region: 'us-east-1'
  });
  
  // 2. Migrar schema
  await migrateMockToReal(project.id, creationId);
  
  // 3. Actualizar metadata
  await db.update('creations', creationId, {
    phase: 'pro',
    pro: {
      activatedAt: new Date(),
      supabaseProject: project.id,
      backendUrl: project.url
    }
  });
  
  // 4. Notificar usuario
  await telegram.sendMessage(userId, `
    ✅ PRO ACTIVADO!
    
    Tu app ahora tiene backend real.
    URL: ${project.url}
  `);
}
```

---

## Próximos Pasos

1. **Setup cuenta maestra:**
   ```bash
   # Depositar STRK en Typhoon
   # Crear cuenta con el note
   node skills/typhoon-starknet-account/scripts/create-account.js '<note>'
   ```

2. **Implementar monitoreo:**
   - Script `check-payments.js`
   - Cron job cada 2 minutos

3. **Testing:**
   - Pago completo correcto
   - Pago incompleto
   - Pago sin memo
   - Expiración

4. **Documentación usuario:**
   - Guía "Cómo comprar STRK"
   - Video tutorial deposito
   - FAQ pagos

---

## Recursos

- **Typhoon:** https://www.typhoon-finance.com/app
- **Starknet Voyager:** https://voyager.online
- **Starkscan:** https://starkscan.co
- **STRK Token:** 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858cbbd19733e
