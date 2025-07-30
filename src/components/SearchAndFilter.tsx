import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown, Pencil, Check, X } from 'lucide-react';
import { Keyword, OccurrenceType } from '../types/keyword';

interface SearchAndFilterProps {
  keywords: Keyword[];
  occurrence: OccurrenceType;
  onKeywordToggle: (keywordId: string) => void;
  onKeywordEdit: (keywordId: string, newText: string) => void;
  onOccurrenceChange: (occurrence: OccurrenceType) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  keywords,
  occurrence,
  onKeywordToggle,
  onKeywordEdit,
  onOccurrenceChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isKeywordOpen, setIsKeywordOpen] = useState(false);

  const filteredKeywords = keywords.filter(keyword =>
    keyword.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = keywords.filter(k => k.isSelected).length;

  const handleEditStart = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setEditText(keyword.text);
  };

  const handleEditSave = () => {
    if (editingId && editText.trim()) {
      onKeywordEdit(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const getOccurrenceLabel = (count: number): string => {
    if (count > 200) return 'High';
    if (count > 100) return 'Medium';
    return 'Low';
  };

  const getOccurrenceColor = (count: number): string => {
    if (count > 200) return 'bg-green-100 text-green-800';
    if (count > 100) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="p-6 shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden animate-scale-in">
      {/* Card glow effect */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
      <div className="relative z-10">{/* content wrapper */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Keyword Search Section */}
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Keywords
          </label>
          <Popover open={isKeywordOpen} onOpenChange={setIsKeywordOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 px-4"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {selectedCount > 0 
                      ? `${selectedCount} keyword${selectedCount > 1 ? 's' : ''} selected`
                      : 'Search and select keywords'
                    }
                  </span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start">
              <div className="p-4 border-b">
                <Input
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredKeywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={keyword.isSelected}
                        onCheckedChange={() => onKeywordToggle(keyword.id)}
                      />
                      {editingId === keyword.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleEditSave}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleEditCancel}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-sm flex-1">
                            {keyword.text}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStart(keyword)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getOccurrenceColor(keyword.imageCount)}`}
                      >
                        {getOccurrenceLabel(keyword.imageCount)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {keyword.imageCount}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredKeywords.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No keywords found
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Occurrence Filter */}
        <div className="lg:w-64">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Occurrence
          </label>
          <Select value={occurrence} onValueChange={onOccurrenceChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select occurrence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High (200+ images)</SelectItem>
              <SelectItem value="medium">Medium (100-200 images)</SelectItem>
              <SelectItem value="low">Low (≤100 images)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Keywords Display */}
      {selectedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-primary/20">
          <div className="flex flex-wrap gap-2">
            {keywords
              .filter(k => k.isSelected)
              .map((keyword) => (
                <Badge
                  key={keyword.id}
                  variant="default"
                  className="bg-gradient-primary text-white px-3 py-1 shadow-glow hover:shadow-hover transition-glow animate-scale-in"
                >
                  {keyword.text}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onKeywordToggle(keyword.id)}
                    className="ml-2 h-4 w-4 p-0 hover:bg-white/20 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
          </div>
        </div>
      )}
      </div> {/* Close content wrapper */}
    </Card>
  );
};