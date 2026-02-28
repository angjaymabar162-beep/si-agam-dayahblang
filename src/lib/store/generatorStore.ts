import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GenerationHistory {
  id: string;
  prompt: string;
  result: string;
  model: string;
  createdAt: string;
}

interface GeneratorState {
  history: GenerationHistory[];
  isGenerating: boolean;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  addToHistory: (item: GenerationHistory) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  setIsGenerating: (value: boolean) => void;
  setSelectedModel: (model: string) => void;
  setTemperature: (value: number) => void;
  setMaxTokens: (value: number) => void;
}

const DEFAULT_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4O Mini', provider: 'OpenAI' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'Google' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta' },
];

export const AVAILABLE_MODELS = DEFAULT_MODELS;

export const useGeneratorStore = create<GeneratorState>()(
  persist(
    (set) => ({
      history: [],
      isGenerating: false,
      selectedModel: DEFAULT_MODELS[0].id,
      temperature: 0.7,
      maxTokens: 2000,
      addToHistory: (item) => set((state) => ({ 
        history: [item, ...state.history].slice(0, 50) 
      })),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((item) => item.id !== id),
      })),
      clearHistory: () => set({ history: [] }),
      setIsGenerating: (value) => set({ isGenerating: value }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setTemperature: (value) => set({ temperature: value }),
      setMaxTokens: (value) => set({ maxTokens: value }),
    }),
    {
      name: 'generator-storage',
      partialize: (state) => ({ 
        history: state.history,
        selectedModel: state.selectedModel,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
      }),
    }
  )
);
