import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLesson } from '@/hooks/useLessons';

interface CreateLessonDialogProps {
  spaceId: string;
  courseId: string;
  sectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLessonCreated: () => void;
}

const CreateLessonDialog: React.FC<CreateLessonDialogProps> = ({
  spaceId,
  courseId,
  sectionId,
  open,
  onOpenChange,
  onLessonCreated
}) => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createLesson } = useCreateLesson(spaceId, courseId, sectionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lessonTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createLesson({
        LessonTitle: lessonTitle,
        Content: content
      });
      
      setLessonTitle('');
      setContent('');
      onOpenChange(false);
      onLessonCreated();
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-lexend">Create New Lesson</DialogTitle>
          <DialogDescription className="font-lexend">
            Add a new lesson to this section.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title" className="font-lexend">Lesson Title</Label>
            <Input
              id="lesson-title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Enter lesson title"
              required
              className="font-lexend"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content" className="font-lexend">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter lesson content (HTML supported)"
              rows={6}
              className="font-lexend"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="font-lexend"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!lessonTitle.trim() || isSubmitting}
              className="font-lexend"
            >
              {isSubmitting ? 'Creating...' : 'Create Lesson'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLessonDialog;