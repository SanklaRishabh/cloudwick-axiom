import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useLessonDetail } from '@/hooks/useLessons';

const LessonDetail: React.FC = () => {
  const { spaceId, courseId, sectionId, lessonId } = useParams<{
    spaceId: string;
    courseId: string;
    sectionId: string;
    lessonId: string;
  }>();
  const navigate = useNavigate();

  const { lesson, loading } = useLessonDetail(
    spaceId || '',
    courseId || '',
    sectionId || '',
    lessonId || ''
  );

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
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections/${sectionId}`)}
        className="mb-4 font-lexend"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Section
      </Button>

      <div className="space-y-6">
        {/* Lesson Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-lexend">{lesson.LessonTitle}</h1>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="text-gray-700 font-lexend">
              Created by: {lesson.CreatedBy}
            </div>
            <div className="text-gray-700 font-lexend">
              Created: {new Date(lesson.CreatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <Card>
          <CardHeader>
            <CardTitle className="font-lexend">Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none font-lexend"
              dangerouslySetInnerHTML={{ __html: lesson.Content }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonDetail;