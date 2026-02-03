import { useEffect, useState, useRef } from 'react'
import { BrandBadge } from './components/BrandBadge'
import './index.css'

// Hook para animación al scroll
function useScrollReveal() {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// Componente Runa SVG
const Runa = ({ type, className }: { type: number; className?: string }) => {
  const runes = [
    // Runa 1: Triángulo invertido con línea
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M50 10 L90 80 L10 80 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <line x1="50" y1="10" x2="50" y2="80" stroke="currentColor" strokeWidth="2"/>
      <circle cx="50" cy="50" r="8" fill="currentColor"/>
    </svg>,
    // Runa 2: Cruz con círculos
    <svg viewBox="0 0 100 100" className={className}>
      <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="3"/>
      <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="3"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="50" cy="50" r="5" fill="currentColor"/>
    </svg>,
    // Runa 3: Hexágono
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M50 25 L75 37.5 L75 62.5 L50 75 L25 62.5 L25 37.5 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="50" cy="50" r="10" fill="currentColor"/>
    </svg>,
    // Runa 4: Ojo
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M10 50 Q50 10 90 50 Q50 90 10 50" fill="none" stroke="currentColor" strokeWidth="3"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="50" cy="50" r="10" fill="currentColor"/>
      <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    </svg>,
    // Runa 5: Triángulos anidados
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M50 5 L95 85 L5 85 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M50 25 L80 77 L20 77 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
      <path d="M50 45 L65 71 L35 71 Z" fill="currentColor"/>
    </svg>,
  ]
  return runes[type % runes.length] || runes[0]
}

// Símbolo geométrico decorativo
const GeoSymbol = ({ variant }: { variant: number }) => {
  const symbols = [
    <div className="w-32 h-32 border border-blood/30 rotate-45 animate-pulse-rune"/>,
    <div className="w-24 h-24 border-2 border-blood/20 rotate-12"/>,
    <div className="w-16 h-16 bg-blood/10 rotate-45"/>,
  ]
  return symbols[variant % symbols.length]
}

// Grid de píxeles decorativo
const PixelGrid = () => (
  <div className="grid grid-cols-8 gap-1 opacity-20">
    {[...Array(64)].map((_, i) => (
      <div 
        key={i} 
        className={`w-2 h-2 ${Math.random() > 0.7 ? 'bg-blood' : 'bg-white/20'}`}
        style={{ animationDelay: `${i * 0.05}s` }}
      />
    ))}
  </div>
)

function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useScrollReveal()
  const middleRef = useScrollReveal()
  const footerRef = useScrollReveal()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const TELEGRAM_BOT_URL = 'https://t.me/agentzfactory_bot'

  return (
    <div className="min-h-screen bg-dark text-white overflow-x-hidden font-sans noise-overlay">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,0,51,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,0,51,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Runas flotantes */}
        <div className="absolute top-20 left-10 w-20 h-20 text-blood/30 animate-float-rune">
          <Runa type={0} className="w-full h-full" />
        </div>
        <div className="absolute top-40 right-20 w-16 h-16 text-blood/20 animate-float-rune" style={{ animationDelay: '2s' }}>
          <Runa type={1} className="w-full h-full" />
        </div>
        <div className="absolute bottom-40 left-20 w-24 h-24 text-blood/20 animate-float-rune" style={{ animationDelay: '4s' }}>
          <Runa type={2} className="w-full h-full" />
        </div>
      </div>

      {/* Navigation minimalista */}
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blood pixel-corners">
              <Runa type={4} className="w-full h-full text-black p-1" />
            </div>
            <span className="font-bold text-lg tracking-widest uppercase">
              Agentz
              <span className="text-blood">Factory</span>
            </span>
          </div>

          <a 
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 border border-blood text-blood hover:bg-blood hover:text-black transition-all duration-300 font-mono text-sm tracking-wider uppercase"
          >
            Enter
          </a>
        </div>
      </nav>

      {/* SECTION 1: HERO - 2 Column Layout */}
      <section className="relative min-h-screen flex items-center pt-20"
      >
        {/* Elemento asomando izquierda */}
        <div 
          className="absolute left-0 top-1/4 w-24 h-64 bg-blood/10 -translate-x-1/2 hidden lg:block"
          style={{ transform: `translateX(${mousePos.x * 0.5}px)` }}
        >
          <Runa type={3} className="w-full h-full text-blood/30 p-4" />
        </div>

        {/* Elemento asomando derecha */}
        <div 
          className="absolute right-0 bottom-1/4 w-32 h-48 bg-gradient-to-l from-blood/20 to-transparent translate-x-1/2 hidden lg:block"
          style={{ transform: `translateX(${-mousePos.x * 0.5}px)` }}
        >
          <div className="h-full flex flex-col justify-center items-end pr-4 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-16 h-px bg-blood/40" />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full">
          <div 
            ref={heroRef.ref}
            className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-1000 ${heroRef.isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Columna Izquierda - Texto */}
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-blood" />
                <span className="text-blood font-mono text-sm tracking-widest uppercase">
                  v2.5.0 // Protocol
                </span>
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] mb-8">
                <span className="block glitch-wrapper" data-text="BUILD">
                  BUILD
                </span>
                <span className="block text-transparent stroke-text" style={{ WebkitTextStroke: '2px #ff0033' }}>
                  WITHOUT
                </span>
                <span className="block text-blood">
                  CODE
                </span>
              </h1>

              <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
                Describe your application in Telegram. 
                Our neural architecture generates production-ready 
                React applications in seconds.
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href={TELEGRAM_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-8 py-4 bg-blood text-black font-bold hover:bg-white transition-all duration-300 pixel-corners flex items-center gap-3"
                >
                  <span className="font-mono">INITIATE_SEQUENCE</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>

              <div className="mt-12 flex items-center gap-8">
                {[
                  { value: '10K+', label: 'DEPLOYS' },
                  { value: '<30s', label: 'BUILD TIME' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-black text-blood">{stat.value}</div>
                    <div className="text-xs font-mono text-gray-500 tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha - Visual */}
            <div className="order-1 lg:order-2 relative"
            >
              {/* Marco decorativo */}
              <div className="absolute -inset-4 border border-blood/20 pointer-events-none"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)'
                }}
              />
              
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-blood" />
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-blood" />

              {/* Contenido visual */}
              <div 
                className="relative bg-darker p-8 pixel-corners scanlines"
                style={{
                  transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
                }}
              >
                <div className="aspect-square flex items-center justify-center relative"
                >
                  {/* Runa central grande */}
                  <div className="w-48 h-48 text-blood animate-pulse-rune">
                    <Runa type={4} className="w-full h-full" />
                  </div>

                  {/* Elementos orbitales */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-blood" />
                  </div>
                  
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 border border-blood" />
                  </div>

                  {/* Círculos concéntricos */}
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute border border-blood/20 rounded-full"
                      style={{
                        width: `${(i + 1) * 120}px`,
                        height: `${(i + 1) * 120}px`,
                        animationDelay: `${i * 0.5}s`
                      }}
                    />
                  ))}
                </div>

                {/* Grid de datos */}
                <div className="mt-8 grid grid-cols-4 gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2 ${i % 3 === 0 ? 'bg-blood' : 'bg-white/10'}`}
                      style={{ width: `${Math.random() * 60 + 40}%` }}
                    />
                  ))}
                </div>

                {/* Texto técnico */}
                <div className="mt-4 font-mono text-xs text-blood/60">
                  &gt; SYSTEM.INIT()<br/>
                  &gt; LOADING NEURAL_NET...<br/>
                  &gt; STATUS: OPERATIONAL
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MIDDLE - Manifesto/Capabilities */}
      <section className="relative py-32 border-t border-b border-white/5"
      >
        {/* Elementos laterales decorativos */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ transform: `translate(${mousePos.x * 0.3}px, -50%)` }}
        >
          <div className="w-32 h-64 border border-blood/20 rotate-12">
            <div className="w-full h-full flex items-center justify-center">
              <Runa type={2} className="w-16 h-16 text-blood/30" />
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-1/3 translate-x-1/2 hidden xl:block"
          style={{ transform: `translate(${-mousePos.x * 0.3}px, 0)` }}
        >
          <div className="w-24 h-48 bg-blood/5 flex flex-col items-center justify-center gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1 h-8 bg-blood/30" />
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6"
        >
          <div 
            ref={middleRef.ref}
            className={`transition-all duration-1000 ${middleRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
          >
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-8 h-px bg-blood" />
                <span className="text-blood font-mono text-xs tracking-[0.3em]">PROTOCOLS</span>
                <div className="w-8 h-px bg-blood" />
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8">
                <span className="text-white">MANIFESTO</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-white/10"
            >
              {[
                {
                  title: 'TELEGRAM',
                  subtitle: 'INTERFACE',
                  desc: 'Native chat integration. No new apps to install.',
                  rune: 0
                },
                {
                  title: 'NEURAL',
                  subtitle: 'GENERATION',
                  desc: 'State-of-the-art models translate intent to code.',
                  rune: 1
                },
                {
                  title: 'INSTANT',
                  subtitle: 'DEPLOYMENT',
                  desc: 'Global CDN in seconds. Share immediately.',
                  rune: 3
                }
              ].map((item, i) => (
                <div 
                  key={i}
                  className="group bg-dark p-8 hover:bg-darker transition-all duration-500"
                >
                  <div className="flex items-start justify-between mb-6"
                  >
                    <div className="w-12 h-12 text-blood/40 group-hover:text-blood transition-colors"
                    >
                      <Runa type={item.rune} className="w-full h-full" />
                    </div>
                    
                    <span className="font-mono text-xs text-gray-600">0{i + 1}</span>
                  </div>

                  <div className="mb-4"
                  >
                    <div className="text-2xl font-black text-white group-hover:text-blood transition-colors">
                      {item.title}
                    </div>
                    
                    <div className="text-sm font-mono text-gray-500">
                      {item.subtitle}
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="mt-6 w-full h-px bg-gradient-to-r from-blood/0 via-blood/30 to-blood/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>

            {/* CTA secundario */}
            <div className="mt-16 text-center"
            >
              <a 
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 px-10 py-5 border border-blood text-blood hover:bg-blood hover:text-black transition-all duration-300 font-mono uppercase tracking-wider group"
              >
                <span>Initialize Protocol</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FOOTER / TERMINAL */}
      <section className="relative py-24 px-6"
      >
        <div 
          ref={footerRef.ref}
          className={`max-w-4xl mx-auto transition-all duration-1000 ${footerRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
        >
          {/* Terminal window */}
          <div className="border border-white/20 bg-darker"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5"
            >
              <div className="w-3 h-3 rounded-full bg-blood" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <span className="ml-4 font-mono text-xs text-gray-500">terminal — agentzfactory</span>
            </div>

            <div className="p-8 font-mono text-sm"
            >
              <div className="text-gray-500 mb-4">
                $ whoami<br/>
                <span className="text-blood">builder</span>@agentzfactory.com
              </div>

              <div className="text-gray-500 mb-4">
                $ connect telegram<br/>
                <span className="text-green-400">✓ Connected to @agentzfactory_bot</span>
              </div>

              <div className="text-gray-500 mb-8">
                $ start project<br/>
                <span className="animate-pulse">_</span>
              </div>

              <a 
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-4 bg-blood text-black text-center font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                EXECUTE
              </a>
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blood" />
              <span>AGENTZFACTORY.COM // 2026</span>
            </div>

            <div className="flex gap-8">
              {['GITHUB', 'TELEGRAM', 'DOCS'].map((link) => (
                <a 
                  key={link}
                  href={link === 'TELEGRAM' ? TELEGRAM_BOT_URL : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blood transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BrandBadge position="bottom-right" />
    </div>
  )
}

export default App
