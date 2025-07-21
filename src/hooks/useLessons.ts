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