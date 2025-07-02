
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
      const response = await fetch(`https://ndncqs0q7i.execute-api.us-east-1.amazonaws.com/Test1_without_auth/spaces/${space.SpaceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SpaceDescription: description.trim() || undefined,
          SpaceAdmin: spaceAdmin.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update space');
      }

      toast({
        title: "Success",
        description: "Space updated successfully",
      });

      onSpaceUpdated();
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
          <DialogTitle className="font-lexend">Edit space: {space.SpaceName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="spaceAdmin" className="font-lexend">Space Admin</Label>
            <Input
              id="spaceAdmin"
              value={spaceAdmin}
              onChange={(e) => setSpaceAdmin(e.target.value)}
              placeholder="Enter space admin"
              className="font-lexend"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-lexend"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 font-lexend"
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
