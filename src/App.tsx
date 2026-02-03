import { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Zap, 
  Rocket, 
  Code2, 
  Globe, 
  Cpu,
  ArrowRight,
  ChevronRight,
  Play,
  Github,
  Twitter,
  MessageSquare,
  Star,
  Layers,
  Terminal,
  Boxes,
  Palette
} from 'lucide-react'
import './index.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  const examples = [
    'Landing page épica para mi startup de IA',
    'Dashboard dark mode con gráficos animados',
    'E-commerce con estética cyberpunk',
    'Portfolio 3D interactivo para diseñador'
  ]

  const stats = [
    { value: '10K+', label: 'Apps generadas' },
    { value: '<30s', label: 'Tiempo promedio' },
    { value: '99.9%', label: 'Uptime' },
    { value: '0$', label: 'Empezar gratis' }
  ]

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'IA que entiende tu visión',
      description: 'Describe tu app en lenguaje natural. Nuestra IA convierte ideas en código React limpio y optimizado.',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Deploy instantáneo',
      description: 'Un clic y tu app está online en la red edge de Cloudflare. CDN global, SSL automático, sin configuración.',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: 'Stack moderno garantizado',
      description: 'Vite + React + TypeScript + Tailwind. Código production-ready con las mejores prácticas.',
      color: 'from-cyan-500 to-blue-600'
    }
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden relative">
      {/* Dynamic background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[150px] transition-all duration-1000"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
            left: mousePosition.x - 400,
            top: mousePosition.y - 400,
          }}
        />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[200px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-cyan-500 flex items-center justify-center glow-purple animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Agentz<span className="gradient-text-animated">Factory</span>
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {['Features', 'Templates', 'Pricing', 'Docs'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="https://github.com/reflecterlabs/agentzfactory" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
              <Github className="w-5 h-5 text-zinc-400" />
            </a>
            <button className="hidden sm:flex px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium">
              Sign In
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 hover:from-violet-500 hover:via-pink-400 hover:to-cyan-400 transition-all text-sm font-bold btn-press">
              Start Building
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-violet-500/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-zinc-300">Ahora con integración Supabase</span>
              <ChevronRight className="w-4 h-4 text-violet-400" />
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center mb-12">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
              <span className="block">Construye apps</span>
              <span className="block gradient-text-animated mt-2">con magia IA</span>
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Describe tu idea en segundos. Nosotros generamos, construimos y deployamos tu web app a Cloudflare.{' '}
              <span className="text-white font-semibold">Sin código. Sin esperas.</span>
            </p>
          </div>

          {/* Input Area - Neon style */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="neon-border rounded-2xl p-1">
              <div className="flex items-end gap-4 p-5 bg-[#0a0a0f] rounded-xl">
                <div className="flex-1">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe la web app que quieres crear..."
                    className="w-full bg-transparent border-none outline-none resize-none text-lg sm:text-xl placeholder:text-zinc-600 min-h-[60px] max-h-[150px] text-white"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleGenerate()
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 hover:from-violet-500 hover:via-pink-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg btn-press glow-hover whitespace-nowrap"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Example prompts */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-20">
            <span className="text-sm text-zinc-500">Prueba con:</span>
            {examples.map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                className="px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-violet-500/30 text-sm text-zinc-400 hover:text-white transition-all"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-4xl sm:text-5xl font-black gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
              Features
            </span>
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              Todo lo que necesitas para{' '}
              <span className="gradient-text">construir rápido</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              De la idea a producción en minutos. Sin configuraciones complejas, sin infraestructura que gestionar.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] hover:border-white/[0.15] transition-all card-hover"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-purple`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              Cómo <span className="gradient-text">funciona</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Terminal className="w-8 h-8" />,
                title: 'Describe tu app',
                description: 'Escribe en lenguaje natural qué quieres construir. Sé tan específico como quieras.'
              },
              {
                step: '02',
                icon: <Cpu className="w-8 h-8" />,
                title: 'IA genera el código',
                description: 'Nuestro sistema crea código React limpio, tipado y optimizado con Tailwind CSS.'
              },
              {
                step: '03',
                icon: <Globe className="w-8 h-8" />,
                title: 'Deploy automático',
                description: 'Tu app se compila y se deploya a Cloudflare Pages con CDN global en segundos.'
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-black text-white/[0.03] absolute -top-8 -left-4">{item.step}</div>
                <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-violet-500/20">
                    <div className="text-violet-400">{item.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-zinc-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Stack <span className="gradient-text">moderno</span> por defecto
            </h2>
            <p className="text-zinc-400 text-lg">Las mejores tecnologías, preconfiguradas y listas para usar</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Vite', desc: 'Build tool ultrarrápido', icon: <Zap className="w-8 h-8" /> },
              { name: 'React', desc: 'UI library', icon: <Boxes className="w-8 h-8" /> },
              { name: 'TypeScript', desc: 'Type safety', icon: <Code2 className="w-8 h-8" /> },
              { name: 'Tailwind', desc: 'Utility CSS', icon: <Palette className="w-8 h-8" /> },
            ].map((tech, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 flex items-center justify-center group-hover:from-violet-500/20 group-hover:to-pink-500/20 transition-all">
                  <div className="text-violet-400">{tech.icon}</div>
                </div>
                <div className="font-bold text-lg mb-1">{tech.name}</div>
                <div className="text-sm text-zinc-500">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 sm:p-16 rounded-[2.5rem] bg-gradient-to-br from-violet-600/20 via-pink-600/20 to-cyan-600/20 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 grid-pattern-dense opacity-30" />
            
            <div className="relative text-center">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
                ¿Listo para construir?<br />
                <span className="gradient-text">Empeza gratis hoy</span>
              </h2>
              <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
                Unite a miles de developers que ya están construyendo el futuro con AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black hover:bg-zinc-100 transition-all font-bold text-lg btn-press">
                  <Sparkles className="w-5 h-5" />
                  Crear cuenta gratis
                </button>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold text-lg">
                  <Play className="w-5 h-5" />
                  Ver demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                Agentz<span className="gradient-text">Factory</span>
              </span>
            </div>

            <div className="flex items-center gap-8">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Templates</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">Docs</a>
            </div>

            <div className="flex items-center gap-4">
              <a href="https://github.com/reflecterlabs/agentzfactory" target="_blank" rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <Github className="w-5 h-5 text-zinc-400" />
              </a>
              <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <Twitter className="w-5 h-5 text-zinc-400" />
              </a>
              <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <MessageSquare className="w-5 h-5 text-zinc-400" />
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-zinc-600 text-sm">
              © 2026 AgentzFactory. Built with AI magic. 🚀
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
