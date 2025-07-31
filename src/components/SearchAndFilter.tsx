import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  ChevronDown, 
  Pencil, 
  Check, 
  X, 
  Calendar as CalendarIcon,
  Filter,
  SortDesc,
  Bot,
  Tag,
  CheckSquare,
  Square,
  Minus
} from 'lucide-react';
import { Keyword, OccurrenceType, FilterState, BulkSelectionState } from '../types/keyword';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SearchAndFilterProps {
  keywords: Keyword[];
  occurrence: OccurrenceType;
  filters: FilterState;
  bulkSelection: BulkSelectionState;
  onKeywordToggle: (keywordId: string) => void;
  onKeywordEdit: (keywordId: string, newText: string) => void;
  onOccurrenceChange: (occurrence: OccurrenceType) => void;
  onFiltersChange: (filters: FilterState) => void;
  onBulkSelectionChange: (selection: BulkSelectionState) => void;
  onBulkSelectAll: (keywordId: string, type: 'images' | 'albums') => void;
  onBulkDeselectAll: (keywordId: string, type: 'images' | 'albums') => void;
  onCreateAIModel: () => void;
  onAnnotateImages: () => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  keywords,
  occurrence,
  filters,
  bulkSelection,
  onKeywordToggle,
  onKeywordEdit,
  onOccurrenceChange,
  onFiltersChange,
  onBulkSelectionChange,
  onBulkSelectAll,
  onBulkDeselectAll,
  onCreateAIModel,
  onAnnotateImages,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isKeywordOpen, setIsKeywordOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

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

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date || null
      }
    });
  };

  const handleAlbumSizeChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    onFiltersChange({
      ...filters,
      albumSizeRange: {
        ...filters.albumSizeRange,
        [field]: numValue
      }
    });
  };

  const getBulkSelectionIcon = (keywordId: string, type: 'images' | 'albums') => {
    const keywordData = keywords.find(k => k.id === keywordId);
    if (!keywordData) return <Square className="h-4 w-4" />;

    const selectedIds = type === 'images' ? bulkSelection.selectedImages : bulkSelection.selectedAlbums;
    const totalCount = keywordData.imageCount; // This would need to be split for actual images vs albums
    const selectedCount = selectedIds.length;

    if (selectedCount === 0) return <Square className="h-4 w-4" />;
    if (selectedCount === totalCount) return <CheckSquare className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
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
    <div className="space-y-6">
      {/* Main Search and Filter Card */}
      <Card className="p-6 shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden animate-scale-in">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
        <div className="relative z-10">
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Keywords Section */}
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
                      <div key={keyword.id} className="group">
                        <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
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
                              <span className="font-medium text-sm flex-1">
                                {keyword.text}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStart(keyword)}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
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
                        
                        {/* Bulk Selection Controls */}
                        {keyword.isSelected && (
                          <div className="px-3 pb-3 border-l-2 border-primary/20 ml-3">
                            <div className="flex gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onBulkSelectAll(keyword.id, 'images')}
                                  className="h-6 px-2 text-xs"
                                >
                                  {getBulkSelectionIcon(keyword.id, 'images')}
                                  Images
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onBulkDeselectAll(keyword.id, 'images')}
                                  className="h-6 px-2 text-xs"
                                >
                                  Clear
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onBulkSelectAll(keyword.id, 'albums')}
                                  className="h-6 px-2 text-xs"
                                >
                                  {getBulkSelectionIcon(keyword.id, 'albums')}
                                  Albums
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onBulkDeselectAll(keyword.id, 'albums')}
                                  className="h-6 px-2 text-xs"
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
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

            {/* Filters Section */}
            <div className="flex flex-col lg:flex-row gap-4 lg:w-auto">
              {/* Date Range Filter */}
              <div className="lg:w-48">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Date Range
                </label>
                <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12",
                        !filters.dateRange.start && !filters.dateRange.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.start && filters.dateRange.end
                        ? `${format(filters.dateRange.start, "MMM dd")} - ${format(filters.dateRange.end, "MMM dd")}`
                        : filters.dateRange.start
                        ? format(filters.dateRange.start, "MMM dd, yyyy")
                        : "Pick dates"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Start Date</label>
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.start || undefined}
                          onSelect={(date) => handleDateRangeChange('start', date)}
                          className="rounded-md border"
                        />
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium mb-2 block">End Date</label>
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.end || undefined}
                          onSelect={(date) => handleDateRangeChange('end', date)}
                          className="rounded-md border"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => onFiltersChange({
                          ...filters,
                          dateRange: { start: null, end: null }
                        })}
                        className="w-full"
                      >
                        Clear Dates
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Album Size Filter */}
              <div className="lg:w-48">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Album Size
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.albumSizeRange.min || ''}
                    onChange={(e) => handleAlbumSizeChange('min', e.target.value)}
                    className="h-12"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.albumSizeRange.max || ''}
                    onChange={(e) => handleAlbumSizeChange('max', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Sort Filter */}
              <div className="lg:w-48">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Sort by Date
                </label>
                <Select value={filters.sortBy} onValueChange={(value: 'newest' | 'oldest') => 
                  onFiltersChange({ ...filters, sortBy: value })
                }>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Occurrence Filter */}
              <div className="lg:w-48">
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
        </div>
      </Card>

      {/* Actions Section */}
      <Card className="p-6 shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Actions</h3>
              <p className="text-sm text-muted-foreground">
                Perform operations on selected data
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={onCreateAIModel}
                className="bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-glow hover:shadow-hover transition-glow"
                disabled={selectedCount === 0}
              >
                <Bot className="mr-2 h-4 w-4" />
                Create AI Model
              </Button>
              <Button 
                onClick={onAnnotateImages}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
                disabled={selectedCount === 0}
              >
                <Tag className="mr-2 h-4 w-4" />
                Annotate Images
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};