import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Course {
  CourseId: string;
  CourseTitle: string;
  Description: string;
  CreatedBy: string;
}

export interface CourseDetail {
  CourseId: string;
  CourseTitle: string;
  Description: string;
  SpaceId: string;
  Tags: string[];
  Sections: Array<{
    SectionTitle: string;
    SectionId: string;
  }>;
  CreatedBy: string;
  CreatedAt: string;
  LastModifiedBy: string;
  LastModifiedAt: string;
}

export interface CreateCourseData {
  CourseTitle: string;
  Description: string;
  Tags: string[];
}

export interface UpdateCourseData {
  CourseTitle: string;
  Description: string;
  Tags: string[];
}

export const useCourses = (spaceId: string) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/spaces/${spaceId}/courses`);
      const data = await response.json();
      setCourses(data.Courses || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: CreateCourseData) => {
    try {
      const response = await apiClient.post(`/spaces/${spaceId}/courses`, courseData);
      const data = await response.json();
      toast({
        title: "Success",
        description: data.Message || "Course created successfully",
      });
      await fetchCourses(); // Refresh the list
      return data.CourseId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (spaceId) {
      fetchCourses();
    }
  }, [spaceId]);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
  };
};

export const useCourseDetail = (spaceId: string, courseId: string) => {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/spaces/${spaceId}/courses/${courseId}`);
      const data = await response.json();
      setCourse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch course details';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (courseData: UpdateCourseData) => {
    try {
      const response = await apiClient.put(`/spaces/${spaceId}/courses/${courseId}`, courseData);
      const data = await response.json();
      toast({
        title: "Success",
        description: data.Message || "Course updated successfully",
      });
      await fetchCourseDetail(); // Refresh the course data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteCourse = async () => {
    try {
      const response = await apiClient.delete(`/spaces/${spaceId}/courses/${courseId}`);
      const data = await response.json();
      toast({
        title: "Success",
        description: data.Message || "Course deleted successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (spaceId && courseId) {
      fetchCourseDetail();
    }
  }, [spaceId, courseId]);

  return {
    course,
    loading,
    error,
    fetchCourseDetail,
    updateCourse,
    deleteCourse,
  };
};