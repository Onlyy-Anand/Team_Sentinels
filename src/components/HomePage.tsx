import { ArrowRight, Heart, Brain, Zap } from 'lucide-react';
import { WaveAnimation } from './WaveAnimation';
import { Navbar } from './Navbar';

interface HomePageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onCopilotClick: () => void;
}

export function HomePage({ onLoginClick, onSignupClick, onCopilotClick }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onCopilotClick={onCopilotClick}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8 inline-block">
            <div className="px-4 py-2 rounded-full border border-purple-400/30 bg-purple-500/10 backdrop-blur-sm">
              <span className="text-sm font-medium text-white">
                ✨ Your Personal Emotional Companion
              </span>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
            Connect with Your
            <br />
            Inner Self
          </h1>

          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Experience compassionate, AI-powered emotional support. Share your thoughts, feelings, and experiences in a safe space designed just for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onCopilotClick}
              className="group relative px-8 py-4 rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-100"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
              <span className="relative flex items-center justify-center gap-2 text-white">
                Start Chatting
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={onSignupClick}
              className="group px-8 py-4 rounded-lg font-semibold border-2 border-white/50 bg-white/5 text-white hover:border-white/70 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 text-lg backdrop-blur-sm"
            >
              Create Account
            </button>
          </div>

          {/* Wave Animation */}
          <div className="absolute bottom-0 left-0 right-0 h-64 z-0">
            <WaveAnimation />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
              How It Works
            </h2>
            <p className="text-white/80 text-lg">
              Experience emotional intelligence with advanced understanding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Emotional Recognition",
                description: "Advanced AI detects and understands your emotional nuances with depth and sensitivity"
              },
              {
                icon: Brain,
                title: "Psychological Insight",
                description: "Receive thoughtful guidance backed by psychological principles and human understanding"
              },
              {
                icon: Zap,
                title: "Real-Time Support",
                description: "Get instant, meaningful responses that adapt to your emotional state and conversation flow"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-gradient-to-br from-purple-900/40 to-pink-900/20 border border-purple-500/20 rounded-xl p-8 hover:border-pink-400/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 rounded-xl transition-all duration-300"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:shadow-pink-500/20 transition-shadow">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-12 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to Transform Your Emotional Well-being?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands of people taking meaningful steps toward better emotional health
            </p>
            <button
              onClick={onSignupClick}
              className="group relative px-8 py-4 rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-100"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
              <span className="relative text-white">Get Started Now</span>
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
