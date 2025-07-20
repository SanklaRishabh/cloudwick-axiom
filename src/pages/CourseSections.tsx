
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { useSections } from '@/hooks/useSections';
import { useCourseDetail } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import CreateSectionDialog from '@/components/CreateSectionDialog';

const CourseSections: React.FC = () => {
  const { spaceId, courseId } = useParams<{ spaceId: string; courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const { sections, loading, fetchSections } = useSections(spaceId || '', courseId || '');
  const { course } = useCourseDetail(spaceId || '', courseId || '');

  // Check if user can add sections (Space Admin or System Admin)
  const canAddSections = user?.role === 'SystemAdmin' || user?.username === course?.CreatedBy;

  const handleSectionCreated = () => {
    fetchSections();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-lexend">Course Sections</h1>
            {course && (
              <p className="text-gray-600 font-lexend mt-1">
                {course.CourseTitle}
              </p>
            )}
          </div>
          
          {canAddSections && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="font-lexend"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          )}
        </div>

        {/* Sections Grid */}
        {sections.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 font-lexend mb-2">No sections yet</h3>
            <p className="text-gray-600 font-lexend mb-4">
              {canAddSections 
                ? "Get started by creating your first section." 
                : "Sections will appear here once they're added."}
            </p>
            {canAddSections && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="font-lexend"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Section
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Card 
                key={section.SectionId} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections/${section.SectionId}`)}
              >
                <CardHeader>
                  <CardTitle className="font-lexend text-lg">
                    {section.SectionTitle}
                  </CardTitle>
                  <CardDescription className="font-lexend">
                    Created by {section.CreatedBy}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 font-lexend line-clamp-3">
                    {section.Description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateSectionDialog
        spaceId={spaceId || ''}
        courseId={courseId || ''}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSectionCreated={handleSectionCreated}
      />
    </div>
  );
};

export default CourseSections;
