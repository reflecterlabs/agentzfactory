import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

export function BrandBadge({ position = 'bottom-right' }: { position?: 'bottom-right' | 'bottom-left' }) {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const isDismissed = localStorage.getItem('agentzfactory-badge-dismissed');
      if (!isDismissed) {
        setVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('agentzfactory-badge-dismissed', 'true');
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  if (!visible) return null;

  return (
    <div 
      className={`fixed ${positionClasses} z-50 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="w-10 h-10 bg-blood flex items-center justify-center hover:bg-white transition-colors group"
          aria-label="Show badge"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-black">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      ) : (
        <div className="border border-white/20 bg-darker p-4 max-w-xs relative"
        >
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-blood" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-blood" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-blood" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-blood" />

          <div className="flex items-start gap-3"
          >
            <div className="w-10 h-10 bg-blood flex items-center justify-center flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-black">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>

            <div className="flex-1"
            >
              <p className="text-sm font-bold text-white font-mono">
                AGENTZFACTORY
              </p>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                BUILD_WITHOUT_CODE
              </p>
              
              <a
                href="https://t.me/agentzfactory_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blood hover:text-white mt-2 font-mono transition-colors"
              >
                OPEN_PROTOCOL
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-1"
            >
              <button
                onClick={() => setMinimized(true)}
                className="p-1 text-gray-500 hover:text-white transition-colors"
              >
                <span className="text-xs font-mono">[−]</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 text-gray-500 hover:text-blood transition-colors"
              >
                <span className="text-xs font-mono">[×]</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
