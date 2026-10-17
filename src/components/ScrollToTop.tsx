import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();
  const { isClinical } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      // Reveal button after user has scrolled past hero section (~500px)
      if (window.scrollY > 480) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={scrollToTop}
          aria-label={t.footer.backToTop || 'Scroll to top'}
          title={t.footer.backToTop || 'Scroll to top'}
          className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 cursor-pointer group hover:scale-105 active:scale-95 ${
            isClinical
              ? 'bg-white/95 hover:bg-purple-50 text-purple-700 hover:text-purple-900 border-purple-300 shadow-xl shadow-purple-500/15'
              : 'bg-slate-900/90 hover:bg-purple-950/80 text-purple-200 hover:text-white border-purple-400/50 shadow-2xl shadow-purple-950/60'
          }`}
          style={{
            boxShadow: isClinical
              ? '0 10px 25px -5px rgba(124, 58, 237, 0.2), 0 4px 10px -2px rgba(124, 58, 237, 0.1)'
              : '0 0 24px -2px rgba(168, 85, 247, 0.35), 0 8px 16px -4px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Subtle lavender ambient pulse ring */}
          <span className="absolute -inset-1 rounded-2xl bg-purple-500/20 blur-sm group-hover:bg-purple-500/30 transition-all pointer-events-none" />
          
          <div className="relative flex items-center justify-center">
            <ArrowUp className={`w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1 ${
              isClinical ? 'text-purple-700 group-hover:text-purple-900' : 'text-purple-300 group-hover:text-purple-100'
            }`} />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
