import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PromptFilters, PromptCategory } from '@/types';

interface MarketplaceState {
  filters: PromptFilters;
  viewMode: 'grid' | 'list';
  setFilters: (filters: Partial<PromptFilters>) => void;
  resetFilters: () => void;
  setCategory: (category: PromptCategory | 'all') => void;
  setSortBy: (sortBy: PromptFilters['sortBy']) => void;
  setSearch: (search: string) => void;
  setPriceRange: (min: number, max: number) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

const defaultFilters: PromptFilters = {
  category: 'all',
  minPrice: 0,
  maxPrice: 1000,
  sortBy: 'newest',
  search: '',
};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      viewMode: 'grid',
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters },
      })),
      resetFilters: () => set({ filters: defaultFilters }),
      setCategory: (category) => set((state) => ({
        filters: { ...state.filters, category },
      })),
      setSortBy: (sortBy) => set((state) => ({
        filters: { ...state.filters, sortBy },
      })),
      setSearch: (search) => set((state) => ({
        filters: { ...state.filters, search },
      })),
      setPriceRange: (min, max) => set((state) => ({
        filters: { ...state.filters, minPrice: min, maxPrice: max },
      })),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'marketplace-storage',
      partialize: (state) => ({ filters: state.filters, viewMode: state.viewMode }),
    }
  )
);
