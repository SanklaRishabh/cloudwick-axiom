
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleSettingsClick = () => {
    navigate('/dashboard/settings');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  return (
    <header className="h-20 border-b border-white/20 bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-xl shadow-lg flex items-center justify-between px-8">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
        <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-white font-bold text-lg">CW</span>
        </div>
        <div className="flex flex-col">
          <span className="bg-gradient-to-r from-teal-700 via-slate-700 to-teal-700 bg-clip-text text-transparent font-bold text-lg font-lato">Cloudwick</span>
          <span className="text-muted-foreground font-light text-sm font-lato">Axiom</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-12 w-12 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 hover:from-cyan-200 hover:to-blue-200 border border-cyan-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
              <span className="text-base font-bold bg-gradient-primary bg-clip-text text-transparent">
                {getUserInitials()}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 card-glass border-white/20" align="end" forceMount>
            <DropdownMenuItem 
              onClick={handleSettingsClick}
              className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 cursor-pointer"
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 text-red-600 cursor-pointer"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
