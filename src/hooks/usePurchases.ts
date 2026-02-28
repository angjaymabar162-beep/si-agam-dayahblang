import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Purchase } from '@/types';

const PURCHASES_KEY = 'purchases';

// Fetch user's purchases
export function usePurchases() {
  return useQuery({
    queryKey: [PURCHASES_KEY],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('purchases')
        .select('*, prompt:prompts(*)')
        .eq('buyer_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Purchase[];
    },
  });
}

// Check if user has purchased a prompt
export function useHasPurchased(promptId: string) {
  return useQuery({
    queryKey: [PURCHASES_KEY, 'check', promptId],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return false;

      const { data, error } = await supabase
        .from('purchases')
        .select('id')
        .eq('buyer_id', authUser.id)
        .eq('prompt_id', promptId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!promptId,
  });
}
