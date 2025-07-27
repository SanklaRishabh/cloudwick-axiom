
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, BookOpen, Users, Settings, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import SpaceFiles from '@/components/SpaceFiles';
import SpaceCourses from '@/components/SpaceCourses';
import SpacePeople from '@/components/SpacePeople';
import SpaceTests from '@/components/SpaceTests';

interface Space {
  SpaceId: string;
  SpaceName: string;
  SpaceDescription?: string;
  SpaceAdmin?: string;
}

const SpaceDetail = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('files');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ SpaceName: '', SpaceDescription: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const isSystemAdmin = user?.role === 'SystemAdmin';

  useEffect(() => {
    const fetchSpace = async () => {
      if (!spaceId) return;
      
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/spaces/${spaceId}`);
        const spaceData = await response.json();
        setSpace(spaceData);
        setEditForm({
          SpaceName: spaceData.SpaceName || '',
          SpaceDescription: spaceData.SpaceDescription || ''
        });
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

  const handleUpdateSpace = async () => {
    if (!spaceId) return;

    setIsUpdating(true);
    try {
      const response = await apiClient.put(`/spaces/${spaceId}`, editForm);
      console.log('Update space response status:', response.status);
      
      // Handle 204 No Content (successful update with no response body)
      if (response.status === 204) {
        setSpace(prev => prev ? { ...prev, ...editForm } : null);
        setIsEditDialogOpen(false);
        toast({
          title: "Success! 🎉",
          description: "Space updated successfully",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        // Parse JSON for other successful responses
        const result = await response.json();
        
        if (result.Message) {
          setSpace(prev => prev ? { ...prev, ...editForm } : null);
          setIsEditDialogOpen(false);
          toast({
            title: "Success! 🎉",
            description: result.Message,
            className: "bg-green-50 border-green-200 text-green-800",
          });
        } else if (result.Error) {
          toast({
            title: "Oops! 😔",
            description: result.Error,
            variant: "destructive",
            className: "bg-red-50 border-red-200 text-red-800",
          });
        }
      }
    } catch (error) {
      console.error('Error updating space:', error);
      toast({
        title: "Something went wrong 😞",
        description: "Failed to update space. Please try again.",
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 font-lexend hover-scale transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-lexend">{space.SpaceName}</h1>
          {space.SpaceDescription && (
            <p className="text-gray-600 font-lexend mt-2">{space.SpaceDescription}</p>
          )}
        </div>
        
        {isSystemAdmin && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Space Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 font-lexend">Space Name</label>
                  <Input
                    value={editForm.SpaceName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, SpaceName: e.target.value }))}
                    placeholder="Enter space name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 font-lexend">Description</label>
                  <Textarea
                    value={editForm.SpaceDescription}
                    onChange={(e) => setEditForm(prev => ({ ...prev, SpaceDescription: e.target.value }))}
                    placeholder="Enter space description"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateSpace}
                    disabled={isUpdating}
                    className="bg-gradient-primary hover:bg-gradient-primary/90"
                  >
                    {isUpdating ? 'Updating...' : 'Update Space'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 tabs-modern">
          <TabsTrigger value="files" className="flex items-center gap-2 font-lexend data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
            <FileText className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2 font-lexend data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2 font-lexend data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
            <ClipboardList className="h-4 w-4" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2 font-lexend data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
            <Users className="h-4 w-4" />
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6 animate-fade-in">
          <SpaceFiles spaceId={space.SpaceId} space={space} />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6 animate-fade-in">
          <SpaceCourses spaceId={space.SpaceId} space={space} />
        </TabsContent>

        <TabsContent value="tests" className="space-y-6 animate-fade-in">
          <SpaceTests spaceId={space.SpaceId} />
        </TabsContent>

        <TabsContent value="people" className="space-y-6 animate-fade-in">
          <SpacePeople spaceId={space.SpaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpaceDetail;
