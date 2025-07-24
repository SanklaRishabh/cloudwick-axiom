
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CreateSpaceDialog from '@/components/CreateSpaceDialog';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import workspaceIcon from '@/assets/workspace-doodle.jpg';
import collaborationIcon from '@/assets/collaboration-doodle.jpg';
import techIcon from '@/assets/tech-doodle.jpg';

interface Space {
  SpaceId: string;
  SpaceName: string;
  SpaceDescription?: string;
  SpaceAdmin?: string;
}

interface SpacesResponse {
  Spaces: Space[];
  Pagination: {
    Offset: number;
    Limit: number;
    SortBy: string;
    Total: number;
  };
}

const Spaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSystemAdmin = user?.role === 'SystemAdmin';

  const fetchSpaces = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/spaces');
      const data: SpacesResponse = await response.json();
      console.log('Fetched spaces:', data);
      
      setSpaces(data.Spaces || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      toast({
        title: "Error",
        description: "Failed to load spaces. Please try again.",
        variant: "destructive",
      });
      setSpaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleDeleteSpace = async (spaceId: string) => {
    try {
      await apiClient.delete(`/spaces/${spaceId}`);

      setSpaces(spaces.filter(space => space.SpaceId !== spaceId));
      toast({
        title: "Success",
        description: "Space deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting space:', error);
      toast({
        title: "Error",
        description: "Failed to delete space. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleSpaceCreated = () => {
    fetchSpaces();
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Spaces</h1>
          <p className="text-gray-600 mt-2">Manage your workspace environments</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Spaces</h1>
        <p className="text-gray-600 mt-2">Manage your workspace environments</p>
      </div>

      {spaces.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No spaces found. Create your first space to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <div 
              key={space.SpaceId} 
              className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSpaceClick(space.SpaceId)}
            >
              {isSystemAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-4 right-4 h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSpace(space.SpaceId);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Space
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

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

      {isSystemAdmin && <CreateSpaceDialog onSpaceCreated={handleSpaceCreated} />}
    </div>
  );
};

export default Spaces;
