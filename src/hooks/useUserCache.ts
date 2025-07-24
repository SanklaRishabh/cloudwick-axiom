import { useState, useEffect } from 'react';
import { authService } from '@/lib/cognito';
import type { CognitoUser } from '@/lib/cognito';

interface UserCache {
  user: CognitoUser | null;
  timestamp: number;
  expiry: number; // 30 minutes
}

const CACHE_KEY = 'user_profile_cache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

export const useUserCache = () => {
  const [cachedUser, setCachedUser] = useState<CognitoUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCachedUser = (): CognitoUser | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const userCache: UserCache = JSON.parse(cached);
      if (Date.now() > userCache.expiry) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return userCache.user;
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const setCacheUser = (user: CognitoUser | null) => {
    if (!user) {
      localStorage.removeItem(CACHE_KEY);
      setCachedUser(null);
      return;
    }

    const userCache: UserCache = {
      user,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_EXPIRY
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(userCache));
    setCachedUser(user);
  };

  const fetchUser = async (): Promise<CognitoUser | null> => {
    setIsLoading(true);
    try {
      const user = await authService.getCurrentUser();
      setCacheUser(user);
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserFromCacheOrFetch = async (): Promise<CognitoUser | null> => {
    const cached = getCachedUser();
    if (cached) {
      setCachedUser(cached);
      return cached;
    }
    return await fetchUser();
  };

  useEffect(() => {
    const cached = getCachedUser();
    if (cached) {
      setCachedUser(cached);
    }
  }, []);

  return {
    user: cachedUser,
    isLoading,
    getUserFromCacheOrFetch,
    clearCache: () => setCacheUser(null),
    refreshUser: fetchUser
  };
};