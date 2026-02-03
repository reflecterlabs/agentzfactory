# Configuración de GitHub Repository

## Paso 1: Crear el repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `web`
3. Owner: `agentzfactory` (tu usuario/organización)
4. Description: `AI-Powered Web Builder - Build websites with AI magic`
5. Visibilidad: Public o Private (como prefieras)
6. **NO** inicialices con README (ya lo tenemos)
7. Click en "Create repository"

## Paso 2: Conectar el repositorio local

Desde la carpeta del proyecto, ejecuta:

```bash
# Agregar el remote
git remote add origin https://github.com/agentzfactory/web.git

# Verificar que se agregó
git remote -v

# Push al repositorio
git branch -M main
git push -u origin main
```

## Paso 3: Configurar Cloudflare Pages (Auto-deploy)

### Opción A: Conectar directo desde GitHub (recomendado)

1. Ve a https://dash.cloudflare.com
2. Pages → Create a project
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `agentzfactory/web`
5. Configuración:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
6. Click "Save and Deploy"

### Opción B: Deploy manual con Wrangler

```bash
# Instalar wrangler globalmente (si no lo tienes)
npm install -g wrangler

# Login a Cloudflare
npx wrangler login

# Deploy
npm run deploy
```

## Paso 4: Variables de entorno (si es necesario)

En Cloudflare Dashboard:
1. Ve a tu proyecto Pages
2. Settings → Environment variables
3. Agrega:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

## Comandos útiles de git

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "mensaje"

# Push
git push

# Pull cambios remotos
git pull origin main
```

## URLs importantes

- **Repositorio:** https://github.com/agentzfactory/web
- **Deploy (una vez configurado):** https://agentzfactory-web.pages.dev
- **Dashboard Cloudflare:** https://dash.cloudflare.com

---

¿Necesitas ayuda con algún paso específico?
