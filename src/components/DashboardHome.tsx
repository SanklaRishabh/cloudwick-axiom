import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '@/hooks/useSpaces';

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { spaces, loading: spacesLoading } = useSpaces();

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

  const handleNavigateToPeople = () => {
    navigate('/dashboard/people');
  };

  const handleNavigateToAIChat = () => {
    navigate('/dashboard/ai-chat');
  };

  const handleSpaceClick = (spaceId: string) => {
    navigate(`/dashboard/spaces/${spaceId}`);
  };

  const getSpacePlaceholderImage = (spaceName: string) => {
    const imageMap: { [key: string]: string } = {
      'Orion': '/lovable-uploads/089a268d-1bde-43a9-b5be-d5b768d82613.png',
      'Global': '/lovable-uploads/eb2fc261-5749-4c49-9406-00068de459d2.png',
      'Test': '/lovable-uploads/033c0c66-74be-43c1-b65c-79e19d2ff243.png'
    };
    
    return imageMap[spaceName] || '/lovable-uploads/089a268d-1bde-43a9-b5be-d5b768d82613.png'; // Default to Orion
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
        <h1 className="text-3xl font-bold text-gray-900">
          {getTimeOfDayGreeting()}, {getUserDisplayName()}!
        </h1>
        
        <div className="flex gap-4">
          {isSystemAdmin && (
            <Button 
              onClick={handleNavigateToPeople}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              People
            </Button>
          )}
        </div>
      </div>

      {/* Spaces Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Your Spaces</h2>
        {spacesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 h-64 animate-pulse">
                <div className="w-full h-full bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No spaces found. Contact your administrator to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <div 
                key={space.SpaceId} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSpaceClick(space.SpaceId)}
              >
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={getSpacePlaceholderImage(space.SpaceName)} 
                      alt={space.SpaceName}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 font-lato">{space.SpaceName}</h3>
                    {space.SpaceDescription && (
                      <p className="text-sm text-gray-600 mt-1">{space.SpaceDescription}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-48">
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-32 h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleNavigateToAIChat}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
          size="icon"
        >
          <div className="relative">
            <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse absolute inset-0"></div>
            <Sparkles className="h-6 w-6 text-white relative z-10" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHome;