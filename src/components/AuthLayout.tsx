
import React from 'react';

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
            <h1 className="text-white text-2xl font-lexend font-medium mb-2">{title}</h1>
            <p className="text-gray-400 font-lexend text-sm">Knowledge awaits you</p>
          </div>
          {children}
        </div>
      </div>

      {/* Right Panel - Wireframe */}
      {showWireframe && (
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-lg aspect-square bg-gray-200 rounded-lg flex items-center justify-center relative border-4 border-cloudwick-blue">
            {/* X wireframe pattern */}
            <svg 
              className="w-full h-full absolute inset-0" 
              viewBox="0 0 400 400" 
              fill="none"
            >
              <line 
                x1="50" 
                y1="50" 
                x2="350" 
                y2="350" 
                stroke="#3374DF" 
                strokeWidth="3"
              />
              <line 
                x1="350" 
                y1="50" 
                x2="50" 
                y2="350" 
                stroke="#3374DF" 
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
