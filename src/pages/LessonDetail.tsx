import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, Clock, User } from 'lucide-react';
import { useLessonDetail, useDeleteLesson } from '@/hooks/useLessons';
import EditLessonDialog from '@/components/EditLessonDialog';
import DoodleAvatar from '@/components/DoodleAvatar';

const LessonDetail: React.FC = () => {
  const { spaceId, courseId, sectionId, lessonId } = useParams<{
    spaceId: string;
    courseId: string;
    sectionId: string;
    lessonId: string;
  }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { lesson, loading, fetchLessonDetail } = useLessonDetail(
    spaceId || '',
    courseId || '',
    sectionId || '',
    lessonId || ''
  );

  const { deleteLesson } = useDeleteLesson(
    spaceId || '',
    courseId || '',
    sectionId || '',
    lessonId || ''
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLesson();
      navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections/${sectionId}`);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections/${sectionId}`)}
          className="mb-4 font-lexend"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Section
        </Button>
        <div className="text-center py-8">
          <p className="text-gray-500 font-lexend">Lesson not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections/${sectionId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Section
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Article Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-8 font-serif">
              {lesson.LessonTitle}
            </h1>
            
            {/* Author and Meta Info */}
            <div className="flex items-center gap-4 py-6 border-t border-b border-gray-200">
              <DoodleAvatar 
                seed={lesson.CreatedBy || 'default'}
                size={48}
                fallback={lesson.CreatedBy?.[0]?.toUpperCase() || 'U'}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <User className="h-4 w-4" />
                  {lesson.CreatedBy}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                  <Clock className="h-4 w-4" />
                  {new Date(lesson.CreatedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div className="lesson-content">
            <div 
              className="prose prose-lg prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.Content }}
            />
          </div>
        </div>
      </article>

      {/* Edit Dialog */}
      {lesson && (
        <EditLessonDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          lesson={lesson}
          spaceId={spaceId || ''}
          courseId={courseId || ''}
          sectionId={sectionId || ''}
          onLessonUpdated={fetchLessonDetail}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-lexend">Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription className="font-lexend">
              Are you sure you want to delete this lesson? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-lexend">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="font-lexend bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LessonDetail;