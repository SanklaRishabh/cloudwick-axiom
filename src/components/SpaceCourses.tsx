
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock, Plus } from 'lucide-react';

interface SpaceCoursesProps {
  spaceId: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  enrolledCount: number;
  duration: string;
  progress?: number;
}

// Mock data for demonstration
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Data Science',
    description: 'Learn the fundamentals of data science including statistics, programming, and machine learning.',
    instructor: 'Dr. Sarah Johnson',
    enrolledCount: 24,
    duration: '8 weeks',
    progress: 60,
  },
  {
    id: '2',
    title: 'Advanced Python Programming',
    description: 'Deep dive into advanced Python concepts and best practices for professional development.',
    instructor: 'Mark Thompson',
    enrolledCount: 18,
    duration: '6 weeks',
    progress: 30,
  },
  {
    id: '3',
    title: 'Project Management Fundamentals',
    description: 'Master the essential skills needed to successfully manage projects from start to finish.',
    instructor: 'Lisa Chen',
    enrolledCount: 32,
    duration: '4 weeks',
  },
];

const SpaceCourses: React.FC<SpaceCoursesProps> = ({ spaceId }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 font-lexend">Courses</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 font-lexend flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <BookOpen className="h-8 w-8 text-blue-600" />
                {course.progress && (
                  <div className="text-sm text-blue-600 font-semibold font-lexend">
                    {course.progress}% Complete
                  </div>
                )}
              </div>
              <CardTitle className="font-lexend">{course.title}</CardTitle>
              <CardDescription className="font-lexend">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="font-lexend">{course.enrolledCount} enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-lexend">{course.duration}</span>
                </div>
                <div className="text-sm text-gray-700 font-lexend">
                  Instructor: {course.instructor}
                </div>
                {course.progress && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SpaceCourses;
