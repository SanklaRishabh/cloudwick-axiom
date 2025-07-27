import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Sparkles, RefreshCw, MessageSquare, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '@/hooks/useSpaces';
import { useDevArticles } from '@/hooks/useDevArticles';
import workspaceIcon from '@/assets/workspace-doodle.jpg';
import collaborationIcon from '@/assets/collaboration-doodle.jpg';
import techIcon from '@/assets/tech-doodle.jpg';
import CreateSpaceDialog from '@/components/CreateSpaceDialog';

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { spaces, loading: spacesLoading, fetchSpaces } = useSpaces();
  const { articles, loading: articlesLoading, error: articlesError, refetch } = useDevArticles(3);
  const [isAIMenuExpanded, setIsAIMenuExpanded] = useState(false);

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
    setIsAIMenuExpanded(false);
  };

  const handleNavigateToQAChat = () => {
    navigate('/dashboard/qa-chat');
    setIsAIMenuExpanded(false);
  };

  const handleSpaceClick = (spaceId: string) => {
    navigate(`/dashboard/spaces/${spaceId}`);
  };

  const getSpaceGeometricPattern = (spaceName: string, spaceId: string) => {
    // Generate unique hash from space name and ID
    const hash = (spaceName + spaceId).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const patternIndex = Math.abs(hash) % 7;
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 60 + (Math.abs(hash >> 8) % 120)) % 360;
    const gradientId = `grad-${spaceId}`;
    
    const patterns = [
      // Circles pattern
      <svg key={spaceId} viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:`hsl(${hue1}, 70%, 55%)`, stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:`hsl(${hue2}, 70%, 65%)`, stopOpacity:1}} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="30" r="18" fill={`url(#${gradientId})`} opacity="0.8"/>
        <circle cx="150" cy="40" r="22" fill={`url(#${gradientId})`} opacity="0.6"/>
        <circle cx="100" cy="70" r="28" fill={`url(#${gradientId})`} opacity="0.9"/>
        <circle cx="170" cy="90" r="15" fill={`url(#${gradientId})`} opacity="0.7"/>
        <circle cx="30" cy="85" r="20" fill={`url(#${gradientId})`} opacity="0.5"/>
      </svg>,
      
      // Polygons pattern
      <svg key={spaceId} viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:`hsl(${hue1}, 75%, 50%)`, stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:`hsl(${hue2}, 75%, 60%)`, stopOpacity:1}} />
          </linearGradient>
        </defs>
        <polygon points="20,15 75,25 55,75 10,65" fill={`url(#${gradientId})`} opacity="0.7"/>
        <polygon points="90,10 155,20 145,70 95,60" fill={`url(#${gradientId})`} opacity="0.8"/>
        <polygon points="165,30 185,80 135,90 115,40" fill={`url(#${gradientId})`} opacity="0.6"/>
        <polygon points="25,85 65,95 45,105 20,100" fill={`url(#${gradientId})`} opacity="0.9"/>
      </svg>,
      
      // Rectangles pattern
      <svg key={spaceId} viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:`hsl(${hue1}, 80%, 50%)`, stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:`hsl(${hue2}, 80%, 60%)`, stopOpacity:1}} />
          </linearGradient>
        </defs>
        <rect x="15" y="15" width="35" height="35" fill={`url(#${gradientId})`} opacity="0.8" rx="6"/>
        <rect x="65" y="8" width="45" height="28" fill={`url(#${gradientId})`} opacity="0.6" rx="6"/>
        <rect x="125" y="20" width="40" height="40" fill={`url(#${gradientId})`} opacity="0.9" rx="6"/>
        <rect x="35" y="65" width="30" height="45" fill={`url(#${gradientId})`} opacity="0.7" rx="6"/>
        <rect x="95" y="55" width="55" height="25" fill={`url(#${gradientId})`} opacity="0.5" rx="6"/>
        <rect x="155" y="75" width="35" height="35" fill={`url(#${gradientId})`} opacity="0.8" rx="6"/>
      </svg>,
      
      // Hexagons pattern
      <svg key={spaceId} viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:`hsl(${hue1}, 65%, 55%)`, stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:`hsl(${hue2}, 65%, 65%)`, stopOpacity:1}} />
          </linearGradient>
        </defs>
        <polygon points="50,20 70,30 70,50 50,60 30,50 30,30" fill={`url(#${gradientId})`} opacity="0.8"/>
        <polygon points="130,15 155,27 155,52 130,64 105,52 105,27" fill={`url(#${gradientId})`} opacity="0.6"/>
        <polygon points="170,70 185,80 185,95 170,105 155,95 155,80" fill={`url(#${gradientId})`} opacity="0.9"/>
        <polygon points="90,80 110,90 110,105 90,115 70,105 70,90" fill={`url(#${gradientId})`} opacity="0.7"/>
      </svg>,
      
      // Triangles pattern
      <svg key={spaceId} viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:`hsl(${hue1}, 70%, 50%)`, stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:`hsl(${hue2}, 70%, 60%)`, stopOpacity:1}} />
          </linearGradient>
        </defs>
        <polygon points="40,15 60,50 20,50" fill={`url(#${gradientId})`} opacity="0.8"/>
        <polygon points="120,10 150,45 90,45" fill={`url(#${gradientId})`} opacity="0.6"/>
        <polygon points="160,60 185,95 135,95" fill={`url(#${gradientId})`} opacity="0.9"/>
        <polygon points="70,70 95,105 45,105" fill={`url(#${gradientId})`} opacity="0.7"/>
        <polygon points="100,25 115,50 85,50" fill={`url(#${gradientId})`} opacity="0.5"/>
      </svg>,
      
      // Diamonds pattern
      <svg key={spaceId} viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:`hsl(${hue1}, 75%, 55%)`, stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:`hsl(${hue2}, 75%, 65%)`, stopOpacity:1}} />
          </linearGradient>
        </defs>
        <polygon points="50,15 70,35 50,55 30,35" fill={`url(#${gradientId})`} opacity="0.8"/>
        <polygon points="130,20 155,40 130,60 105,40" fill={`url(#${gradientId})`} opacity="0.6"/>
        <polygon points="170,70 185,85 170,100 155,85" fill={`url(#${gradientId})`} opacity="0.9"/>
        <polygon points="80,75 100,90 80,105 60,90" fill={`url(#${gradientId})`} opacity="0.7"/>
        <polygon points="100,45 115,55 100,65 85,55" fill={`url(#${gradientId})`} opacity="0.5"/>
      </svg>,
      
      // Mixed geometric pattern
      <svg key={spaceId} viewBox="0 0 200 120" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:`hsl(${hue1}, 68%, 52%)`, stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:`hsl(${hue2}, 68%, 62%)`, stopOpacity:1}} />
          </linearGradient>
        </defs>
        <circle cx="40" cy="30" r="18" fill={`url(#${gradientId})`} opacity="0.8"/>
        <rect x="80" y="15" width="35" height="35" fill={`url(#${gradientId})`} opacity="0.6" rx="6"/>
        <polygon points="150,25 170,35 170,55 150,65 130,55 130,35" fill={`url(#${gradientId})`} opacity="0.9"/>
        <polygon points="60,75 85,105 35,105" fill={`url(#${gradientId})`} opacity="0.7"/>
        <polygon points="130,85 145,95 130,105 115,95" fill={`url(#${gradientId})`} opacity="0.5"/>
      </svg>
    ];
    
    return patterns[patternIndex];
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Your Spaces</h2>
          {isSystemAdmin && (
            <CreateSpaceDialog onSpaceCreated={fetchSpaces} />
          )}
        </div>
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
                    {getSpaceGeometricPattern(space.SpaceName, space.SpaceId)}
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
          <h2 className="text-2xl font-semibold text-gray-900">Public Trending Articles</h2>
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
                index === 0 ? 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100' :
                index === 1 ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100' :
                'bg-gradient-to-br from-rose-50 via-orange-50 to-yellow-100'
              }`}>
                <CardHeader className="p-0">
                  {article.cover_image ? (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={article.cover_image} 
                        alt={article.title}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className={`h-40 flex items-center justify-center ${
                      index === 0 ? 'bg-gradient-to-br from-cyan-200 to-indigo-300' :
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
        <div className="relative">
          {/* Expanded Menu */}
          {isAIMenuExpanded && (
            <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
              <Button
                onClick={handleNavigateToAIChat}
                className="h-12 px-4 rounded-full bg-gradient-primary hover:bg-gradient-primary-hover shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <MessageSquare className="h-5 w-5 text-white" />
                <span className="text-white font-medium">AI Chat</span>
              </Button>
              <Button
                onClick={handleNavigateToQAChat}
                className="h-12 px-4 rounded-full bg-gradient-primary hover:bg-gradient-primary-hover shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Brain className="h-5 w-5 text-white" />
                <span className="text-white font-medium">AI Test</span>
              </Button>
            </div>
          )}
          
          {/* Main Button */}
          <Button
            onClick={() => setIsAIMenuExpanded(!isAIMenuExpanded)}
            className="h-14 w-14 rounded-full bg-gradient-primary hover:bg-gradient-primary-hover shadow-lg hover:shadow-xl transition-all duration-300 p-0"
            size="icon"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse absolute inset-0"></div>
              <Sparkles className="h-6 w-6 text-white relative z-10" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;