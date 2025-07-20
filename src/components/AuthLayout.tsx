
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
    <div className={`min-h-screen flex ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#fafafa]'}`}>
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <Sun className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-amber-500'}`} />
        <Switch
          checked={isDark}
          onCheckedChange={toggleTheme}
          className="data-[state=checked]:bg-gray-600 data-[state=unchecked]:bg-amber-200"
        />
        <Moon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-gray-400'}`} />
      </div>

      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <span className={`font-lato text-lg font-medium ${isDark ? 'text-cloudwick-blue' : 'text-blue-600'}`}>Cloudwick</span>
              <span className={`font-lato text-lg font-light ${isDark ? 'text-white' : 'text-gray-800'}`}>Axiom</span>
            </div>
            <h1 className={`text-2xl font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      {/* Right Panel - Full Wave Animation */}
      {showWireframe && (
        <div className={`flex-1 relative overflow-hidden ${isDark 
          ? 'bg-gradient-to-br from-teal-900/20 via-slate-800/30 to-teal-900/20' 
          : 'bg-gradient-to-br from-blue-100/40 via-slate-100/30 to-blue-100/40'
        }`}>
          <WavyAnimation isDark={isDark} />
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
