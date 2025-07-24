
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import CreateCourseDialog from './CreateCourseDialog';

interface SpaceCoursesProps {
  spaceId: string;
}

const SpaceCourses: React.FC<SpaceCoursesProps> = ({ spaceId }) => {
  const navigate = useNavigate();
  const { courses, loading, createCourse } = useCourses(spaceId);

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Courses</h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Courses</h2>
        <CreateCourseDialog onCreateCourse={createCourse} spaceId={spaceId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <Card 
            key={course.CourseId} 
            className="hover:shadow-md transition-all duration-300 cursor-pointer animate-fade-in-up hover:scale-105"
            onClick={() => handleCourseClick(course.CourseId)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <BookOpen className="h-8 w-8 text-cyan-600" />
              </div>
              <CardTitle>{course.CourseTitle}</CardTitle>
              <CardDescription>
                {course.Description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-700">
                  Created by: {course.CreatedBy}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SpaceCourses;
