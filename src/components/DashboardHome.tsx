import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Sparkles, ExternalLink, RefreshCw, Heart, MessageCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '@/hooks/useSpaces';
import { useDevArticles } from '@/hooks/useDevArticles';

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

      {/* Tech Articles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Latest Tech Articles</h2>
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
              <Card key={i} className="h-96 shadow-lg border-0 bg-gradient-to-br from-slate-50 to-blue-50">
                <CardHeader className="p-0">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
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
              <Card key={article.id} className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg ${
                index === 0 ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100' :
                index === 1 ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100' :
                'bg-gradient-to-br from-rose-50 via-pink-50 to-orange-100'
              }`}>
                <CardHeader className="p-0">
                  {article.cover_image ? (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={article.cover_image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className={`h-48 flex items-center justify-center ${
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

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span className="font-medium">{article.positive_reactions_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-medium">{article.comments_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{article.reading_time_minutes}m</span>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
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