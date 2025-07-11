import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Box, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName) {
      return user.firstName;
    }
    return user.username;
  };

  const handleNavigateToSpaces = () => {
    navigate('/dashboard/spaces');
  };

  const handleNavigateToPeople = () => {
    navigate('/dashboard/people');
  };

  const isSystemAdmin = user?.role === 'SystemAdmin';
  
  // Debug logging
  console.log('🔍 DashboardHome - User role check:', {
    user: !!user,
    userRole: user?.role,
    isSystemAdmin,
    userObject: user
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 font-lexend">
          {getTimeOfDayGreeting()}, {getUserDisplayName()}!
        </h1>
        
        <div className="flex gap-4">
          <Button 
            onClick={handleNavigateToSpaces}
            className="bg-blue-600 hover:bg-blue-700 font-lexend flex items-center gap-2"
          >
            <Box className="h-5 w-5" />
            Spaces
          </Button>
          
          {isSystemAdmin && (
            <Button 
              onClick={handleNavigateToPeople}
              className="bg-blue-600 hover:bg-blue-700 font-lexend flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              People
            </Button>
          )}
        </div>
      </div>

      {/* Placeholder content cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-64">
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-64">
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-64 md:col-span-2 lg:col-span-1">
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 font-lexend">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-48">
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-32 h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
