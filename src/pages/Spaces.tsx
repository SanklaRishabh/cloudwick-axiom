
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

      {isSystemAdmin && <CreateSpaceDialog onSpaceCreated={handleSpaceCreated} />}
    </div>
  );
};

export default Spaces;
