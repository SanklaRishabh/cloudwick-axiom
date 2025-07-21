import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface CreateLessonData {
  LessonTitle: string;
  Content: string;
}

export interface LessonDetail {
  LessonId: string;
  LessonTitle: string;
  Content: string;
  CreatedBy: string;
  CreatedAt: string;
}

export const useCreateLesson = (spaceId: string, courseId: string, sectionId: string) => {
  const { toast } = useToast();

  const createLesson = async (lessonData: CreateLessonData) => {
    try {
      const response = await apiClient.post(`/spaces/${spaceId}/courses/${courseId}/sections/${sectionId}/lessons`, lessonData);
      const data = await response.json();
      toast({
        title: "Success",
        description: data.Message || "Lesson created successfully",
      });
      return data.LessonId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lesson';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return { createLesson };
};

export const useUpdateLesson = (spaceId: string, courseId: string, sectionId: string, lessonId: string) => {
  const { toast } = useToast();

  const updateLesson = async (lessonData: CreateLessonData) => {
    try {
      const response = await apiClient.put(`/spaces/${spaceId}/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, lessonData);
      const data = await response.json();
      toast({
        title: "Success",
        description: data.Message || "Lesson updated successfully",
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lesson';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return { updateLesson };
};

export const useDeleteLesson = (spaceId: string, courseId: string, sectionId: string, lessonId: string) => {
  const { toast } = useToast();

  const deleteLesson = async () => {
    try {
      const response = await apiClient.delete(`/spaces/${spaceId}/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
      const data = await response.json();
      toast({
        title: "Success",
        description: data.Message || "Lesson deleted successfully",
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lesson';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return { deleteLesson };
};

export const useLessonDetail = (spaceId: string, courseId: string, sectionId: string, lessonId: string) => {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLessonDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/spaces/${spaceId}/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`);
      const data: LessonDetail = await response.json();
      setLesson(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lesson details';
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

  useEffect(() => {
    if (spaceId && courseId && sectionId && lessonId) {
      fetchLessonDetail();
    }
  }, [spaceId, courseId, sectionId, lessonId]);

  return {
    lesson,
    loading,
    error,
    fetchLessonDetail,
  };
};