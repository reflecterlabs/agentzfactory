import { useEffect, useState, useRef } from 'react'
import { 
  Bot, 
  Zap, 
  Rocket, 
  MessageCircle,
  ArrowRight,
  Github,
  Twitter,
  Mail,
  ChevronDown,
  Sparkles,
  Code2,
  Globe
} from 'lucide-react'
import { BrandBadge } from './components/BrandBadge'
import './index.css'

// Hook para animaciones al hacer scroll
function useScrollAnimation(threshold = 0.2) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// Componente de número animado
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, isVisible } = useScrollAnimation()

  useEffect(() => {
    if (!isVisible) return

    let start = 0
    const duration = 2000
    const increment = value / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const TELEGRAM_BOT_URL = 'https://t.me/agentzfactory_bot'

  const heroRef = useScrollAnimation()
  const statsRef = useScrollAnimation()
  const howItWorksRef = useScrollAnimation()
  const featuresRef = useScrollAnimation()
  const ctaRef = useScrollAnimation()

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs that follow mouse */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[150px] transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,0,0.4) 0%, transparent 70%)',
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Static ambient glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Animated particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-500/30 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`
            }}
          />
        ))}
      </div>

      {/* Navigation with blur effect */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center glow-red animate-pulse-glow group-hover:scale-110 transition-transform duration-300">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Agentz<span className="text-red-500">Factory</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['How it Works', 'Features', 'Stats'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-gray-400 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <a 
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 transition-all font-semibold text-sm glow-red-hover hover:scale-105"
          >
            <MessageCircle className="w-4 h-4" />
            Start Building
          </a>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div 
            ref={heroRef.ref}
            className={`transition-all duration-1000 ${heroRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {/* Badge with animation */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-red-500/20 mb-8 hover:border-red-500/40 transition-colors cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Powered by AI. Built on Telegram.
              </span>
              <Sparkles className="w-4 h-4 text-red-400 group-hover:rotate-12 transition-transform" />
            </div>

            {/* Main headline with staggered animation */}
            <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9]">
              <span className="block animate-slide-up" style={{ animationDelay: '0.1s' }}>
                The AI that
              </span>
              <span className="block text-gradient animate-slide-up" style={{ animationDelay: '0.2s' }}>
                builds apps.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Describe your idea in Telegram. Get a working web app in minutes. 
              <span className="text-white font-semibold"> No coding required.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <a 
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 transition-all font-bold text-lg glow-red-hover hover:scale-105 hover:-translate-y-1"
              >
                <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Start Building on Telegram
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a 
                href="https://github.com/reflecterlabs/agentzfactory"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all font-semibold text-lg hover:scale-105"
              >
                <Github className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                View on GitHub
              </a>
            </div>

            <p className="mt-8 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              Free to start. No credit card required.
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </section>

      {/* SECTION 2: STATS */}
      <section id="stats" className="relative py-24 px-6 border-y border-white/5">
        <div 
          ref={statsRef.ref}
          className="max-w-6xl mx-auto"
        >
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 ${statsRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {[
              { value: 10000, suffix: '+', label: 'Apps Generated' },
              { value: 30, suffix: 's', label: 'Avg. Build Time' },
              { value: 99, suffix: '%', label: 'Uptime' },
              { value: 0, suffix: '$', label: 'To Start' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/20 transition-all hover:scale-105 group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl sm:text-5xl font-black text-gradient mb-2 group-hover:scale-110 transition-transform">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={howItWorksRef.ref}
            className={`text-center mb-20 transition-all duration-1000 ${howItWorksRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6">
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
                description: 'Open your Telegram app and tell our bot what you want to build. Describe your idea in natural language.'
              },
              {
                step: '02',
                icon: <Code2 className="w-8 h-8" />,
                title: 'AI Generates Code',
                description: 'Our AI understands your requirements and generates production-ready React code with modern stack.'
              },
              {
                step: '03',
                icon: <Globe className="w-8 h-8" />,
                title: 'Deploy Instantly',
                description: 'Your app is automatically deployed to the cloud. Get your URL in seconds and share it immediately.'
              }
            ].map((item, i) => (
              <div 
                key={i}
                ref={useScrollAnimation().ref}
                className={`relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group ${useScrollAnimation().isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-4 text-8xl font-black text-white/[0.03] group-hover:text-red-500/10 transition-colors">
                  {item.step}
                </div>
                
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-red-500/50 to-transparent" />
                )}
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600/20 to-red-500/20 flex items-center justify-center mb-6 text-red-500 group-hover:from-red-600/30 group-hover:to-red-500/30 group-hover:scale-110 transition-all">
                    {item.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES */}
      <section id="features" className="relative py-32 px-6 bg-gradient-to-b from-black via-dark to-black">
        <div className="max-w-6xl mx-auto">
          <div 
            ref={featuresRef.ref}
            className={`grid md:grid-cols-2 gap-8 transition-all duration-1000 ${featuresRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Lightning Fast',
                description: 'Get your app in under 30 seconds. Our AI is optimized for speed without compromising quality.'
              },
              {
                icon: <Rocket className="w-6 h-6" />,
                title: 'Instant Deploy',
                description: 'Every app is automatically deployed to a global CDN. Share your URL immediately.'
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI-Powered',
                description: 'State-of-the-art language models understand your intent and generate clean, modern code.'
              },
              {
                icon: <Code2 className="w-6 h-6" />,
                title: 'Best Practices',
                description: 'Generated code follows industry standards: TypeScript, React, Tailwind CSS.'
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/30 hover:bg-white/[0.04] transition-all duration-300 group hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 text-red-500 group-hover:bg-red-500/20 group-hover:scale-110 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA */}
      <section className="relative py-32 px-6">
        <div 
          ref={ctaRef.ref}
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${ctaRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="relative p-12 sm:p-16 rounded-[2.5rem] bg-gradient-to-br from-red-600/20 via-red-500/10 to-transparent border border-red-500/20 overflow-hidden group hover:border-red-500/40 transition-all">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.3),transparent_70%)] animate-pulse" />
            </div>
            
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6">
                Ready to build?
                <br />
                <span className="text-gradient">Start for free.</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto">
                Join thousands of creators building the future, one message at a time.
              </p>

              <a 
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl bg-white text-black hover:bg-gray-100 transition-all font-bold text-lg hover:scale-105 hover:-translate-y-1 group"
              >
                <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Open in Telegram
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <p className="mt-6 text-sm text-gray-500">
                No signup. No credit card. Just build.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                Agentz<span className="text-red-500">Factory</span>
              </span>
            </div>

            <div className="flex items-center gap-6">
              {[
                { icon: <MessageCircle className="w-5 h-5" />, href: TELEGRAM_BOT_URL },
                { icon: <Github className="w-5 h-5" />, href: 'https://github.com/reflecterlabs/agentzfactory' },
                { icon: <Twitter className="w-5 h-5" />, href: '#' },
                { icon: <Mail className="w-5 h-5" />, href: 'mailto:hello@agentzfactory.com' },
              ].map((link, i) => (
                <a 
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all hover:scale-110"
                >
                  {link.icon}
                </a>
              ))}
            </div>

            <p className="text-sm text-gray-600">
              © 2026 AgentzFactory.com
            </p>
          </div>
        </div>
      </footer>

      {/* Brand Badge */}
      <BrandBadge position="bottom-right" />
    </div>
  )
}

export default App
