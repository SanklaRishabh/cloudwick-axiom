import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateLesson, type LessonDetail } from '@/hooks/useLessons';

interface EditLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: LessonDetail;
  spaceId: string;
  courseId: string;
  sectionId: string;
  onLessonUpdated: () => void;
}

const EditLessonDialog: React.FC<EditLessonDialogProps> = ({
  open,
  onOpenChange,
  lesson,
  spaceId,
  courseId,
  sectionId,
  onLessonUpdated,
}) => {
  const [lessonTitle, setLessonTitle] = useState(lesson.LessonTitle);
  const [content, setContent] = useState(lesson.Content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateLesson } = useUpdateLesson(spaceId, courseId, sectionId, lesson.LessonId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await updateLesson({
        LessonTitle: lessonTitle.trim(),
        Content: content.trim(),
      });
      onLessonUpdated();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-lexend">Edit Lesson</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessonTitle" className="font-lexend">Lesson Title</Label>
            <Input
              id="lessonTitle"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Enter lesson title"
              className="font-lexend"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="font-lexend">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter lesson content (HTML supported)"
              className="min-h-[200px] font-lexend"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
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
              disabled={isSubmitting || !lessonTitle.trim() || !content.trim()}
              className="font-lexend"
            >
              {isSubmitting ? "Updating..." : "Update Lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLessonDialog;