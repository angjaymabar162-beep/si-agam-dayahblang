import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useGeneratorStore } from '@/lib/store';

interface GenerationParams {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export function useGeneration() {
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { addToHistory } = useGeneratorStore();

  const generateMutation = useMutation({
    mutationFn: async (params: GenerationParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Generation failed');
      }

      return response;
    },
  });

  const generate = useCallback(async (params: GenerationParams) => {
    setIsStreaming(true);
    setStreamedContent('');

    try {
      const response = await generateMutation.mutateAsync(params);
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                fullContent += content;
                setStreamedContent(fullContent);
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }

      // Add to history
      addToHistory({
        id: crypto.randomUUID(),
        prompt: params.prompt,
        result: fullContent,
        model: params.model || 'default',
        createdAt: new Date().toISOString(),
      });

      // Update streak
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('update_streak', { user_uuid: user.id });
      }

      return fullContent;
    } finally {
      setIsStreaming(false);
    }
  }, [generateMutation, addToHistory]);

  return {
    generate,
    streamedContent,
    isStreaming,
    isPending: generateMutation.isPending,
    error: generateMutation.error,
  };
}
