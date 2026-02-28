import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Save, 
  Trash2, 
  Settings,
  History,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useGeneration } from '@/hooks';
import { useGeneratorStore, AVAILABLE_MODELS } from '@/lib/store';
import { cn } from '@/lib/utils';

export function GeneratorPage() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  
  const {
    history,
    selectedModel,
    temperature,
    maxTokens,
    setSelectedModel,
    setTemperature,
    setMaxTokens,
    addToHistory,
    removeFromHistory,
    clearHistory,
  } = useGeneratorStore();

  const { generate, streamedContent, isStreaming, isPending } = useGeneration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    try {
      await generate({
        prompt: input,
        model: selectedModel,
        temperature,
        maxTokens,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate');
    }
  };

  const handleCopy = async () => {
    if (!streamedContent) return;
    
    try {
      await navigator.clipboard.writeText(streamedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSave = () => {
    if (!streamedContent) return;
    
    addToHistory({
      id: crypto.randomUUID(),
      prompt: input,
      result: streamedContent,
      model: selectedModel,
      createdAt: new Date().toISOString(),
    });
    toast.success('Saved to history');
  };

  const loadFromHistory = (item: typeof history[0]) => {
    setInput(item.prompt);
    // Note: We can't set the output directly as it's read-only from the stream
  };

  // Auto-scroll to bottom of output
  useEffect(() => {
    if (outputRef.current && isStreaming) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamedContent, isStreaming]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              AI Prompt Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate powerful prompts with state-of-the-art AI models
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Generation Settings</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col items-start">
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {model.provider}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Temperature</Label>
                      <span className="text-sm text-muted-foreground">
                        {temperature}
                      </span>
                    </div>
                    <Slider
                      value={[temperature]}
                      onValueChange={([v]) => setTemperature(v)}
                      min={0}
                      max={2}
                      step={0.1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower values produce more focused outputs, higher values more creative.
                    </p>
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Max Tokens</Label>
                      <span className="text-sm text-muted-foreground">
                        {maxTokens}
                      </span>
                    </div>
                    <Slider
                      value={[maxTokens]}
                      onValueChange={([v]) => setMaxTokens(v)}
                      min={100}
                      max={4000}
                      step={100}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* History Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    Generation History
                    {history.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No history yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <Card
                          key={item.id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => loadFromHistory(item)}
                        >
                          <CardContent className="p-3">
                            <p className="text-sm font-medium line-clamp-2">
                              {item.prompt}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {AVAILABLE_MODELS.find(m => m.id === item.model)?.name || item.model}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromHistory(item.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto max-w-6xl p-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Input Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Input
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe what you want to generate..."
                  className="flex-1 resize-none min-h-[200px]"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}
                    </Badge>
                  </div>
                  <Button
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="gap-2"
                  >
                    {isStreaming ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Output
              </CardTitle>
              {streamedContent && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-full" ref={outputRef}>
                {streamedContent ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                      {streamedContent}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your generated prompt will appear here</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
