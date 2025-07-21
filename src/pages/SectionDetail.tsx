
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Users, Play, Settings, Edit, Trash2, Plus } from 'lucide-react';
import { useSectionDetail, useDeleteSection } from '@/hooks/useSections';
import { useAuth } from '@/hooks/useAuth';
import { useCourseDetail } from '@/hooks/useCourses';
import EditSectionDialog from '@/components/EditSectionDialog';
import CreateLessonDialog from '@/components/CreateLessonDialog';

const getLessonIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Play className="h-4 w-4" />;
    case 'reading':
      return <BookOpen className="h-4 w-4" />;
    case 'quiz':
      return <Clock className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

const SectionDetail: React.FC = () => {
  const { spaceId, courseId, sectionId } = useParams<{ spaceId: string; courseId: string; sectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);

  const { section, loading, fetchSectionDetail } = useSectionDetail(spaceId || '', courseId || '', sectionId || '');
  const { course } = useCourseDetail(spaceId || '', courseId || '');
  const { deleteSection } = useDeleteSection(spaceId || '', courseId || '');

  // Check if user can edit/delete sections (Space Admin or System Admin)
  const canEditSection = user?.role === 'SystemAdmin' || user?.username === course?.CreatedBy;

  const handleSectionUpdated = () => {
    fetchSectionDetail();
  };

  const handleLessonCreated = () => {
    fetchSectionDetail();
  };

  const handleDeleteSection = async () => {
    if (!sectionId) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this section? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteSection(sectionId);
      navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections`);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}`)}
          className="mb-4 font-lexend"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        <div className="text-center py-8">
          <p className="text-gray-500 font-lexend">Section not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections`)}
        className="mb-4 font-lexend"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sections
      </Button>

      <div className="space-y-6">
        {/* Section Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 font-lexend">{section.SectionTitle}</h1>
            {canEditSection && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditDialogOpen(true)}
                  className="h-8 px-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDeleteSection}
                  className="h-8 px-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="text-gray-700 font-lexend">
              Course: {course?.CourseTitle}
            </div>
            <div className="text-gray-700 font-lexend">
              Created: {new Date(section.CreatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Section Description */}
        <Card>
          <CardHeader>
            <CardTitle className="font-lexend">About this section</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed font-lexend">{section.Description}</p>
          </CardContent>
        </Card>

        {/* Section Contents/Lessons */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 font-lexend">Contents</h3>
            {canEditSection && (
              <Button
                onClick={() => setCreateLessonDialogOpen(true)}
                size="sm"
                className="font-lexend"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            )}
          </div>
          {section.Contents && section.Contents.length > 0 ? (
            <div className="space-y-3">
              {section.Contents.map((content, index) => (
                <Card 
                  key={content.LessonId} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections/${sectionId}/lessons/${content.LessonId}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 font-lexend">
                            {index + 1}. {content.LessonTitle}
                          </h4>
                          <p className="text-sm text-gray-600 font-lexend">
                            Lesson ID: {content.LessonId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 font-lexend mb-2">No contents yet</h3>
              <p className="text-gray-600 font-lexend">
                Contents will appear here once they're added to this section.
              </p>
            </div>
          )}
        </div>
      </div>

      <EditSectionDialog
        spaceId={spaceId || ''}
        courseId={courseId || ''}
        sectionId={sectionId || ''}
        section={section}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSectionUpdated={handleSectionUpdated}
      />

      <CreateLessonDialog
        spaceId={spaceId || ''}
        courseId={courseId || ''}
        sectionId={sectionId || ''}
        open={createLessonDialogOpen}
        onOpenChange={setCreateLessonDialogOpen}
        onLessonCreated={handleLessonCreated}
      />
    </div>
  );
};

export default SectionDetail;
