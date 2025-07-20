
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Section {
  SectionId: string;
  SectionTitle: string;
  Description: string;
  CreatedBy: string;
}

export interface SectionsResponse {
  Sections: Section[];
  Pagination: {
    Offset: number;
    Limit: number;
    Total: number;
  };
}

export interface CreateSectionData {
  SectionTitle: string;
  Description: string;
}

export const useSections = (spaceId: string, courseId: string) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    Offset: 0,
    Limit: 10,
    Total: 0
  });
  const { toast } = useToast();

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/spaces/${spaceId}/courses/${courseId}/sections`);
      const data: SectionsResponse = await response.json();
      setSections(data.Sections || []);
      setPagination(data.Pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sections';
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
    if (spaceId && courseId) {
      fetchSections();
    }
  }, [spaceId, courseId]);

  return {
    sections,
    loading,
    error,
    pagination,
    fetchSections,
  };
};

export const useCreateSection = (spaceId: string, courseId: string) => {
  const { toast } = useToast();

  const createSection = async (sectionData: CreateSectionData) => {
    try {
      const response = await apiClient.post(`/spaces/${spaceId}/courses/${courseId}/sections`, sectionData);
      const data = await response.json();
      toast({
        title: "Success",
        description: data.Message || "Section created successfully",
      });
      return data.SectionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create section';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return { createSection };
};
