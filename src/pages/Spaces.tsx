import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CreateSpaceDialog from '@/components/CreateSpaceDialog';

interface Space {
  id: string;
  name: string;
  description?: string;
}

const Spaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSpaces = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://ndncqs0q7i.execute-api.us-east-1.amazonaws.com/Test1_without_auth/spaces');
      
      if (!response.ok) {
        throw new Error('Failed to fetch spaces');
      }

      const data = await response.json();
      console.log('Fetched spaces:', data);
      
      // Transform the API response to match our interface
      // Assuming the API returns an array of spaces with SpaceName and SpaceDescription
      const transformedSpaces = Array.isArray(data) ? data.map((space: any, index: number) => ({
        id: space.id || `space-${index}`,
        name: space.SpaceName || space.name || 'Unnamed Space',
        description: space.SpaceDescription || space.description,
      })) : [];
      
      setSpaces(transformedSpaces);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      toast({
        title: "Error",
        description: "Failed to load spaces. Please try again.",
        variant: "destructive",
      });
      // Keep empty array on error
      setSpaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleDeleteSpace = (spaceId: string) => {
    // TODO: Implement delete API call
    setSpaces(spaces.filter(space => space.id !== spaceId));
    toast({
      title: "Success",
      description: "Space deleted successfully",
    });
  };

  const handleEditSpace = (spaceId: string) => {
    console.log('Edit space:', spaceId);
    // TODO: Implement edit functionality
  };

  const handleSpaceCreated = () => {
    // Refresh the spaces list when a new space is created
    fetchSpaces();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-lexend">Spaces</h1>
          <p className="text-gray-600 font-lexend mt-2">Manage your workspace environments</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-lexend">Loading spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-lexend">Spaces</h1>
        <p className="text-gray-600 font-lexend mt-2">Manage your workspace environments</p>
      </div>

      {spaces.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 font-lexend">No spaces found. Create your first space to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <div key={space.id} className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditSpace(space.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteSpace(space.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="space-y-4">
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-300 rounded transform rotate-45"></div>
                  <div className="w-8 h-8 bg-gray-300 rounded transform -rotate-45 -ml-4"></div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 font-lexend">{space.name}</h3>
                  {space.description && (
                    <p className="text-sm text-gray-600 font-lexend mt-1">{space.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateSpaceDialog onSpaceCreated={handleSpaceCreated} />
    </div>
  );
};

export default Spaces;
