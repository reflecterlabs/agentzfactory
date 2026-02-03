import { useState, useEffect } from 'react';
import { Bot, X, ExternalLink } from 'lucide-react';

interface BrandBadgeProps {
  position?: 'bottom-right' | 'bottom-left';
}

export function BrandBadge({ position = 'bottom-right' }: BrandBadgeProps) {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Delay showing the badge for better UX
    const timer = setTimeout(() => {
      const isDismissed = localStorage.getItem('agentzfactory-badge-dismissed');
      if (!isDismissed) {
        setVisible(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('agentzfactory-badge-dismissed', 'true');
  };

  const handleMinimize = () => {
    setMinimized(true);
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  if (dismissed) return null;

  return (
    <div 
      className={`fixed ${positionClasses} z-50 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {minimized ? (
        // Minimized state - floating button
        <button
          onClick={() => setMinimized(false)}
          className="group relative w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 glow-red"
          aria-label="Show AgentzFactory badge"
        >
          <Bot className="w-6 h-6 text-white" />
          
          {/* Subtle pulse animation */}
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
        </button>
      ) : (
        // Expanded state
        <div className="glass rounded-2xl p-4 max-w-xs border border-red-500/20 shadow-2xl animate-fade-in">
          <div className="flex items-start gap-3">
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center flex-shrink-0 glow-red">
              <Bot className="w-7 h-7 text-white" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">
                Built with AgentzFactory
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Create your own web apps directly in Telegram
              </p>
              
              <a
                href="https://t.me/agentzfactory_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 mt-2 transition-colors"
              >
                Start building
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col gap-1 -mt-1 -mr-1">
              <button
                onClick={handleMinimize}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Minimize badge"
              >
                <span className="text-xs font-bold">−</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="Dismiss badge"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Progress bar for auto-minimize (optional visual cue) */}
          <div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
