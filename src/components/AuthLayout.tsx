
import React from 'react';
import WavyAnimation from './WavyAnimation';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  showWireframe?: boolean;
}

const AuthLayout = ({ children, title, showWireframe = true }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-cloudwick-blue font-lato text-lg font-medium">Cloudwick</span>
              <span className="text-white font-lato text-lg font-light">Axiom</span>
            </div>
            <h1 className="text-white text-2xl font-medium mb-2">{title}</h1>
            <p className="text-gray-400 text-sm">Knowledge awaits you</p>
          </div>
          {children}
        </div>
      </div>

      {/* Right Panel - Animated Waves */}
      {showWireframe && (
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-gradient-to-br from-teal-900/20 via-slate-800/30 to-teal-900/20">
          <div className="w-full max-w-lg aspect-square bg-gradient-to-br from-teal-900/10 to-slate-800/20 rounded-lg flex items-center justify-center relative border-4 border-cloudwick-blue overflow-hidden">
            <WavyAnimation />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
