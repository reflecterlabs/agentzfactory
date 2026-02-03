# 🤖 Comandos de Telegram - AgentzFactory Bot

## Comandos de Usuario

### `/new` o `/create`
**Descripción:** Inicia la creación de una nueva aplicación

**Flujo:**
```
[Usuario] /new

[Bot] 🆕 NUEVA CREACIÓN

Describe la aplicación que quieres construir.

Ejemplos:
• "Landing page para mi agencia de diseño"
• "Portfolio de fotografía con galería"
• "Dashboard para tracking de hábitos"
• "Tienda de ropa con carrito"

📝 Tu descripción:
```

**Validación:**
- Si el usuario tiene 3+ creaciones activas: "Límite de 3 apps gratuitas. Borra una o activa PRO"
- Si está en cooldown (última creación < 5 min): "Espera X minutos entre creaciones"

---

### `/apps` o `/list`
**Descripción:** Lista todas las aplicaciones del usuario

**Respuesta:**
```
[Bot] 📱 TUS APLICACIONES (3/3)

1. 🟢 Mi Portfolio
   🌐 /creations/abc-123
   📊 1,247 visitas
   ⏱️ Creada: hace 2 días
   💎 PRO: [Activar]

2. 🟡 Tienda de Ropa (PARCIAL)
   🌐 /creations/def-456
   ⚠️ Límite alcanzado en 70%
   💎 PRO: [Completar - 0.05 ETH]

3. 🟢 Dashboard Crypto
   🌐 /creations/ghi-789
   ✅ PRO ACTIVO
   🗄️ DB: Conectada

[Página 1/1] [Crear Nueva]
```

---

### `/pro` o `/upgrade`
**Descripción:** Muestra opciones para activar PRO

**Respuesta si tiene apps:**
```
[Bot] 💎 ACTIVAR PRO

Beneficios:
✅ Sin límites de complejidad
✅ Backend real (Supabase)
✅ Base de datos PostgreSQL
✅ Autenticación de usuarios
✅ Storage para archivos
✅ API en tiempo real

Selecciona app a activar:
[Mi Portfolio] [Tienda de Ropa] [Dashboard]

O depósito directo:
📍 Wallet: 0x742d...8B9
💰 Monto: 0.05 ETH
⏱️ Válido: 24 horas
```

**Respuesta si no tiene apps:**
```
[Bot] 💎 ACTIVAR PRO

Primero crea una app con /new
Luego podrás activar PRO para desbloquear:
• Backend completo
• Base de datos
• Sin límites

[Crear App]
```

---

### `/status`
**Descripción:** Muestra estado del usuario y límites

**Respuesta:**
```
[Bot] 📊 TU ESTADO

👤 Usuario: @naiamst
🎚️ Tier: Gratuito

📱 Apps: 2/3 activas
   • Mi Portfolio (completa)
   • Tienda (parcial - 70%)

⚡ Límites (24h):
   • Creaciones: 2/3 usadas
   • Tokens usados: 6,247/12,000
   • Próxima regeneración: 18:30 UTC

⏱️ Cooldown: Listo para crear

💎 PRO: No activo
[Ver planes PRO]
```

---

### `/delete` o `/remove`
**Descripción:** Elimina una aplicación existente

**Flujo:**
```
[Usuario] /delete

[Bot] 🗑️ ELIMINAR APP

Selecciona la app a eliminar:
⚠️ Esta acción no se puede deshacer

[Mi Portfolio] [Tienda de Ropa] [Cancelar]

---

[Usuario] selecciona "Tienda de Ropa"

[Bot] 🗑️ CONFIRMAR ELIMINACIÓN

App: Tienda de Ropa
URL: /creations/def-456
Creada: hace 3 días
Visitas: 523

⚠️ Se eliminará permanentemente

[✅ Confirmar] [❌ Cancelar]
```

---

### `/edit` o `/modify`
**Descripción:** Modifica una app existente (solo cambios menores)

**Restricciones:**
- Solo cambios de texto/colores (no estructura)
- Máximo 3 ediciones por app
- PRO: Ediciones ilimitadas

**Flujo:**
```
[Usuario] /edit

[Bot] ✏️ EDITAR APP

Selecciona app:
[Mi Portfolio] [Tienda de Ropa]

---

[Usuario] selecciona

[Bot] ✏️ EDITAR: Mi Portfolio

¿Qué quieres cambiar?
🎨 [Colores]
📝 [Textos]
🖼️ [Imágenes]

⚠️ Cambios estructurales requieren re-crear la app
```

---

### `/help`
**Descripción:** Muestra ayuda y ejemplos

**Respuesta:**
```
[Bot] ❓ AYUDA - AgentzFactory

🚀 COMENZAR:
/new - Crear nueva app
/apps - Ver tus apps
/status - Tu estado y límites

💎 PRO:
/pro - Activar funcionalidad completa

⚙️ GESTIÓN:
/edit - Modificar app existente
/delete - Eliminar app

📝 CONSEJOS:
• Sé específico en tu descripción
• Ejemplo bueno: "Landing page azul marina para consultora legal con formulario de contacto"
• Ejemplo malo: "Una página web"

📊 LÍMITES GRATUITOS:
• 3 apps máximo
• 4,000 tokens por generación
• 8 componentes máximo

❓ Soporte: @agentzfactory_support
```

---

### `/start`
**Descripción:** Bienvenida y onboarding

**Respuesta para nuevo usuario:**
```
[Bot] 👋 ¡Bienvenido a AgentzFactory!

Soy tu constructor de apps vía Telegram.

🚀 CÓMO FUNCIONA:
1. Describes la app que quieres
2. Genero el código automáticamente
3. Te doy un link para verla
4. (Opcional) Activa PRO para backend

🎯 EJEMPLOS DE LO QUE PUEDO CREAR:
• Landing pages
• Portfolios
• Dashboards simples
• Tiendas (frontend)
• Galerías
• Formularios

⚡ EMPIEZA AHORA:
[/new Crear mi primera app]

📚 Más info: /help
```

---

### `/cancel`
**Descripción:** Cancela operación en curso

**Uso:** En cualquier momento del flujo

**Respuesta:**
```
[Bot] ❌ Operación cancelada.

¿Qué quieres hacer?
[/new Crear app] [/apps Mis apps]
```

---

## Comandos de Admin (Solo desarrolladores)

### `/admin stats`
Métricas del sistema
```
[Admin] 📊 STATS GLOBALES

Hoy:
• Creaciones: 47
• Deploys parciales: 12 (25%)
• PRO activados: 3
• Ingresos: 0.15 ETH

Usuarios activos: 23
Apps en sistema: 156
```

### `/admin users`
Lista usuarios con flags
```
[Admin] 👥 USUARIOS TOP

@usuario1 - 12 apps (PRO)
@usuario2 - 5 apps (FREE) - FLAG: rate limit frecuente
@usuario3 - 8 apps (PRO)
```

### `/admin maintenance`
Modo mantenimiento ON/OFF

### `/admin broadcast`
Mensaje a todos los usuarios

---

## Menús Inline (Botones)

### Navegación Principal (siempre visible)
```
[🏠 Home] [➕ Nueva] [📱 Mis Apps] [💎 PRO]
```

### En Creación
```
[🔄 Re-hacer] [⏹️ Detener] [👀 Preview] [✅ Finalizar]
```

### En Deploy Parcial
```
[💎 Activar PRO] [🔄 Simplificar] [👀 Ver Preview]
```

---

## Flujos de Conversación

### Flujo 1: Creación Exitosa
```
/new → [descripción] → [generando...] → [deploy] → [URL]
```

### Flujo 2: Límite Alcanzado
```
/new → [descripción] → [generando...] → [70%] → [STOP] → [deploy parcial] → [mensaje upgrade]
```

### Flujo 3: Activación PRO
```
/pro → [seleccionar app] → [generar wallet] → [esperar pago] → [detectar] → [activar]
```

---

## Manejo de Errores

### Rate Limit
```
[Bot] ⏱️ RATE LIMIT

Has alcanzado el límite de 3 creaciones por día.

Próxima disponible: Mañana 00:00 UTC

💎 PRO: Creaciones ilimitadas
[Activar PRO]
```

### Error de Generación
```
[Bot] ⚠️ ERROR DE GENERACIÓN

No pude completar tu app por:
"Descripción demasiado ambigua"

💡 Intenta ser más específico:
❌ "Una página"
✅ "Landing page negra con formulario de contacto y testimonios"

[Intentar de nuevo]
```

### Timeout
```
[Bot] ⏱️ TIEMPO AGOTADO

La generación tomó demasiado tiempo.

Esto puede pasar con apps muy complejas.

Opciones:
• Simplificar tu descripción
• Intentar de nuevo
• Activar PRO (build más rápido)
```

---

## Configuración de BotFather

Para registrar los comandos en BotFather:
```
new - Crear nueva app
apps - Ver mis aplicaciones
pro - Activar PRO
status - Mi estado y límites
edit - Modificar app
delete - Eliminar app
help - Ayuda y ejemplos
cancel - Cancelar operación
```

---

## Notas de Implementación

- Usar `reply_markup` para botones inline
- Guardar estado de conversación en Redis/DB
- Timeout de 5 minutos para flujos incompletos
- Si usuario no responde en 2 min: "¿Sigues ahí?"
