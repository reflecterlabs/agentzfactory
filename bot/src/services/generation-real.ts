import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { sanitizePrompt } from '../utils/crypto';

const execAsync = promisify(exec);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

const SYSTEM_PROMPT = `You are AgentzFactory Code Generator.

CRITICAL RULES:
1. Generate ONLY React + Vite + Tailwind v3 + TypeScript
2. Create a SINGLE file App.tsx with all components
3. Use ONLY Tailwind classes (no CSS modules)
4. Dark theme by default (bg-gray-900, text-white)
5. MUST be responsive with sm:, md:, lg: prefixes
6. Use LUCIDE REACT icons only (import { IconName } from 'lucide-react')
7. NO external API calls (fetch, axios, etc.)
8. NO eval(), document.write, or dangerous code
9. ALL data must be mock/static
10. Include BrandBadge component at bottom

REQUIRED STRUCTURE:
- Single App.tsx file
- Export default function App()
- Typescript with proper types
- Tailwind v3 classes only

OUTPUT: Return ONLY the complete App.tsx file content. No markdown, no explanations. Raw code only.`;

export interface GenerationResult {
  success: boolean;
  code?: string;
  creationId: string;
  url?: string;
  error?: string;
  componentCount: number;
  tokenCount: number;
}

export async function generateAndDeploy(
  description: string,
  userId: string
): Promise<GenerationResult> {
  const creationId = `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 1. Sanitizar prompt
    const { sanitized } = sanitizePrompt(description);
    
    // 2. Generar código con OpenAI
    console.log(`Generating code for: ${sanitized}`);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Create a React app for: ${sanitized}\n\nInclude:\n- Hero section\n- Main content\n- Responsive design\n- Dark theme\n- Professional styling` }
      ],
      max_tokens: 4000,
      temperature: 0.2
    });

    const code = response.choices[0]?.message?.content || '';
    const cleanCode = code.replace(/^```tsx\n/, '').replace(/^```typescript\n/, '').replace(/^```\n/, '').replace(/\n```$/, '').trim();
    
    // 3. Crear estructura de carpetas
    const creationDir = path.join(process.cwd(), 'creations', creationId);
    await fs.mkdir(creationDir, { recursive: true });
    
    // 4. Crear archivos necesarios
    await createProjectFiles(creationDir, cleanCode, description);
    
    // 5. Git add, commit, push
    await gitCommitAndPush(creationId, description);
    
    // 6. Calcular métricas
    const componentCount = (cleanCode.match(/function\s+\w+|const\s+\w+\s*=\s*\(\s*\)/g) || []).length;
    const tokenCount = Math.ceil(cleanCode.length / 4);
    
    return {
      success: true,
      code: cleanCode,
      creationId,
      url: `https://agentzfactory.pages.dev/creations/${creationId}`,
      componentCount,
      tokenCount
    };
    
  } catch (error: any) {
    console.error('Generation error:', error);
    return {
      success: false,
      creationId,
      error: error.message,
      componentCount: 0,
      tokenCount: 0
    };
  }
}

async function createProjectFiles(dir: string, code: string, description: string) {
  // package.json
  const packageJson = {
    name: `agentz-creation`,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'lucide-react': '^0.294.0'
    },
    devDependencies: {
      '@types/react': '^18.2.43',
      '@types/react-dom': '^18.2.17',
      '@vitejs/plugin-react': '^4.2.1',
      typescript: '^5.2.2',
      vite: '^5.0.8',
      tailwindcss: '^3.4.0',
      postcss: '^8.4.32',
      autoprefixer: '^10.4.16'
    }
  };
  
  // vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
})
`;

  // tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }]
  };

  // tsconfig.node.json
  const tsConfigNode = {
    compilerOptions: {
      composite: true,
      skipLibCheck: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowSyntheticDefaultImports: true
    },
    include: ['vite.config.ts']
  };

  // tailwind.config.js
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

  // postcss.config.js
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

  // index.html
  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${description.slice(0, 50)}...</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  // src/main.tsx
  const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;

  // src/index.css
  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  background-color: #050505;
  color: #ffffff;
}

body {
  margin: 0;
  min-height: 100vh;
}
`;

  // src/App.tsx (el código generado)
  const appTsx = code;

  // Escribir todos los archivos
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify(packageJson, null, 2));
  await fs.writeFile(path.join(dir, 'vite.config.ts'), viteConfig);
  await fs.writeFile(path.join(dir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
  await fs.writeFile(path.join(dir, 'tsconfig.node.json'), JSON.stringify(tsConfigNode, null, 2));
  await fs.writeFile(path.join(dir, 'tailwind.config.js'), tailwindConfig);
  await fs.writeFile(path.join(dir, 'postcss.config.js'), postcssConfig);
  await fs.writeFile(path.join(dir, 'index.html'), indexHtml);
  
  await fs.mkdir(path.join(dir, 'src'), { recursive: true });
  await fs.writeFile(path.join(dir, 'src', 'main.tsx'), mainTsx);
  await fs.writeFile(path.join(dir, 'src', 'index.css'), indexCss);
  await fs.writeFile(path.join(dir, 'src', 'App.tsx'), appTsx);
}

async function gitCommitAndPush(creationId: string, description: string) {
  try {
    const repoPath = process.cwd();
    
    // Git add
    await execAsync(`git add creations/${creationId}/`, { cwd: repoPath });
    
    // Git commit
    const commitMsg = `feat: new app creation ${creationId}

${description}`;
    await execAsync(`git commit -m "${commitMsg}"`, { cwd: repoPath });
    
    // Git push
    await execAsync('git push origin main', { cwd: repoPath });
    
    console.log(`✅ Committed and pushed: ${creationId}`);
  } catch (error: any) {
    console.error('Git error:', error.message);
    // No lanzar error, el deploy puede funcionar igual
  }
}
