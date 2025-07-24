
import React from 'react';
import WavyAnimation from './WavyAnimation';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';
import { useAuthTheme } from '@/contexts/AuthThemeContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showWireframe?: boolean;
}

const AuthLayout = ({ children, title, subtitle = "Knowledge awaits you", showWireframe = true }: AuthLayoutProps) => {
  const { isDark, toggleTheme } = useAuthTheme();

  return (
    <div className={`min-h-screen flex transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/50'}`}>
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3 p-3 bg-white/20 backdrop-blur-lg rounded-full border border-white/30 shadow-lg">
        <Sun className={`w-4 h-4 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-amber-500'}`} />
        <Switch
          checked={isDark}
          onCheckedChange={toggleTheme}
          className="data-[state=checked]:bg-gradient-primary data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-amber-400 data-[state=unchecked]:to-orange-500"
        />
        <Moon className={`w-4 h-4 transition-colors duration-300 ${isDark ? 'text-purple-400' : 'text-gray-400'}`} />
      </div>

      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md animate-fade-in">
          <div className={`p-8 backdrop-blur-xl rounded-2xl border shadow-2xl card-glass transition-all duration-500 ${
            isDark 
              ? 'bg-gray-900/80 border-gray-700/50 text-white' 
              : 'bg-white/60 border-white/20 text-gray-900'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CW</span>
              </div>
              <div>
                <span className="bg-gradient-to-r from-teal-700 via-slate-700 to-teal-700 bg-clip-text text-transparent font-bold text-xl font-lato">Cloudwick</span>
                <span className={`font-lato text-xl font-light ml-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Axiom</span>
              </div>
            </div>
            <h1 className={`text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent`}>{title}</h1>
            <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>
            
            {/* Form Section */}
            <div className="mt-8">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Enhanced Wave Animation */}
      {showWireframe && (
        <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-teal-900/10 via-slate-800/20 to-purple-900/10">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5"></div>
          <WavyAnimation isDark={isDark} />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
