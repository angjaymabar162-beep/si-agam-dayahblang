import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Prompt, PromptFormData, PromptFilters } from '@/types';

const PROMPTS_KEY = 'prompts';

// Fetch all prompts with filters
export function usePrompts(filters?: PromptFilters) {
  return useQuery({
    queryKey: [PROMPTS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('prompts')
        .select('*, creator:users(*)')
        .eq('is_published', true);

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      switch (filters?.sortBy) {
        case 'popular':
          query = query.order('sales_count', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating_average', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Prompt[];
    },
  });
}

// Fetch single prompt
export function usePrompt(id: string) {
  return useQuery({
    queryKey: [PROMPTS_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*, creator:users(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Prompt;
    },
    enabled: !!id,
  });
}

// Fetch featured prompts
export function useFeaturedPrompts() {
  return useQuery({
    queryKey: [PROMPTS_KEY, 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*, creator:users(*)')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('sales_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Prompt[];
    },
  });
}

// Fetch user's prompts
export function useUserPrompts(userId?: string) {
  return useQuery({
    queryKey: [PROMPTS_KEY, 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!userId,
  });
}

// Create prompt
export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptData: PromptFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('prompts')
        .insert({
          ...promptData,
          creator_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_KEY] });
    },
  });
}

// Update prompt
export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PromptFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Prompt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [PROMPTS_KEY] });
    },
  });
}

// Delete prompt
export function useDeletePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_KEY] });
    },
  });
}

// Purchase prompt
export function usePurchasePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('purchase_prompt', {
        buyer_uuid: userData.user.id,
        prompt_uuid: promptId,
      });

      if (error) throw error;
      if (!data) throw new Error('Purchase failed');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
