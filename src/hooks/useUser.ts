import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { User, UserProfile } from '@/types';

const USER_KEY = 'user';

// Fetch current user profile
export function useCurrentUser() {
  return useQuery({
    queryKey: [USER_KEY, 'current'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;
      return data as User;
    },
  });
}

// Fetch user profile with stats
export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: [USER_KEY, 'profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: streakData, error: streakError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakError && streakError.code !== 'PGRST116') throw streakError;

      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('id, sales_count')
        .eq('creator_id', userId);

      if (promptsError) throw promptsError;

      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('id')
        .eq('buyer_id', userId);

      if (purchasesError) throw purchasesError;

      const totalSales = promptsData?.reduce((sum, p) => sum + p.sales_count, 0) || 0;
      const totalPrompts = promptsData?.length || 0;
      const totalPurchases = purchasesData?.length || 0;

      return {
        ...userData,
        streak_count: streakData?.current_streak || 0,
        longest_streak: streakData?.longest_streak || 0,
        last_active_date: streakData?.last_active_date || null,
        total_prompts_generated: totalPrompts,
        total_prompts_purchased: totalPurchases,
        total_prompts_sold: totalSales,
        reputation_score: totalSales > 0 ? Math.min(5, 1 + totalSales * 0.1) : 0,
      } as UserProfile;
    },
    enabled: !!userId,
  });
}

// Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', authUser.id)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USER_KEY, 'current'] });
      queryClient.invalidateQueries({ queryKey: [USER_KEY, 'profile', data.id] });
    },
  });
}

// Update user avatar
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${authUser.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', authUser.id)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USER_KEY, 'current'] });
      queryClient.invalidateQueries({ queryKey: [USER_KEY, 'profile', data.id] });
    },
  });
}
