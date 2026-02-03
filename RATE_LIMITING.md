# ⚡ Rate Limiting y Control de Recursos - AgentzFactory

## Sistema de Límites Progresivos

### Límite 1: Tokens de Generación (Por solicitud)

```typescript
// Configuración de límites
const GENERATION_LIMITS = {
  FREE_TIER: {
    maxTokens: 4000,           // ~3,000 palabras de código
    maxComponents: 8,          // Máximo 8 componentes
    maxLinesOfCode: 500,       // Máximo 500 líneas
    maxFileSize: '50KB',       // Por archivo
    buildTimeout: 30000,       // 30 segundos máximo de build
  },
  PRO_TIER: {
    maxTokens: 16000,          // ~12,000 palabras
    maxComponents: 25,
    maxLinesOfCode: 2000,
    maxFileSize: '200KB',
    buildTimeout: 120000,      // 2 minutos
  }
};

// Contador de tokens en tiempo real
class TokenCounter {
  private tokenCount = 0;
  private lastCheckpoint = 0;
  
  countTokens(text: string): number {
    // Aproximación: ~4 caracteres = 1 token
    return Math.ceil(text.length / 4);
  }
  
  checkLimit(currentCode: string, limit: number): { 
    withinLimit: boolean; 
    used: number; 
    remaining: number;
    percentage: number;
  } {
    const used = this.countTokens(currentCode);
    const remaining = limit - used;
    const percentage = (used / limit) * 100;
    
    return {
      withinLimit: used < limit,
      used,
      remaining,
      percentage
    };
  }
}
```

### Límite 2: Complejidad de la App (Análisis AST)

```typescript
interface ComplexityMetrics {
  componentCount: number;
  hookUsage: number;
  stateVariables: number;
  propsDrilling: number;
  importCount: number;
  nestedLevel: number;
}

function analyzeComplexity(code: string): ComplexityMetrics {
  // Parsear código y contar:
  // - Cuántos componentes
  // - Cuántos useState/useEffect
  // - Nivel de anidación máximo
  // - Cantidad de imports
  
  const metrics = {
    componentCount: (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length,
    hookUsage: (code.match(/use\w+\s*\(/g) || []).length,
    stateVariables: (code.match(/useState\s*\(/g) || []).length,
    propsDrilling: (code.match(/props\./g) || []).length,
    importCount: (code.match(/^import\s+/gm) || []).length,
    nestedLevel: calculateNestingLevel(code),
  };
  
  return metrics;
}

function calculateNestingLevel(code: string): number {
  let maxLevel = 0;
  let currentLevel = 0;
  
  for (const char of code) {
    if (char === '{') currentLevel++;
    if (char === '}') currentLevel--;
    maxLevel = Math.max(maxLevel, currentLevel);
  }
  
  return maxLevel;
}
```

### Límite 3: Prevención de Bucles Infinitos

```typescript
// Detectar patrones de bucle sospechosos
const DANGEROUS_PATTERNS = [
  // useEffect sin dependencias que modifica estado
  /useEffect\s*\(\s*\(\)\s*=?\u003e\s*\{[^}]*set\w+\([^)]*\)[^}]*\}\s*,\s*\[\s*\]\s*\)/,
  
  // setState dentro de render sin condición
  /set\w+\([^)]*\)(?!.*if)(?!.*useEffect)/,
  
  // while(true) o for(;;)
  /while\s*\(\s*true\s*\)/,
  /for\s*\(\s*;\s*;\s*\)/,
  
  // Recursión sin base case clara
  /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\w+\s*\([^)]*\)/,
];

function detectInfiniteLoopRisk(code: string): {
  hasRisk: boolean;
  patterns: string[];
} {
  const foundPatterns = [];
  
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      foundPatterns.push(pattern.source);
    }
  }
  
  return {
    hasRisk: foundPatterns.length > 0,
    patterns: foundPatterns
  };
}
```

---

## Flujo de "Deploy Parcial + Upgrade"

```typescript
async function generateWithLimits(
  userPrompt: string,
  userId: string,
  tier: 'free' | 'pro'
): Promise<GenerationResult> {
  
  const limits = GENERATION_LIMITS[tier === 'pro' ? 'PRO_TIER' : 'FREE_TIER'];
  const tokenCounter = new TokenCounter();
  
  // 1. Estimar complejidad antes de generar
  const estimatedComplexity = estimateComplexity(userPrompt);
  
  if (estimatedComplexity > limits.maxComponents) {
    return {
      status: 'LIMIT_EXCEEDED',
      deployed: false,
      message: `⚠️ COMPLEJIDAD DETECTADA: ${estimatedComplexity} componentes estimados\n\n` +
               `Límite gratuito: ${limits.maxComponents} componentes\n\n` +
               `OPCIONES:\n` +
               `1. Simplificar tu solicitud (menos funcionalidades)\n` +
               `2. Activar PRO para ${estimatedComplexity} componentes`,
      partialCode: null,
      walletAddress: await generateWalletForUser(userId)
    };
  }
  
  // 2. Generar con streaming y monitoreo
  let generatedCode = '';
  const chunks = [];
  
  for await (const chunk of generateCodeStream(userPrompt)) {
    generatedCode += chunk;
    chunks.push(chunk);
    
    const tokenStatus = tokenCounter.checkLimit(generatedCode, limits.maxTokens);
    
    // Alerta al 70%
    if (tokenStatus.percentage >= 70 && tokenStatus.percentage < 75) {
      console.warn(`Usuario ${userId} al 70% del límite`);
    }
    
    // Límite alcanzado - deployar lo que se tiene
    if (!tokenStatus.withinLimit) {
      // Encontrar último componente completo
      const lastCompleteComponent = findLastCompleteComponent(generatedCode);
      const partialCode = generatedCode.substring(0, lastCompleteComponent.endIndex);
      
      // Deployar versión parcial
      const partialDeploy = await deployPartial(partialCode, userId);
      
      return {
        status: 'PARTIAL_DEPLOY',
        deployed: true,
        message: `⏹️ LÍMITE ALCANZADO (${tokenStatus.used}/${limits.maxTokens} tokens)\n\n` +
                 `✅ Deployado hasta: ${lastCompleteComponent.name}\n` +
                 `🔗 Ver: ${partialDeploy.url}\n\n` +
                 `💎 CONTINUAR CON PRO:\n` +
                 `Deposita 0.05 ETH para completar:\n` +
                 `• ${estimatedComplexity - lastCompleteComponent.index} componentes restantes\n` +
                 `• Funcionalidad completa\n` +
                 `• Backend incluido`,
        partialCode,
        walletAddress: await generateWalletForUser(userId),
        currentUrl: partialDeploy.url
      };
    }
  }
  
  // 3. Si llegó completo, verificar complejidad
  const complexity = analyzeComplexity(generatedCode);
  
  if (complexity.componentCount > limits.maxComponents) {
    return {
      status: 'COMPONENT_LIMIT',
      deployed: false,
      message: `⚠️ DEMASIADOS COMPONENTES: ${complexity.componentCount}\n\n` +
               `Límite actual: ${limits.maxComponents}\n\n` +
               `💎 Activar PRO para desbloquear`,
      partialCode: generatedCode,
      walletAddress: await generateWalletForUser(userId)
    };
  }
  
  // 4. Todo OK - deploy completo
  const deploy = await deployComplete(generatedCode, userId);
  
  return {
    status: 'COMPLETE',
    deployed: true,
    message: `✅ APP COMPLETA\n\n` +
             `🔗 ${deploy.url}`,
    partialCode: null,
    url: deploy.url
  };
}
```

---

## Mensajes de Límite al Usuario

### Caso 1: Estimación Previa (Antes de generar)
```
[Usuario] "Quiero una red social con feed, stories, chat, 
           videollamadas, marketplace y criptomonedas"

[Bot] ⚠️ DETECCIÓN DE COMPLEJIDAD

Estimado: 15+ componentes, 8000+ tokens

Límite gratuito: 8 componentes, 4000 tokens

OPCIONES:
🔄 Simplificar: "Red social con feed y perfiles"
💎 Activar PRO: 0.05 ETH para versión completa

[Tonel PRO] [Simplificar]
```

### Caso 2: Límite Alcanzado Durante Generación
```
[Bot] ⏹️ GENERACIÓN PAUSADA

Progreso: 65% (6/10 componentes)
Límite: 4000/4000 tokens alcanzado

✅ Deployado parcialmente:
🔗 https://agentzfactory.com/creations/abc-123

Incluye:
✓ Header y navegación
✓ Feed de posts (mock)
✓ Perfil de usuario
✗ Stories (pendiente)
✗ Chat (pendiente)

💎 CONTINUAR CON PRO:
Deposita 0.05 ETH en:
0x742d35...8B9

[Ver Preview] [Activar PRO]
```

### Caso 3: Detección de Bucle Infinito
```
[Bot] ⚠️ PATRÓN PELIGROSO DETECTADO

El código generado contiene:
- useEffect sin dependencias que modifica estado

Esto causaría un bucle infinito.

¿Quieres que:
1. Corrija automáticamente (agregar dependencias)
2. Re-genere con instrucciones diferentes
3. Ver código problemático

[Corregir] [Re-intentar] [Ver código]
```

---

## Skills de ClawHub Relevantes

Basado en `openclaw skills list`, buscar:

```bash
# Skills que podrían ayudar:
npx clawhub search "rate limit"
npx clawhub search "token counter"
npx clawhub search "validator"
```

**Skills potencialmente útiles:**

1. **code-guard** (si existe) - Validación de código seguro
2. **complexity-analyzer** - Análisis de complejidad de código
3. **token-counter** - Conteo preciso de tokens
4. **rate-limiter** - Rate limiting para APIs

Si no existen, podemos crear skills propios o usar librerías:

```typescript
// Librerías recomendadas:
import { encode } from 'gpt-tokenizer';        // Conteo exacto de tokens OpenAI
import { parse } from '@babel/parser';          // AST parsing para análisis
import { validate } from 'eslint';              // Validación de código
```

---

## Métricas de Monitoreo

```typescript
// Dashboard de uso (para nosotros)
interface UsageMetrics {
  daily: {
    totalGenerations: number;
    partialDeploys: number;      // Cuántos hit limit
    proActivations: number;       // Conversión a PRO
    averageTokensPerGen: number;
    peakComplexity: number;
  };
  
  byUser: {
    userId: string;
    tier: 'free' | 'pro';
    generationsToday: number;
    averageComplexity: number;
    hitLimitCount: number;
  }[];
}
```

---

## Próxima Implementación

1. ✅ Definir límites (hecho arriba)
2. 🔄 Implementar `TokenCounter` con `gpt-tokenizer`
3. 🔄 Crear `ComplexityAnalyzer` con AST parsing
4. 🔄 Modificar generador para streaming con checkpoints
5. 🔄 Sistema de "deploy parcial" con URLs funcionales
6. 🔄 UI de Telegram para mostrar progreso y límites

¿Por dónde empezamos?
