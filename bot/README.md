# AgentzFactory Bot

Bot de Telegram para generación de aplicaciones web con AI.

## Características

- 🤖 **Generación de apps** via descripción en lenguaje natural
- 💎 **Sistema PRO** con pagos en Starknet (STRK)
- 🎨 **Stack fijo:** React + Vite + Tailwind v3 + TypeScript
- 🔐 **Seguridad:** Anti-prompt injection, validación de código
- 📊 **Panel admin** para el dueño

## Comandos de Usuario

| Comando | Descripción |
|---------|-------------|
| `/start` | Bienvenida y guía |
| `/new` | Crear nueva app |
| `/apps` | Ver mis apps |
| `/pro` | Activar PRO |
| `/status` | Estado y límites |
| `/help` | Ayuda completa |
| `/cancel` | Cancelar operación |

## Comandos de Admin (Dueño)

| Comando | Descripción |
|---------|-------------|
| `/admin stats` | Estadísticas globales |
| `/admin users` | Lista usuarios |
| `/admin user @user` | Detalles de usuario |
| `/admin delete @user` | Eliminar usuario |
| `/admin broadcast msg` | Mensaje a todos |
| `/admin maintenance on/off` | Modo mantenimiento |
| `/admin funds` | Ver fondos en wallets |

## Setup

### 1. Instalar dependencias

```bash
cd bot
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores
```

### 3. Iniciar bot

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

### 4. Configurar cron job (monitoreo de pagos)

```bash
# Agregar a crontab (cada 2 minutos)
*/2 * * * * cd /path/to/bot && npm run cron
```

## Variables de Entorno

```env
BOT_TOKEN=tu_token_de_botfather
OWNER_TELEGRAM_ID=tu_id_de_telegram
OPENAI_API_KEY=tu_key_de_openai
ENCRYPTION_KEY=clave_32_caracteres_para_aes
STARKNET_NETWORK=mainnet
```

## Estructura

```
bot/
├── src/
│   ├── commands/      # Comandos de usuario y admin
│   ├── services/      # Database, Wallet, Starknet, Generation
│   ├── utils/         # Crypto, helpers
│   ├── types/         # TypeScript interfaces
│   └── config/        # Configuración
├── scripts/           # Cron jobs
└── data/             # SQLite database
```

## Flujo de Pago Starknet

1. Usuario ejecuta `/pro`
2. Bot genera wallet única para ese usuario
3. Usuario deposita 100 STRK a la dirección
4. Cron job detecta el pago cada 2 minutos
5. Al confirmar, se activa PRO automáticamente

## Límites Gratuitos

- 3 apps máximo
- 3 generaciones por día
- 5 minutos de cooldown entre apps
- 4000 tokens máximo por generación
- 8 componentes máximo

## Stack de Generación

Siempre se genera:
- React 18+ con TypeScript
- Vite como build tool
- Tailwind CSS v3
- Tema oscuro por defecto
- Responsive (mobile-first)
- Componente BrandBadge incluido
