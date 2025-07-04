
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface CreateSpaceDialogProps {
  onSpaceCreated: () => void;
}

const CreateSpaceDialog = ({ onSpaceCreated }: CreateSpaceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!spaceName.trim()) {
      toast({
        title: "Error",
        description: "Space name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating space with data:', { SpaceName: spaceName.trim(), SpaceDescription: description.trim() || undefined });
      
      const response = await apiClient.post('/spaces', {
        SpaceName: spaceName.trim(),
        SpaceDescription: description.trim() || undefined,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Check if the response is successful (status 200-299)
      if (response.status === 201 || response.ok) {
        console.log('Space created successfully');
        
        toast({
          title: "Success",
          description: "Space created successfully",
        });

        // Reset form
        setSpaceName('');
        setDescription('');
        setOpen(false);
        
        // Refresh spaces list
        onSpaceCreated();
      } else {
        console.error('Response not ok:', response.status, response.statusText);
        throw new Error(`Failed to create space: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating space:', error);
      toast({
        title: "Error",
        description: "Failed to create space. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-lexend">Create a new space</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spaceName" className="font-lexend">Space Name</Label>
            <Input
              id="spaceName"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="Enter space name"
              className="font-lexend"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-lexend">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a short description"
              className="font-lexend resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="font-lexend"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 font-lexend"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSpaceDialog;
