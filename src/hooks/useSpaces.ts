import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Space {
  SpaceId: string;
  SpaceName: string;
  SpaceDescription: string;
  SpaceType: string;
  CreatedBy: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface SpacesResponse {
  Spaces: Space[];
}

export const useSpaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/spaces');
      const data: SpacesResponse = await response.json();
      setSpaces(data.Spaces || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch spaces';
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
    fetchSpaces();
  }, []);

  return {
    spaces,
    loading,
    error,
    fetchSpaces,
  };
};