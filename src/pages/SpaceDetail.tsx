
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, FileText, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import SpaceFiles from '@/components/SpaceFiles';
import SpaceCourses from '@/components/SpaceCourses';
import SpacePeople from '@/components/SpacePeople';

interface Space {
  SpaceId: string;
  SpaceName: string;
  SpaceDescription?: string;
  SpaceAdmin?: string;
}

const SpaceDetail = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [space, setSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('files');
  const { toast } = useToast();

  useEffect(() => {
    const fetchSpace = async () => {
      if (!spaceId) return;
      
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/spaces/${spaceId}`);
        const spaceData = await response.json();
        setSpace(spaceData);
      } catch (error) {
        console.error('Error fetching space:', error);
        toast({
          title: "Error",
          description: "Failed to load space details. Please try again.",
          variant: "destructive",
        });
        navigate('/dashboard/spaces');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpace();
  }, [spaceId, navigate, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-lexend">Loading space...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-lexend">Space not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/spaces')}
          className="flex items-center gap-2 font-lexend"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Spaces
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-lexend">{space.SpaceName}</h1>
        {space.SpaceDescription && (
          <p className="text-gray-600 font-lexend mt-2">{space.SpaceDescription}</p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="files" className="flex items-center gap-2 font-lexend">
            <FileText className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2 font-lexend">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2 font-lexend">
            <Users className="h-4 w-4" />
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          <SpaceFiles spaceId={space.SpaceId} />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <SpaceCourses spaceId={space.SpaceId} />
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          <SpacePeople spaceId={space.SpaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpaceDetail;
