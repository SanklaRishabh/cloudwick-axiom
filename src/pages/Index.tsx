import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-900 via-slate-800 to-teal-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="flowing-lines">
          <div className="flow-line flow-line-1"></div>
          <div className="flow-line flow-line-2"></div>
          <div className="flow-line flow-line-3"></div>
          <div className="flow-line flow-line-4"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-white font-lato text-2xl font-bold">Cloudwick</span>
          <span className="text-gray-300 font-lato text-2xl font-light">Axiom</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            Log In
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center min-h-[calc(100vh-100px)] px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              The platform for reliable agents.
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
              Tools for every step of the agent development lifecycle
              – built to unlock powerful AI in production.
            </p>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/auth')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 text-lg rounded-full"
              >
                Request a demo
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white px-8 py-3 text-lg rounded-full"
              >
                See the docs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .flowing-lines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          .flow-line {
            position: absolute;
            width: 200%;
            height: 3px;
            background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), rgba(236, 72, 153, 0.6), transparent);
            animation: flow 15s infinite linear;
            opacity: 0.8;
          }

          .flow-line-1 {
            top: 20%;
            transform: rotate(-15deg);
            animation-delay: 0s;
            animation-duration: 12s;
          }

          .flow-line-2 {
            top: 40%;
            transform: rotate(-10deg);
            animation-delay: -3s;
            animation-duration: 15s;
            background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), rgba(168, 85, 247, 0.5), transparent);
          }

          .flow-line-3 {
            top: 60%;
            transform: rotate(-20deg);
            animation-delay: -6s;
            animation-duration: 18s;
            background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.4), rgba(244, 114, 182, 0.4), transparent);
          }

          .flow-line-4 {
            top: 80%;
            transform: rotate(-8deg);
            animation-delay: -9s;
            animation-duration: 20s;
            background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3), rgba(139, 92, 246, 0.3), transparent);
          }

          @keyframes flow {
            0% {
              transform: translateX(-100%) rotate(-15deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateX(100%) rotate(-15deg);
              opacity: 0;
            }
          }

          .flow-line-1 {
            animation: flow-1 12s infinite linear;
          }
          .flow-line-2 {
            animation: flow-2 15s infinite linear;
            animation-delay: -3s;
          }
          .flow-line-3 {
            animation: flow-3 18s infinite linear;
            animation-delay: -6s;
          }
          .flow-line-4 {
            animation: flow-4 20s infinite linear;
            animation-delay: -9s;
          }

          @keyframes flow-1 {
            0% { transform: translateX(-100%) rotate(-15deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(100%) rotate(-15deg); opacity: 0; }
          }
          @keyframes flow-2 {
            0% { transform: translateX(-100%) rotate(-10deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(100%) rotate(-10deg); opacity: 0; }
          }
          @keyframes flow-3 {
            0% { transform: translateX(-100%) rotate(-20deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(100%) rotate(-20deg); opacity: 0; }
          }
          @keyframes flow-4 {
            0% { transform: translateX(-100%) rotate(-8deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(100%) rotate(-8deg); opacity: 0; }
          }
        `
      }} />
    </div>
  );
};

export default Index;