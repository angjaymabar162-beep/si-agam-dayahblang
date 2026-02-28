import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Badge, UserBadge, LeaderboardEntry } from '@/types';

const GAMIFICATION_KEY = 'gamification';

// Fetch all badges
export function useBadges() {
  return useQuery({
    queryKey: [GAMIFICATION_KEY, 'badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
  });
}

// Fetch user's badges
export function useUserBadges(userId?: string) {
  return useQuery({
    queryKey: [GAMIFICATION_KEY, 'user-badges', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!userId,
  });
}

// Fetch user's streak
export function useUserStreak(userId?: string) {
  return useQuery({
    queryKey: [GAMIFICATION_KEY, 'streak', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Fetch leaderboard
export function useLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: [GAMIFICATION_KEY, 'leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });
}
