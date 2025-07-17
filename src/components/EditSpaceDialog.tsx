import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

interface Space {
  SpaceId: string;
  SpaceName: string;
  SpaceDescription?: string;
  SpaceAdmin?: string;
}

interface EditSpaceDialogProps {
  space: Space;
  onSpaceUpdated: () => void;
  onClose: () => void;
}

const EditSpaceDialog = ({ space, onSpaceUpdated, onClose }: EditSpaceDialogProps) => {
  const [description, setDescription] = useState(space.SpaceDescription || '');
  const [spaceAdmin, setSpaceAdmin] = useState(space.SpaceAdmin || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      const response = await apiClient.put(`/spaces/${space.SpaceId}`, {
        SpaceDescription: description.trim() || undefined,
        SpaceAdmin: spaceAdmin.trim() || undefined,
      });
      
      console.log('Edit space response status:', response.status);

      // Handle 204 No Content (successful update with no response body)
      if (response.status === 204) {
        toast({
          title: "Success",
          description: "Space updated successfully",
        });
        onSpaceUpdated();
      } else {
        // Parse JSON for other successful responses
        const result = await response.json();
        toast({
          title: "Success",
          description: result.Message || "Space updated successfully",
        });
        onSpaceUpdated();
      }
    } catch (error) {
      console.error('Error updating space:', error);
      toast({
        title: "Error",
        description: "Failed to update space. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit space: {space.SpaceName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a short description"
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spaceAdmin">Space Admin</Label>
            <Input
              id="spaceAdmin"
              value={spaceAdmin}
              onChange={(e) => setSpaceAdmin(e.target.value)}
              placeholder="Enter space admin"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSpaceDialog;