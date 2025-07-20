
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface FileItem {
  FileId: string;
  FileName: string;
  FilePath: string;
  FileType: string;
  FileDescription: string;
  Tags: string[];
  FileStatus: string;
}

export interface CreateFileData {
  FileName: string;
  FileDescription: string;
  FileType: string;
  Tags: string[];
}

export interface CreateWebsiteData {
  WebsiteUrl: string;
}

export interface FileUploadResponse {
  Message: string;
  FileId: string;
  PresignedUrl: string;
  FilePath: string;
  FileType: string;
}

export interface WebsiteResponse {
  Message: string;
  FileId: string;
  FilePath: string;
}

export const useFiles = (spaceId: string) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/spaces/${spaceId}/files`);
      const data = await response.json();
      setFiles(data.Files || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch files';
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

  const uploadFile = async (fileData: CreateFileData): Promise<FileUploadResponse> => {
    try {
      const response = await apiClient.post(`/spaces/${spaceId}/files?action=file`, fileData);
      const data = await response.json();
      toast({
        title: "Success",
        description: data.Message || "File upload initiated successfully",
      });
      await fetchFiles(); // Refresh the list
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const submitWebsite = async (websiteData: CreateWebsiteData): Promise<WebsiteResponse> => {
    try {
      const response = await apiClient.post(`/spaces/${spaceId}/files?action=website`, websiteData);
      const data = await response.json();
      toast({
        title: "Success",
        description: data.Message || "Website submitted successfully",
      });
      await fetchFiles(); // Refresh the list
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit website';
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
      fetchFiles();
    }
  }, [spaceId]);

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    submitWebsite,
  };
};
