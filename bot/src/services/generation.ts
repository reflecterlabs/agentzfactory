import OpenAI from 'openai';
import { GenerationRequest, GenerationResult } from '../types';
import { config } from '../config';
import { estimateTokens, sanitizePrompt } from '../utils/crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are AgentzFactory Code Generator.

ABSOLUTE RULES - NEVER VIOLATE:
1. ONLY generate React frontend with Vite + Tailwind CSS v3 + TypeScript
2. NEVER generate: backends, APIs, databases, complex auth, payment processing
3. NEVER include: eval(), document.write, external scripts, iframes, fetch() calls
4. ALWAYS use: functional components, standard hooks, Tailwind classes
5. MAXIMUM 15 components total
6. ALL images must be: placeholders or Unsplash URLs only
7. ALWAYS dark theme: bg-gray-900, text-white base
8. MUST be responsive: use sm:, md:, lg: prefixes
9. MUST include BrandBadge component from '@agentzfactory/ui'
10. ALL data must be mock/static, NO real APIs

REQUIRED STRUCTURE:
- Single file App.tsx with all components
- Tailwind classes only (no CSS modules)
- Lucide React icons (if needed)
- No external dependencies beyond: react, react-dom, lucide-react

OUTPUT FORMAT:
Return ONLY the complete App.tsx file content. No explanations. No markdown code blocks. Just the raw code.

If the request exceeds complexity limits, generate what you can and add a comment at the top: // PARTIAL_GENERATION: stopped at [component name]`;

export class GenerationService {
  async generateApp(request: GenerationRequest): Promise<GenerationResult> {
    try {
      // Sanitizar prompt
      const { sanitized, warnings } = sanitizePrompt(request.prompt);
      
      if (warnings.length > 0) {
        console.log('Prompt sanitization warnings:', warnings);
      }

      // Estimar tokens del prompt
      const promptTokens = estimateTokens(sanitized);
      
      // Llamar a OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Modelo más rápido y económico
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Create a React app for: ${sanitized}\n\nUser ID: ${request.userId}\nCreation ID: ${request.creationId}` }
        ],
        max_tokens: config.freeTierLimits.maxTokens,
        temperature: 0.2 // Más determinístico
      });

      const code = response.choices[0]?.message?.content || '';
      
      // Limpiar código (quitar markdown si existe)
      const cleanCode = this.cleanCode(code);
      
      // Analizar resultado
      const tokenCount = estimateTokens(cleanCode);
      const componentCount = this.countComponents(cleanCode);
      const isPartial = cleanCode.includes('PARTIAL_GENERATION');
      
      // Detectar errores básicos
      const hasErrors = this.validateCode(cleanCode);
      
      if (hasErrors.length > 0) {
        return {
          success: false,
          error: hasErrors.join(', '),
          tokenCount,
          componentCount,
          status: 'error'
        };
      }

      return {
        success: true,
        code: cleanCode,
        tokenCount,
        componentCount,
        status: isPartial ? 'partial' : 'complete',
        partialCode: isPartial ? cleanCode : undefined,
        lastComponent: isPartial ? this.extractLastComponent(cleanCode) : undefined
      };

    } catch (error: any) {
      console.error('Generation error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        tokenCount: 0,
        componentCount: 0,
        status: 'error'
      };
    }
  }

  private cleanCode(code: string): string {
    // Quitar markdown ```tsx o ``` si existe
    return code
      .replace(/^```tsx\n/, '')
      .replace(/^```typescript\n/, '')
      .replace(/^```\n/, '')
      .replace(/\n```$/, '')
      .trim();
  }

  private countComponents(code: string): number {
    // Contar componentes funcionales
    const functionComponents = (code.match(/function\s+\w+\s*\(/g) || []).length;
    const arrowComponents = (code.match(/const\s+\w+\s*=\s*\(\s*\)\s*=?\u003e/g) || []).length;
    return functionComponents + arrowComponents;
  }

  private validateCode(code: string): string[] {
    const errors: string[] = [];
    
    // Patrones prohibidos
    const forbiddenPatterns = [
      { pattern: /eval\s*\(/gi, msg: 'eval() detected' },
      { pattern: /document\.write/gi, msg: 'document.write detected' },
      { pattern: /fetch\s*\(/gi, msg: 'fetch() detected - no external APIs' },
      { pattern: /XMLHttpRequest/gi, msg: 'XHR detected' },
      { pattern: /import\s+.*\s+from\s+['"]https?:\/\//gi, msg: 'External import detected' }
    ];
    
    for (const { pattern, msg } of forbiddenPatterns) {
      if (pattern.test(code)) {
        errors.push(msg);
      }
    }
    
    // Debe tener export default
    if (!code.includes('export default')) {
      errors.push('Missing export default');
    }
    
    return errors;
  }

  private extractLastComponent(code: string): string {
    const match = code.match(/PARTIAL_GENERATION:\s*stopped at\s*(.+)/);
    return match ? match[1].trim() : 'unknown';
  }
}

export const generationService = new GenerationService();
