import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  useUserPrompts,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
  useCurrentUser,
} from '@/hooks';
import type { Prompt, PromptFormData, PromptCategory } from '@/types';

const categories: { value: PromptCategory; label: string }[] = [
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

export function CreatorDashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: prompts = [], isLoading } = useUserPrompts(user?.id);
  const createMutation = useCreatePrompt();
  const updateMutation = useUpdatePrompt();
  const deleteMutation = useDeletePrompt();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<PromptFormData>>({
    title: '',
    description: '',
    content: '',
    category: 'other',
    tags: [],
    price: 0,
  });
  const [tagInput, setTagInput] = useState('');

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      category: 'other',
      tags: [],
      price: 0,
    });
    setTagInput('');
  };

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData as PromptFormData);
      toast.success('Prompt created successfully!');
      setShowCreateDialog(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create prompt');
    }
  };

  const handleUpdate = async () => {
    if (!editingPrompt) return;

    try {
      await updateMutation.mutateAsync({
        id: editingPrompt.id,
        ...formData,
      });
      toast.success('Prompt updated successfully!');
      setEditingPrompt(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update prompt');
    }
  };

  const handleDelete = async () => {
    if (!deletingPrompt) return;

    try {
      await deleteMutation.mutateAsync(deletingPrompt.id);
      toast.success('Prompt deleted successfully!');
      setDeletingPrompt(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete prompt');
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags,
      price: prompt.price,
    });
  };

  const handleTogglePublish = async (prompt: Prompt) => {
    try {
      await updateMutation.mutateAsync({
        id: prompt.id,
        is_published: !prompt.is_published,
      });
      toast.success(prompt.is_published ? 'Prompt unpublished' : 'Prompt published');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update prompt');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  // Calculate stats
  const totalSales = prompts.reduce((sum, p) => sum + p.sales_count, 0);
  const totalRevenue = prompts.reduce((sum, p) => sum + p.sales_count * p.price, 0);
  const publishedCount = prompts.filter((p) => p.is_published).length;

  const stats = [
    { title: 'Total Prompts', value: prompts.length, icon: Package },
    { title: 'Published', value: publishedCount, icon: Eye },
    { title: 'Total Sales', value: totalSales, icon: TrendingUp },
    { title: 'Total Revenue', value: `${totalRevenue} cr`, icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and publish your prompts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Prompt
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prompts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any prompts yet.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Your First Prompt
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{prompt.title}</h4>
                      {prompt.is_published ? (
                        <Badge variant="default" className="text-xs">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Draft
                        </Badge>
                      )}
                      {prompt.is_featured && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {prompt.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{prompt.price} cr</span>
                      <span>{prompt.sales_count} sales</span>
                      <span className="capitalize">{prompt.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublish(prompt)}
                    >
                      {prompt.is_published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingPrompt(prompt)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingPrompt}
        onOpenChange={() => {
          setShowCreateDialog(false);
          setEditingPrompt(null);
          resetForm();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingPrompt ? 'update' : 'create'} your prompt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter prompt title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this prompt does"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Prompt Content</Label>
              <Textarea
                id="content"
                placeholder="Enter the actual prompt content"
                className="min-h-[150px] font-mono"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as PromptCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (credits)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingPrompt(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingPrompt ? handleUpdate : handleCreate}
              disabled={
                !formData.title ||
                !formData.description ||
                !formData.content ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editingPrompt ? 'Update' : 'Create'} Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingPrompt} onOpenChange={() => setDeletingPrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this prompt? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingPrompt && (
            <div className="py-4">
              <p className="font-semibold">{deletingPrompt.title}</p>
              <p className="text-sm text-muted-foreground">
                {deletingPrompt.description}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPrompt(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
