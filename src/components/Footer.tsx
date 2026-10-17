import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { 
  Mail, 
  MapPin, 
  Check, 
  MessageCircle, 
  Sparkles, 
  Linkedin, 
  Facebook, 
  Instagram,
  Globe,
  BookOpen
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const { isClinical } = useTheme();
  const { data } = usePortfolio();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(data.profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <footer
      className={`relative py-12 transition-colors duration-300 overflow-hidden ${
        isClinical
          ? 'bg-slate-50 text-slate-700'
          : 'bg-slate-950 text-slate-300'
      }`}
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center space-y-8 text-center">
        
        {/* Interactive Icon Row for Social Networks & Contact Channels with Hover Animations */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Email Icon */}
          <motion.button
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyEmail}
            title={`Email: ${data.profile.email} (Click to copy)`}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-md ${
              isClinical
                ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-400 hover:shadow-purple-200/50'
                : 'bg-slate-900 border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-900/40 hover:shadow-purple-500/20'
            }`}
            aria-label="Copy Email"
          >
            {copiedEmail ? <Check className="w-5 h-5 text-emerald-400" /> : <Mail className="w-5 h-5" />}
          </motion.button>

          {/* WhatsApp Icon */}
          <motion.a
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.95 }}
            href={data.profile.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp Chat"
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-md ${
              isClinical
                ? 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-emerald-200/50'
                : 'bg-slate-900 border-emerald-500/30 text-emerald-400 hover:text-white hover:border-emerald-400 hover:bg-emerald-950/40 hover:shadow-emerald-500/20'
            }`}
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.a>

          {/* Location / Maps Icon */}
          <motion.a
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.95 }}
            href="https://maps.google.com/?q=Vatara%2C+Gulshan%2C+Dhaka%2C+Bangladesh"
            target="_blank"
            rel="noopener noreferrer"
            title={`Location: ${data.profile.location}`}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-md ${
              isClinical
                ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-400 hover:shadow-purple-200/50'
                : 'bg-slate-900 border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-900/40 hover:shadow-purple-500/20'
            }`}
            aria-label="Location Maps"
          >
            <MapPin className="w-5 h-5" />
          </motion.a>

          {/* LinkedIn Icon */}
          <motion.a
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.95 }}
            href={data.profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn Profile"
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-md ${
              isClinical
                ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 hover:shadow-blue-200/50'
                : 'bg-slate-900 border-blue-500/30 text-blue-400 hover:text-white hover:border-blue-400 hover:bg-blue-950/40 hover:shadow-blue-500/20'
            }`}
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </motion.a>

          {/* Facebook Icon */}
          <motion.a
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.95 }}
            href={data.profile.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook Profile"
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-md ${
              isClinical
                ? 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 hover:shadow-indigo-200/50'
                : 'bg-slate-900 border-indigo-500/30 text-indigo-400 hover:text-white hover:border-indigo-400 hover:bg-indigo-950/40 hover:shadow-indigo-500/20'
            }`}
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </motion.a>

          {/* Instagram Icon */}
          <motion.a
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.95 }}
            href={data.profile.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Profile"
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-md ${
              isClinical
                ? 'bg-white border-pink-200 text-pink-700 hover:bg-pink-50 hover:border-pink-400 hover:shadow-pink-200/50'
                : 'bg-slate-900 border-pink-500/30 text-pink-400 hover:text-white hover:border-pink-400 hover:bg-pink-950/40 hover:shadow-pink-500/20'
            }`}
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </motion.a>

          {/* Google Blogger Icon */}
          {data.profile.bloggerUrl && (
            <motion.a
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.95 }}
              href={data.profile.bloggerUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Google Blogger"
              className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-md ${
                isClinical
                  ? 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-400 hover:shadow-orange-200/50'
                  : 'bg-slate-900 border-orange-500/30 text-orange-400 hover:text-white hover:border-orange-400 hover:bg-orange-950/40 hover:shadow-orange-500/20'
              }`}
              aria-label="Google Blogger"
            >
              {/* Blogger Emblem */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19.5 2H4.5C3.12 2 2 3.12 2 4.5v15C2 20.88 3.12 22 4.5 22h15c1.38 0 2.5-1.12 2.5-2.5v-15C22 3.12 20.88 2 19.5 2zm-4.38 8.12c0 .76-.62 1.38-1.38 1.38.76 0 1.38.62 1.38 1.38v2.24c0 1.38-1.12 2.5-2.5 2.5H8.76c-1.38 0-2.5-1.12-2.5-2.5V8.88c0-1.38 1.12-2.5 2.5-2.5h3.86c1.38 0 2.5 1.12 2.5 2.5v1.24zM8.76 8.38c-.28 0-.5.22-.5.5v2.24c0 .28.22.5.5.5h3.38c.28 0 .5-.22.5-.5V8.88c0-.28-.22-.5-.5-.5H8.76zm3.88 7.24c0 .28-.22.5-.5.5H8.76c-.28 0-.5-.22-.5-.5v-2.24c0-.28.22-.5.5-.5h3.38c.28 0 .5.22.5.5v2.24z" />
              </svg>
            </motion.a>
          )}

          {/* Any Custom Social Links Added via Dashboard */}
          {data.profile.customSocialLinks && data.profile.customSocialLinks.map((custom) => (
            <motion.a
              key={custom.id}
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.95 }}
              href={custom.url}
              target="_blank"
              rel="noopener noreferrer"
              title={custom.platform}
              className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer shadow-md ${
                isClinical
                  ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-400'
                  : 'bg-slate-900 border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-950/40'
              }`}
              aria-label={custom.platform}
            >
              <Globe className="w-5 h-5" />
            </motion.a>
          ))}
        </div>

        {/* Centered Footer Badge with Active Status & Correct Spelling: Lubna Akter Portfolio */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-md cursor-default group transition-all shadow-lg ${
            isClinical
              ? 'bg-white border-purple-200 shadow-purple-500/10'
              : 'bg-slate-900/90 border-purple-500/35 shadow-purple-950/50'
          }`}
        >
          {/* Active Status Indicator (Pulsing green dot) */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>

          <span className={`text-sm sm:text-base font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r ${
            isClinical
              ? 'from-purple-800 via-indigo-700 to-purple-900 font-bold'
              : 'from-purple-200 via-indigo-100 to-purple-300'
          }`}>
            Lubna Akter Portfolio
          </span>
        </motion.div>

      </div>
    </footer>
  );
};
