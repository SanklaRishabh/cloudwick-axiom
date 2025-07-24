
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Users, Play, Settings, Frame } from 'lucide-react';
import { useCourseDetail } from '@/hooks/useCourses';
import EditCourseDialog from '@/components/EditCourseDialog';
import DoodleAvatar from '@/components/DoodleAvatar';

interface CourseSection {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'reading' | 'quiz';
}

const tagColors = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-sky-100 text-sky-800 border-sky-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
];

const getSectionIcon = (type: string) => {
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

const CourseDetail: React.FC = () => {
  const { spaceId, courseId } = useParams<{ spaceId: string; courseId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { course, loading, updateCourse, deleteCourse } = useCourseDetail(
    spaceId || '', 
    courseId || ''
  );

  const handleDeleteCourse = async () => {
    await deleteCourse();
    navigate(`/dashboard/spaces/${spaceId}`);
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

  if (!course) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/dashboard/spaces/${spaceId}`)}
          className="mb-4 font-lexend"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Space
        </Button>
        <div className="text-center py-8">
          <p className="text-gray-500 font-lexend">Course not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/dashboard/spaces/${spaceId}`)}
        className="mb-4 font-lexend"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Space
      </Button>

      <div className="space-y-6">
        {/* Course Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 font-lexend">{course.CourseTitle}</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setEditDialogOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <DoodleAvatar 
                seed={course.CreatedBy} 
                size={28} 
                fallback={course.CreatedBy.substring(0, 2).toUpperCase()}
              />
              <span className="text-gray-700 font-lexend">Created by {course.CreatedBy}</span>
            </div>
            <div className="text-gray-600 font-lexend">
              Created: {new Date(course.CreatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Course Description */}
        <Card>
          <CardHeader>
            <CardTitle className="font-lexend">About this course</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed font-lexend">{course.Description}</p>
          </CardContent>
        </Card>

        {/* Tags */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 font-lexend">Skills you'll learn</h3>
          <div className="flex flex-wrap gap-2">
            {course.Tags && course.Tags.map((tag, index) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className={`${tagColors[index % tagColors.length]} font-lexend`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Course Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 font-lexend">Course Content</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections`)}
              title="View all sections"
            >
              <Frame className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {course.Sections && course.Sections.map((section, index) => (
              <Card 
                key={section.SectionId} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections/${section.SectionId}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 font-lexend">
                          {index + 1}. {section.SectionTitle}
                        </h4>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <EditCourseDialog
        course={course}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdateCourse={updateCourse}
        onDeleteCourse={handleDeleteCourse}
      />
    </div>
  );
};

export default CourseDetail;
