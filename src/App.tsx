import { useState } from 'react'
import { 
  Sparkles, 
  Code2, 
  Zap, 
  Globe, 
  ChevronRight, 
  Play, 
  Github, 
  Twitter,
  MessageSquare,
  ArrowRight
} from 'lucide-react'
import './index.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    // Simular generación - aquí iría la lógica real
    setTimeout(() => setIsGenerating(false), 2000)
  }

  const examples = [
    'Landing page para un SaaS de analytics',
    'Dashboard con gráficos de ventas',
    'Formulario de contacto moderno',
    'Portfolio minimalista para fotógrafo'
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Agentz<span className="gradient-text">Factory</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#templates" className="text-sm text-zinc-400 hover:text-white transition-colors">Templates</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="text-sm text-zinc-400 hover:text-white transition-colors">Docs</a>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/agentzfactory" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Github className="w-5 h-5 text-zinc-400" />
            </a>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm">
              Sign In
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all text-sm font-medium glow-hover">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-zinc-400">Now with Supabase integration</span>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
            Build websites with{' '}
            <span className="gradient-text">AI magic</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 animate-fade-in">
            Describe what you want, and let AI generate your next web app. 
            Deploy to Cloudflare in seconds.
          </p>

          {/* Input Area */}
          <div className="relative max-w-3xl mx-auto mb-8 animate-fade-in">
            <div className="gradient-border">
              <div className="p-1">
                <div className="flex items-end gap-4 p-4 bg-[#141414] rounded-xl">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the website you want to build..."
                    className="flex-1 bg-transparent border-none outline-none resize-none text-lg placeholder:text-zinc-600 min-h-[60px] max-h-[200px]"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleGenerate()
                      }
                    }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium glow-hover whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in">
            <span className="text-sm text-zinc-500">Try:</span>
            {examples.map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-zinc-400 hover:text-white transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{' '}
              <span className="gradient-text">build faster</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              From idea to production in minutes, not hours. 
              Powered by modern tools you already love.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Code2 className="w-6 h-6" />,
                title: 'AI-Powered Generation',
                description: 'Describe your app in plain English. Our AI generates clean, production-ready React code.'
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Instant Deploy',
                description: 'One-click deploy to Cloudflare Pages. Global edge network, zero configuration.'
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Supabase Integration',
                description: 'Built-in queue system with Supabase. Real-time updates, authentication, and database.'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mb-4 group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-all">
                  <div className="text-violet-400">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See it in{' '}
              <span className="gradient-text">action</span>
            </h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#141414] border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-md mx-auto px-4 py-1.5 rounded-lg bg-[#0a0a0a] text-center text-sm text-zinc-500">
                  agentzfactory.dev/dashboard
                </div>
              </div>
            </div>

            {/* Preview content */}
            <div className="aspect-video relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center glow animate-pulse-glow">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-zinc-500">Interactive demo coming soon</p>
                </div>
              </div>

              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold">AgentzFactory</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>

            <p className="text-sm text-zinc-600">
              © 2026 AgentzFactory. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
