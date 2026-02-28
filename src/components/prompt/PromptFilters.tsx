import { Search, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMarketplaceStore } from '@/lib/store';
import type { PromptCategory } from '@/types';

const categories: { value: PromptCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'writing', label: 'Writing' },
  { value: 'coding', label: 'Coding' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'creative', label: 'Creative' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export function PromptFilters() {
  const {
    filters,
    viewMode,
    setCategory,
    setSortBy,
    setSearch,
    setPriceRange,
    setViewMode,
    resetFilters,
  } = useMarketplaceStore();

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.minPrice !== 0 ||
    filters.maxPrice !== 1000 ||
    filters.search;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearch('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Category Select */}
        <Select value={filters.category} onValueChange={(v) => setCategory(v as PromptCategory | 'all')}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Select */}
        <Select value={filters.sortBy} onValueChange={(v) => setSortBy(v as typeof filters.sortBy)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Price Range</label>
                <Slider
                  value={[filters.minPrice || 0, filters.maxPrice || 1000]}
                  onValueChange={([min, max]) => setPriceRange(min, max)}
                  max={1000}
                  step={10}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{filters.minPrice} cr</span>
                  <span>{filters.maxPrice} cr</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-none rounded-l-md"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-none rounded-r-md"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Category: {filters.category}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setCategory('all')}
              />
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSearch('')}
              />
            </Badge>
          )}
          {(filters.minPrice !== 0 || filters.maxPrice !== 1000) && (
            <Badge variant="secondary" className="gap-1">
              Price: {filters.minPrice}-{filters.maxPrice} cr
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setPriceRange(0, 1000)}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
