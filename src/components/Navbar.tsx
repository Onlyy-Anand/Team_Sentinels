import { Zap } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onCopilotClick: () => void;
}

export function Navbar({ onLoginClick, onSignupClick, onCopilotClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-sm border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            EmoCompanion
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onCopilotClick}
            className="group relative px-6 py-2.5 rounded-lg font-medium text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-100 group-hover:opacity-110 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
            <span className="relative flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Copilot
            </span>
          </button>

          <button
            onClick={onLoginClick}
            className="group px-6 py-2.5 rounded-lg font-medium text-white/80 border border-white/30 hover:border-white/50 transition-all duration-300 hover:text-white hover:bg-white/10 active:scale-95"
          >
            Sign In
          </button>

          <button
            onClick={onSignupClick}
            className="group relative px-6 py-2.5 rounded-lg font-medium text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/10 opacity-100"></div>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative text-white">Sign Up</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
