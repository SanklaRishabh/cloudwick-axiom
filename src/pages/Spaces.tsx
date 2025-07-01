
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';

interface Space {
  id: string;
  name: string;
  description?: string;
}

const initialSpaces: Space[] = [
  { id: '1', name: 'ORION', description: 'Advanced analytics platform' },
  { id: '2', name: 'COMET', description: 'Data visualization suite' },
  { id: '3', name: 'DEVOPS', description: 'Deployment and monitoring' },
  { id: '4', name: 'SOLUTIONS', description: 'Customer solutions hub' },
  { id: '5', name: 'CR7', description: 'Change request management' },
  { id: '6', name: 'UI/UX', description: 'Design system and components' },
];

const Spaces = () => {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);

  const handleDeleteSpace = (spaceId: string) => {
    setSpaces(spaces.filter(space => space.id !== spaceId));
  };

  const handleEditSpace = (spaceId: string) => {
    console.log('Edit space:', spaceId);
    // TODO: Implement edit functionality
  };

  const handleCreateSpace = () => {
    console.log('Create new space');
    // TODO: Implement create functionality
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-lexend">Spaces</h1>
        <p className="text-gray-600 font-lexend mt-2">Manage your workspace environments</p>
      </div>

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

      {/* Create Space Button */}
      <Button
        onClick={handleCreateSpace}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Spaces;
