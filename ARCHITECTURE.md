# 🏗️ Arquitectura AgentzFactory - Especificación Técnica

## FASE 1: Frontend Only (MVP)

### Principio Base
**"Todo lo que pida el usuario, pero solo frontend"**

El usuario puede describir CUALQUIER tipo de aplicación (red social, marketplace, dashboard, etc.), pero el sistema:
1. Genera SOLO la capa de presentación (React + Tailwind)
2. Usa datos de prueba/mock estáticos
3. Sin funcionalidad backend real
4. Sin autenticación real
5. Sin base de datos

### Estructura de Creaciones

```
/creations/
└── {creationID}/                    # UUID único por creación
    ├── index.html                   # Entry point
    ├── assets/
    │   ├── index-{hash}.js
    │   └── index-{hash}.css
    ├── static/                      # Assets estáticos
    │   └── mock-data.json          # Datos de prueba
    └── manifest.json               # Metadata
```

### Ejemplos de Transformación

| Solicitud Usuario | Lo que se genera (Fase 1) |
|-------------------|---------------------------|
| "Facebook con feed de posts" | UI de feed con posts mock estáticos, sin backend real |
| "WhatsApp para chat" | UI de chat con conversaciones de ejemplo, sin WebSocket |
| "Netflix para videos" | Grid de videos con thumbnails, reproductor mock |
| "Uber para viajes" | Mapa estático con pins de ejemplo, sin GPS real |
| "Tienda con carrito" | UI de carrito, checkout visual, sin procesamiento de pago |

### Datos Mock Automáticos

Cada app incluye automáticamente:
```typescript
// static/mock-data.json
{
  "users": [{"id": 1, "name": "Demo User", "avatar": "..."}],
  "posts": [...],      // Para redes sociales
  "products": [...],   // Para e-commerce
  "messages": [...],   // Para chat apps
  "orders": [...]      // Para dashboards
}
```

---

## FASE 2: Activación PRO (Con Backend)

### Trigger de Activación

```
Usuario solicita app
        ↓
Se genera frontend (Fase 1) - GRATIS
        ↓
Bot muestra: "¿Quieres funcionalidad completa?"
        ↓
Usuario deposita {amount} en wallet {address}
        ↓
Sistema detecta pago en blockchain
        ↓
Se activa FASE 2:
  - Se crea proyecto Supabase
  - Se migran datos mock a PostgreSQL
  - Se generan Edge Functions
  - Se conecta auth real
  - Se re-deploya con funcionalidad completa
```

### Wallet por Usuario

Cada usuario tiene una wallet única generada por el bot:

```typescript
interface UserWallet {
  userId: string;
  address: string;           // 0x...
  privateKey: encrypted;     // Almacenado seguro
  creationId: string;        // Link a la creación
  status: 'pending' | 'paid' | 'activated';
  amountRequired: number;    // Ej: 100 STRK
  currency: 'ETH' | 'USDT' | 'USDC';
}
```

### Flujo de Pago

```
Usuario escribe: "Quiero mi app PRO"
        ↓
Bot genera wallet única para ese usuario/creación
        ↓
Bot responde:
  "Deposita 100 STRK en:
   0x742d35Cc6634C0532925a3b8D4e6D3b6e8d3e8B9
   
   Tiempo límite: 24 horas"
        ↓
Sistema monitorea la wallet
        ↓
Pago detectado → Activación automática (2-5 min)
```

---

## Seguridad y Control

### Validación de Código (Independientemente de la fase)

Siempre se valida:
1. **No código malicioso** (eval, document.write, etc.)
2. **Estructura React válida** (export default, JSX correcto)
3. **Responsive obligatorio** (sm:, md:, lg:)
4. **Marca incluida** (BrandBadge no removable)

### Rate Limiting

```typescript
// Por usuario (Telegram ID)
- Máximo 3 creaciones gratis por día
- Máximo 1 activación PRO por hora
- Cooldown de 5 minutos entre creaciones
```

---

## Estructura de Datos

### Creación (Creation)

```typescript
interface Creation {
  id: string;                    // UUID
  userId: string;                // Telegram ID
  userWallet: string;            // Dirección del usuario (si existe)
  
  prompt: string;                // Input original del usuario
  promptSanitized: string;       // Limpio de injection
  
  phase: 'frontend' | 'pro';     // Fase actual
  status: 'generating' | 'deployed' | 'activating' | 'active';
  
  frontend: {
    deployedAt: Date;
    url: string;                 // https://agentzfactory.com/creations/{id}
    files: File[];
  };
  
  pro?: {                        // Solo si se activa
    walletAddress: string;
    paymentTx: string;
    supabaseProject: string;
    activatedAt: Date;
    backendUrl: string;
  };
  
  createdAt: Date;
  expiresAt?: Date;              // 7 días para frontend gratis
}
```

---

## UX del Bot

### Flujo Completo

```
[Usuario] "Quiero un Instagram para fotos de gatos"

[Bot] 🔄 Generando frontend...

[Bot - 30s después] ✅ Frontend listo
        
        🌐 Ver: https://agentzfactory.com/creations/abc-123
        
        ⚠️ VERSIÓN DEMO:
        - Posts son estáticos (no se guardan)
        - Likes son visuales (no persisten)
        - Sin autenticación real
        
        💎 ACTIVAR PRO (100 STRK):
        • Base de datos real para posts
        • Autenticación de usuarios
        • Upload de imágenes
        • Feed en tiempo real
        
        [Activar PRO] [Ver Código]

[Usuario] clickea "Activar PRO"

[Bot] 💳 Deposita 100 STRK en:
      
      0xABC123... (wallet única)
      
      ⏱️ Válido por 24 horas
      
      Una vez detectado el pago, tu app
      se activará automáticamente.

[Usuario deposita]

[Sistema detecta] → [Activa PRO automáticamente]

[Bot] ✅ ¡PRO ACTIVADO!

      Tu app ahora tiene:
      • Base de datos PostgreSQL
      • Auth con email/social
      • Storage para imágenes
      • API en tiempo real
      
      🔗 Nueva URL: https://abc-123.pro.agentzfactory.com
      📊 Admin: https://supabase.com/dashboard/...
      
      Puedes administrar tu app desde
      el panel de Supabase.
```

---

## Próximos Pasos

1. **Implementar wallet generation** (Ethers.js)
2. **Crear monitor de blockchain** (Alchemy/Web3.js)
3. **Automatizar Supabase provisioning** (Management API)
4. **Crear migrador de mock→real** (Script de transformación)
5. **Testing de flujo completo**

---

*Documento vivo - Actualizar según implementación*
