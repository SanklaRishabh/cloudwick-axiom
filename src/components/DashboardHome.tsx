import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '@/hooks/useSpaces';
import { useDevArticles } from '@/hooks/useDevArticles';
import workspaceIcon from '@/assets/workspace-doodle.jpg';
import collaborationIcon from '@/assets/collaboration-doodle.jpg';
import techIcon from '@/assets/tech-doodle.jpg';

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { spaces, loading: spacesLoading } = useSpaces();
  const { articles, loading: articlesLoading, error: articlesError, refetch } = useDevArticles(3);

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

  const getSpaceGeometricPattern = (spaceName: string) => {
    const patterns = {
      'Orion': (
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="orion-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'hsl(220, 70%, 50%)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'hsl(260, 70%, 60%)', stopOpacity:1}} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="30" r="15" fill="url(#orion-grad)" opacity="0.8"/>
          <circle cx="150" cy="40" r="20" fill="url(#orion-grad)" opacity="0.6"/>
          <circle cx="100" cy="70" r="25" fill="url(#orion-grad)" opacity="0.9"/>
          <circle cx="170" cy="90" r="12" fill="url(#orion-grad)" opacity="0.7"/>
          <circle cx="30" cy="85" r="18" fill="url(#orion-grad)" opacity="0.5"/>
          <path d="M50,30 L150,40 L100,70 L170,90 L30,85 Z" stroke="url(#orion-grad)" strokeWidth="2" fill="none" opacity="0.4"/>
        </svg>
      ),
      'Global': (
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="global-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'hsl(160, 70%, 50%)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'hsl(200, 70%, 60%)', stopOpacity:1}} />
            </linearGradient>
          </defs>
          <polygon points="20,20 80,30 60,80 10,70" fill="url(#global-grad)" opacity="0.7"/>
          <polygon points="90,15 160,25 150,75 100,65" fill="url(#global-grad)" opacity="0.8"/>
          <polygon points="170,35 190,85 140,95 120,45" fill="url(#global-grad)" opacity="0.6"/>
          <polygon points="30,90 70,100 50,110 25,105" fill="url(#global-grad)" opacity="0.9"/>
        </svg>
      ),
      'Test': (
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="test-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'hsl(340, 70%, 50%)', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'hsl(20, 70%, 60%)', stopOpacity:1}} />
            </linearGradient>
          </defs>
          <rect x="20" y="20" width="30" height="30" fill="url(#test-grad)" opacity="0.8" rx="4"/>
          <rect x="70" y="10" width="40" height="25" fill="url(#test-grad)" opacity="0.6" rx="4"/>
          <rect x="130" y="25" width="35" height="35" fill="url(#test-grad)" opacity="0.9" rx="4"/>
          <rect x="40" y="70" width="25" height="40" fill="url(#test-grad)" opacity="0.7" rx="4"/>
          <rect x="100" y="60" width="50" height="20" fill="url(#test-grad)" opacity="0.5" rx="4"/>
          <rect x="160" y="80" width="30" height="30" fill="url(#test-grad)" opacity="0.8" rx="4"/>
        </svg>
      )
    };
    
    return patterns[spaceName] || patterns['Orion']; // Default to Orion pattern
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
        <h2 className="text-2xl font-semibold text-gray-900">Your Spaces</h2>
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
                  <div className="w-full h-32 bg-gray-50 rounded-lg overflow-hidden">
                    {getSpaceGeometricPattern(space.SpaceName)}
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

      {/* Tech Articles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Trending Articles</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={articlesLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${articlesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-80 shadow-lg border-0 bg-gradient-to-br from-slate-50 to-blue-50">
                <CardHeader className="p-0">
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articlesError ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">Failed to load tech articles</p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(0, 3).map((article, index) => (
              <Card key={article.id} className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg relative ${
                index === 0 ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100' :
                index === 1 ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100' :
                'bg-gradient-to-br from-rose-50 via-pink-50 to-orange-100'
              }`}>
                <CardHeader className="p-0">
                  {article.cover_image ? (
                    <div className="h-40 overflow-hidden p-4">
                      <img 
                        src={article.cover_image} 
                        alt={article.title}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className={`h-40 flex items-center justify-center ${
                      index === 0 ? 'bg-gradient-to-br from-purple-200 to-indigo-300' :
                      index === 1 ? 'bg-gradient-to-br from-emerald-200 to-cyan-300' :
                      'bg-gradient-to-br from-rose-200 to-orange-300'
                    }`}>
                      <div className="text-3xl font-bold text-white/80">DEV</div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{article.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <img 
                      src={article.user.profile_image_90} 
                      alt={article.user.name}
                      className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">{article.user.name}</span>
                      <span className="text-xs">{article.readable_publish_date}</span>
                    </div>
                  </div>

                  {article.tag_list.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {article.tag_list.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-3 py-1 bg-white/60 text-gray-700 hover:bg-white/80 transition-colors">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                />
              </Card>
            ))}
          </div>
        )}
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