import { useEffect, useState } from 'react'
import { 
  Bot, 
  Zap, 
  Rocket, 
  MessageCircle,
  ArrowRight,
  Github,
  Twitter,
  Mail
} from 'lucide-react'
import { BrandBadge } from './components/BrandBadge'
import './index.css'

function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const TELEGRAM_BOT_URL = 'https://t.me/agentzfactory_bot'

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center glow-red animate-pulse-glow">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Agentz<span className="text-red-500">Factory</span>
            </span>
          </div>

          <a 
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 transition-all font-semibold text-sm glow-red-hover"
          >
            <MessageCircle className="w-4 h-4" />
            Start on Telegram
          </a>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-red-500/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-gray-300">Powered by AI. Built on Telegram.</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.1]">
              The AI that
              <br />
              <span className="text-gradient">builds apps.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up">
              Describe your idea in Telegram. Get a working web app in minutes. 
              No coding required. No complex setup.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <a 
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 transition-all font-bold text-lg glow-red-hover"
              >
                <MessageCircle className="w-5 h-5" />
                Start Building on Telegram
                <ArrowRight className="w-5 h-5" />
              </a>
              
              <a 
                href="https://github.com/reflecterlabs/agentzfactory"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-semibold text-lg"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              Free to start. No credit card required.
            </p>
          </div>

          {/* Floating Elements Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-10 w-20 h-20 border border-red-500/20 rounded-lg animate-float opacity-30" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1/3 right-10 w-16 h-16 bg-red-600/10 rounded-full animate-float opacity-30" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border border-red-500/10 rounded-xl animate-float opacity-20" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-black via-dark to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
              How it <span className="text-gradient">works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three simple steps from idea to deployed app.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <MessageCircle className="w-8 h-8" />,
                title: 'Chat on Telegram',
                description: 'Open your Telegram app and tell our bot what you want to build. "I need a landing page for my SaaS" or "Create a dashboard for my analytics".'
              },
              {
                step: '02',
                icon: <Zap className="w-8 h-8" />,
                title: 'AI Generates Code',
                description: 'Our AI understands your requirements and generates production-ready React code with modern stack: Vite, Tailwind, TypeScript.'
              },
              {
                step: '03',
                icon: <Rocket className="w-8 h-8" />,
                title: 'Deploy Instantly',
                description: 'Your app is automatically deployed to Cloudflare Pages with a global CDN. Get your URL in seconds, share it immediately.'
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/30 transition-all group"
              >
                <div className="absolute -top-4 -left-4 text-7xl font-black text-white/[0.03]">
                  {item.step}
                </div>
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600/20 to-red-500/20 flex items-center justify-center mb-6 text-red-500 group-hover:from-red-600/30 group-hover:to-red-500/30 transition-all">
                    {item.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a 
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 transition-all font-bold text-lg glow-red-hover"
            >
              <Bot className="w-5 h-5" />
              Try It Now — It's Free
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 3: FOOTER / CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 sm:p-16 rounded-[2rem] bg-gradient-to-br from-red-600/20 via-red-500/10 to-transparent border border-red-500/20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
              Ready to build?
              <br />
              <span className="text-gradient">Start for free.</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto">
              Join thousands of creators building the future, one message at a time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-black hover:bg-gray-100 transition-all font-bold text-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Open in Telegram
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              No signup. No credit card. Just build.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                Agentz<span className="text-red-500">Factory</span>
              </span>
            </div>

            <div className="flex items-center gap-6">
              <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="https://github.com/reflecterlabs/agentzfactory" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="mailto:hello@agentzfactory.com" className="text-gray-500 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>

            <p className="text-sm text-gray-600">
              © 2026 AgentzFactory.com
            </p>
          </div>
        </div>
      </footer>

      {/* Brand Badge - appears on all generated sites */}
      <BrandBadge position="bottom-right" />
    </div>
  )
}

export default App
