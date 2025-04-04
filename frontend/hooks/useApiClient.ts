import { useAuth } from '@/contexts/AuthContext';

export function useApiClient() {
  const { token, logout } = useAuth();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      logout(); // ← 여기가 핵심
      throw new Error('Unauthorized');
    }

    return res;
  };

  return { fetchWithAuth };
};
