
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const AuthThemeContext = createContext<AuthThemeContextType | undefined>(undefined);

export const AuthThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <AuthThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </AuthThemeContext.Provider>
  );
};

export const useAuthTheme = () => {
  const context = useContext(AuthThemeContext);
  if (context === undefined) {
    throw new Error('useAuthTheme must be used within an AuthThemeProvider');
  }
  return context;
};
