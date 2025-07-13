import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Users, Play, Settings } from 'lucide-react';

interface SectionLesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'reading' | 'quiz';
  description?: string;
}

interface SectionDetail {
  id: string;
  title: string;
  description: string;
  courseTitle: string;
  instructor: string;
  enrolledCount: number;
  duration: string;
  progress?: number;
  tags: string[];
  lessons: SectionLesson[];
}

// Mock data for demonstration
const mockSectionDetails: Record<string, SectionDetail> = {
  '1': {
    id: '1',
    title: 'Introduction to Data Science',
    description: 'This section introduces the fundamental concepts of data science, including what it is, how it\'s used in various industries, and the basic tools and techniques you\'ll be learning throughout this course.',
    courseTitle: 'Introduction to Data Science',
    instructor: 'Dr. Sarah Johnson',
    enrolledCount: 24,
    duration: '2 hours',
    progress: 100,
    tags: ['Fundamentals', 'Overview', 'Getting Started'],
    lessons: [
      { id: '1', title: 'What is Data Science?', duration: '15 min', completed: true, type: 'video', description: 'Overview of data science field and applications' },
      { id: '2', title: 'Data Science Process', duration: '20 min', completed: true, type: 'video', description: 'Understanding the data science workflow' },
      { id: '3', title: 'Tools and Technologies', duration: '25 min', completed: true, type: 'reading', description: 'Introduction to Python, R, and other tools' },
      { id: '4', title: 'Knowledge Check', duration: '10 min', completed: true, type: 'quiz', description: 'Test your understanding of basic concepts' },
    ]
  },
  '2': {
    id: '2',
    title: 'Setting up Python Environment',
    description: 'Learn how to set up your Python development environment for data science work. This includes installing Python, setting up virtual environments, and installing essential packages.',
    courseTitle: 'Introduction to Data Science',
    instructor: 'Dr. Sarah Johnson',
    enrolledCount: 24,
    duration: '1.5 hours',
    progress: 100,
    tags: ['Python', 'Setup', 'Environment'],
    lessons: [
      { id: '1', title: 'Installing Python', duration: '15 min', completed: true, type: 'video', description: 'Download and install Python on your system' },
      { id: '2', title: 'Virtual Environments', duration: '20 min', completed: true, type: 'video', description: 'Creating isolated Python environments' },
      { id: '3', title: 'Package Management with pip', duration: '15 min', completed: true, type: 'reading', description: 'Installing and managing Python packages' },
      { id: '4', title: 'Setup Verification', duration: '10 min', completed: true, type: 'quiz', description: 'Verify your Python setup is working correctly' },
    ]
  },
  '3': {
    id: '3',
    title: 'Basic Statistics Review',
    description: 'A comprehensive review of statistical concepts that are essential for data science. Covers descriptive statistics, probability distributions, and hypothesis testing.',
    courseTitle: 'Introduction to Data Science',
    instructor: 'Dr. Sarah Johnson',
    enrolledCount: 24,
    duration: '3 hours',
    progress: 60,
    tags: ['Statistics', 'Probability', 'Foundations'],
    lessons: [
      { id: '1', title: 'Descriptive Statistics', duration: '25 min', completed: true, type: 'video', description: 'Mean, median, mode, and standard deviation' },
      { id: '2', title: 'Probability Basics', duration: '30 min', completed: true, type: 'reading', description: 'Understanding probability and distributions' },
      { id: '3', title: 'Hypothesis Testing', duration: '35 min', completed: false, type: 'video', description: 'Statistical significance and p-values' },
      { id: '4', title: 'Practice Problems', duration: '20 min', completed: false, type: 'quiz', description: 'Apply statistical concepts to real problems' },
    ]
  },
  '4': {
    id: '4',
    title: 'NumPy and Pandas Basics',
    description: 'Introduction to the most important Python libraries for data manipulation and analysis. Learn how to work with arrays, dataframes, and perform basic data operations.',
    courseTitle: 'Introduction to Data Science',
    instructor: 'Dr. Sarah Johnson',
    enrolledCount: 24,
    duration: '4 hours',
    progress: 0,
    tags: ['NumPy', 'Pandas', 'Data Manipulation'],
    lessons: [
      { id: '1', title: 'NumPy Arrays', duration: '30 min', completed: false, type: 'video', description: 'Working with numerical arrays in Python' },
      { id: '2', title: 'Pandas DataFrames', duration: '35 min', completed: false, type: 'video', description: 'Introduction to pandas data structures' },
      { id: '3', title: 'Data Loading and Saving', duration: '25 min', completed: false, type: 'reading', description: 'Reading from and writing to various file formats' },
      { id: '4', title: 'Data Manipulation Exercises', duration: '30 min', completed: false, type: 'quiz', description: 'Hands-on practice with data manipulation' },
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
  const [section, setSection] = useState<SectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sectionId) {
      // Simulate API call
      setTimeout(() => {
        const sectionDetail = mockSectionDetails[sectionId];
        setSection(sectionDetail || null);
        setLoading(false);
      }, 300);
    }
  }, [sectionId]);

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
        onClick={() => navigate(`/dashboard/spaces/${spaceId}/courses/${courseId}`)}
        className="mb-4 font-lexend"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Course
      </Button>

      <div className="space-y-6">
        {/* Section Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 font-lexend">{section.title}</h1>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-lexend">{section.enrolledCount} enrolled</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-lexend">{section.duration}</span>
            </div>
            <div className="text-gray-700 font-lexend">
              Instructor: {section.instructor}
            </div>
          </div>

          {section.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 font-lexend">Progress</span>
                <span className="text-sm font-medium text-blue-600 font-lexend">{section.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${section.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Section Description */}
        <Card>
          <CardHeader>
            <CardTitle className="font-lexend">About this section</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed font-lexend">{section.description}</p>
          </CardContent>
        </Card>

        {/* Tags */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 font-lexend">Topics covered</h3>
          <div className="flex flex-wrap gap-2">
            {section.tags.map((tag, index) => (
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

        {/* Section Lessons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 font-lexend">Lessons</h3>
          <div className="space-y-3">
            {section.lessons.map((lesson, index) => (
              <Card 
                key={lesson.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  lesson.completed ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        lesson.completed 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 font-lexend">
                          {index + 1}. {lesson.title}
                        </h4>
                        <p className="text-sm text-gray-600 font-lexend">
                          {lesson.duration} • {lesson.type}
                        </p>
                        {lesson.description && (
                          <p className="text-xs text-gray-500 font-lexend mt-1">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {lesson.completed && (
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

export default SectionDetail;