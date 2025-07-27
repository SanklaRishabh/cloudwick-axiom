import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface QuestionSet {
  RequestId: string;
  UserId: string;
  SpaceId: string;
  CreatedAt: string;
}

export interface Question {
  Option1: string;
  Option2: string;
  Option3: string;
  Option4: string;
  Question: string;
  SequenceNumber: number;
}

export interface TestResult {
  Explanation: string;
  Answer: string;
  Question: string;
  SequenceNumber: number;
}

export const useQuestionSets = (spaceId: string) => {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/spaces/${spaceId}/questions`);
      const data = await response.json();
      setQuestionSets(data.QuestionSet || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch question sets';
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

  const createQuestionSet = async () => {
    try {
      const response = await apiClient.post(`/spaces/${spaceId}/questions`);
      const data = await response.json();
      
      if (data.RequestId) {
        toast({
          title: "Success",
          description: data.Message || "Question set created successfully",
        });
        fetchQuestionSets(); // Refresh the list
        return data.RequestId;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create question set';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteQuestionSet = async (requestId: string) => {
    try {
      const response = await apiClient.delete(`/spaces/${spaceId}/questions/${requestId}`);
      const data = await response.json();
      
      toast({
        title: "Success",
        description: data.Message || "Question set deleted successfully",
      });
      fetchQuestionSets(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete question set';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (spaceId) {
      fetchQuestionSets();
    }
  }, [spaceId]);

  return {
    questionSets,
    loading,
    error,
    fetchQuestionSets,
    createQuestionSet,
    deleteQuestionSet,
  };
};

export const useQuestions = (spaceId: string, requestId: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/spaces/${spaceId}/questions/${requestId}`);
      const data = await response.json();
      const sortedQuestions = (data.Questions || []).sort((a: Question, b: Question) => 
        a.SequenceNumber - b.SequenceNumber
      );
      setQuestions(sortedQuestions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
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

  const submitAnswers = async (options: string[]) => {
    try {
      const response = await apiClient.post(`/spaces/${spaceId}/questions/${requestId}`, {
        Options: options
      });
      const data = await response.json();
      return data.Items || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answers';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    if (spaceId && requestId) {
      fetchQuestions();
    }
  }, [spaceId, requestId]);

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    submitAnswers,
  };
};