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

export const useCourses = (spaceId: string, searchQuery?: string, page: number = 1, limit: number = 9) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const { toast } = useToast();

  const fetchCourses = async (searchTerm?: string, pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching courses for space: ${spaceId}`);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString()
      });
      
      if (searchTerm?.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const response = await apiClient.get(`/spaces/${spaceId}/courses?${params.toString()}`, { requireAuth: true });
      
      if (response.Courses) {
        setCourses(response.Courses);
        setTotalPages(response.TotalPages || 1);
        setCurrentPage(pageNum);
        console.log(`Fetched ${response.Courses.length} courses`);
      } else {
        setCourses([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses');
      setCourses([]);
      setTotalPages(1);
      setCurrentPage(1);
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: CreateCourseData) => {
    try {
      const response = await apiClient.post(`/spaces/${spaceId}/courses`, courseData, { requireAuth: true });
      
      toast({
        title: "Success",
        description: response.Message || "Course created successfully",
      });
      await fetchCourses(searchQuery, currentPage); // Refresh the list
      return response.CourseId;
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

  const searchCourses = (searchTerm: string) => {
    fetchCourses(searchTerm, 1);
  };

  const goToPage = (pageNum: number) => {
    fetchCourses(searchQuery, pageNum);
  };

  useEffect(() => {
    if (spaceId) {
      fetchCourses(searchQuery, page);
    }
  }, [spaceId]);

  return {
    courses,
    loading,
    error,
    totalPages,
    currentPage,
    createCourse,
    searchCourses,
    goToPage,
    refetch: () => fetchCourses(searchQuery, currentPage),
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
      const response = await apiClient.get(`/spaces/${spaceId}/courses/${courseId}`, { requireAuth: true });
      setCourse(response);
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
      const response = await apiClient.put(`/spaces/${spaceId}/courses/${courseId}`, courseData, { requireAuth: true });
      toast({
        title: "Success",
        description: response.Message || "Course updated successfully",
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
      const response = await apiClient.delete(`/spaces/${spaceId}/courses/${courseId}`, { requireAuth: true });
      toast({
        title: "Success",
        description: response.Message || "Course deleted successfully",
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