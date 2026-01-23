import { useState, useCallback } from 'react';
import { createProfile, createTeam, getProfiles, getAllTeams } from '../utils/api';

// Hook to create profile and optionally refresh the profiles list
export function useCreateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const create = useCallback(async (payload: { name: string; password?: string }, opts?: { onSuccess?: (res: any) => void; refreshProfiles?: () => Promise<any> }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createProfile({ name: payload.name, password: payload.password });
      if (opts?.refreshProfiles) {
        await opts.refreshProfiles();
      }
      opts?.onSuccess?.(res);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

// Hook to create topic and optionally refresh topics list
export function useCreateTopic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const create = useCallback(async (payload: { name: string; profileId: string; pokemonIds?: string[] }, opts?: { onSuccess?: (res: any) => void; refreshTopics?: () => Promise<any> }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createTeam(payload);
      if (opts?.refreshTopics) {
        await opts.refreshTopics();
      }
      opts?.onSuccess?.(res);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}