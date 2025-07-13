import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Users, Play, Settings, Frame } from 'lucide-react';

interface CourseSection {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'reading' | 'quiz';
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  instructor: string;
  enrolledCount: number;
  duration: string;
  progress?: number;
  tags: string[];
  sections: CourseSection[];
}

// Mock data for demonstration
const mockCourseDetails: Record<string, CourseDetail> = {
  '1': {
    id: '1',
    title: 'Introduction to Data Science',
    description: 'Learn the fundamentals of data science including statistics, programming, and machine learning. This comprehensive course covers everything from basic statistical concepts to advanced machine learning algorithms, providing you with the skills needed to analyze data and extract meaningful insights.',
    instructor: 'Dr. Sarah Johnson',
    enrolledCount: 24,
    duration: '8 weeks',
    progress: 60,
    tags: ['Python', 'Statistics', 'Machine Learning', 'Data Analysis'],
    sections: [
      { id: '1', title: 'Introduction to Data Science', duration: '15 min', completed: true, type: 'video' },
      { id: '2', title: 'Setting up Python Environment', duration: '20 min', completed: true, type: 'video' },
      { id: '3', title: 'Basic Statistics Review', duration: '30 min', completed: true, type: 'reading' },
      { id: '4', title: 'NumPy and Pandas Basics', duration: '45 min', completed: false, type: 'video' },
      { id: '5', title: 'Data Visualization with Matplotlib', duration: '35 min', completed: false, type: 'video' },
      { id: '6', title: 'Statistics Quiz', duration: '10 min', completed: false, type: 'quiz' },
    ]
  },
  '2': {
    id: '2',
    title: 'Advanced Python Programming',
    description: 'Deep dive into advanced Python concepts and best practices for professional development. Master object-oriented programming, design patterns, testing, and deployment strategies used in enterprise-level applications.',
    instructor: 'Mark Thompson',
    enrolledCount: 18,
    duration: '6 weeks',
    progress: 30,
    tags: ['Python', 'OOP', 'Testing', 'Design Patterns'],
    sections: [
      { id: '1', title: 'Advanced Functions and Decorators', duration: '40 min', completed: true, type: 'video' },
      { id: '2', title: 'Object-Oriented Programming', duration: '50 min', completed: false, type: 'video' },
      { id: '3', title: 'Design Patterns in Python', duration: '60 min', completed: false, type: 'reading' },
      { id: '4', title: 'Unit Testing and TDD', duration: '45 min', completed: false, type: 'video' },
    ]
  },
  '3': {
    id: '3',
    title: 'Project Management Fundamentals',
    description: 'Master the essential skills needed to successfully manage projects from start to finish. Learn industry-standard methodologies, tools, and techniques used by professional project managers.',
    instructor: 'Lisa Chen',
    enrolledCount: 32,
    duration: '4 weeks',
    tags: ['Project Management', 'Agile', 'Scrum', 'Leadership'],
    sections: [
      { id: '1', title: 'Project Management Overview', duration: '25 min', completed: false, type: 'video' },
      { id: '2', title: 'Agile vs Waterfall', duration: '30 min', completed: false, type: 'reading' },
      { id: '3', title: 'Scrum Framework', duration: '40 min', completed: false, type: 'video' },
      { id: '4', title: 'Risk Management', duration: '35 min', completed: false, type: 'video' },
    ]
  }
};

const tagColors = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
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
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      // Simulate API call
      setTimeout(() => {
        const courseDetail = mockCourseDetails[courseId];
        setCourse(courseDetail || null);
        setLoading(false);
      }, 300);
    }
  }, [courseId]);

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
            <h1 className="text-3xl font-bold text-gray-900 font-lexend">{course.title}</h1>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-lexend">{course.enrolledCount} enrolled</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-lexend">{course.duration}</span>
            </div>
            <div className="text-gray-700 font-lexend">
              Instructor: {course.instructor}
            </div>
          </div>

          {course.progress && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 font-lexend">Progress</span>
                <span className="text-sm font-medium text-blue-600 font-lexend">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Course Description */}
        <Card>
          <CardHeader>
            <CardTitle className="font-lexend">About this course</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed font-lexend">{course.description}</p>
          </CardContent>
        </Card>

        {/* Tags */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 font-lexend">Skills you'll learn</h3>
          <div className="flex flex-wrap gap-2">
            {course.tags.map((tag, index) => (
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Frame className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {course.sections.map((section, index) => (
              <Card 
                key={section.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  section.completed ? 'bg-green-50 border-green-200' : ''
                }`}
                onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}/sections/${section.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        section.completed 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getSectionIcon(section.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 font-lexend">
                          {index + 1}. {section.title}
                        </h4>
                        <p className="text-sm text-gray-600 font-lexend">
                          {section.duration} • {section.type}
                        </p>
                      </div>
                    </div>
                    {section.completed && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 font-lexend">
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;