
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

  const getSpacePlaceholderImage = (spaceId: string) => {
    const images = [
      '/lovable-uploads/089a268d-1bde-43a9-b5be-d5b768d82613.png', // Orion
      '/lovable-uploads/52daa7a5-22c0-4af5-84ff-0f1e8f09d08a.png', // Comet
      '/lovable-uploads/eb2fc261-5749-4c49-9406-00068de459d2.png', // Globe
      '/lovable-uploads/033c0c66-74be-43c1-b65c-79e19d2ff243.png'  // Test
    ];
    // Use spaceId to ensure consistent image per space
    const hash = spaceId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return images[Math.abs(hash) % images.length];
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
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={getSpacePlaceholderImage(space.SpaceId)} 
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

      {isSystemAdmin && <CreateSpaceDialog onSpaceCreated={handleSpaceCreated} />}
    </div>
  );
};

export default Spaces;
