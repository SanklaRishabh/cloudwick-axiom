import { useState, useEffect } from 'react';

export interface DevArticle {
  id: number;
  title: string;
  description: string;
  cover_image: string | null;
  readable_publish_date: string;
  tag_list: string[];
  url: string;
  comments_count: number;
  positive_reactions_count: number;
  reading_time_minutes: number;
  user: {
    name: string;
    username: string;
    profile_image_90: string;
  };
  organization?: {
    name: string;
    username: string;
    profile_image_90: string;
  };
}

interface UseDevArticlesReturn {
  articles: DevArticle[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_KEY = 'dev_articles_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useDevArticles = (limit: number = 6): UseDevArticlesReturn => {
  const [articles, setArticles] = useState<DevArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`https://dev.to/api/articles?per_page=${limit}&top=7`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data: DevArticle[] = await response.json();
      
      // Cache the articles
      const cacheData = {
        articles: data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
      
      // Try to load from cache on error
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { articles: cachedArticles } = JSON.parse(cachedData);
        setArticles(cachedArticles);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchArticles();
  };

  useEffect(() => {
    // Check cache first
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { articles: cachedArticles, timestamp } = JSON.parse(cachedData);
      const isValid = Date.now() - timestamp < CACHE_DURATION;
      
      if (isValid) {
        setArticles(cachedArticles);
        setLoading(false);
        return;
      }
    }

    fetchArticles();
  }, [limit]);

  return { articles, loading, error, refetch };
};