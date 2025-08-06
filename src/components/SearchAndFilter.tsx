import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import {
  Search,
  ChevronDown,
  Pencil,
  Check,
  X,
  Calendar as CalendarIcon,
  Bot,
  Tag,
  CheckSquare,
  Square,
  Minus,
  Eye,
  EyeOff
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
  onKeywordVisibilityToggle: (keywordId: string) => void;
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
  onKeywordVisibilityToggle,
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
  const [showHiddenKeywords, setShowHiddenKeywords] = useState(false);

  // Helper function to get occurrence range
  const getOccurrenceRange = (occ: OccurrenceType): [number, number] => {
    switch (occ) {
      case 'high': return [20, Infinity];    // Keywords with 20+ frames
      case 'medium': return [5, 19];         // Keywords with 5-19 frames
      case 'low': return [1, 4];             // Keywords with 1-4 frames
      default: return [0, Infinity];         // All keywords
    }
  };

  const [minCount, maxCount] = getOccurrenceRange(occurrence);

  const filteredKeywords = keywords.filter(keyword => {
    // Filter by search term
    const matchesSearch = keyword.text.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by hidden status
    const matchesHiddenFilter = showHiddenKeywords || !keyword.isHidden;

    // Filter by occurrence level (imageCount)
    const matchesOccurrence = keyword.imageCount >= minCount && keyword.imageCount <= maxCount;

    return matchesSearch && matchesHiddenFilter && matchesOccurrence;
  }).sort((a, b) => {
    // Sort by number of frames (imageCount) in descending order - highest at the top
    return b.imageCount - a.imageCount;
  });

  const selectedCount = keywords.filter(k => k.isSelected).length;
  const hiddenCount = keywords.filter(k => k.isHidden).length;

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
    if (!date) {
      onFiltersChange({
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [field]: null
        }
      });
      return;
    }

    // If there's an existing date, preserve the time when changing the date
    const existingDate = filters.dateRange[field];
    if (existingDate) {
      const newDate = new Date(date);
      newDate.setHours(existingDate.getHours(), existingDate.getMinutes(), existingDate.getSeconds());
      date = newDate;
    }

    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date
      }
    });
  };

  const handleTimeChange = (field: 'start' | 'end', newDate: Date) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: newDate
      }
    });
  };

  const handleAlbumSizeChange = (value: string) => {
    const sizes = {
      'small': { min: 1, max: 50 },
      'medium': { min: 51, max: 200 },
      'large': { min: 201, max: 1000 },
      'all': { min: 0, max: 1000 }
    };
    const selectedSize = sizes[value as keyof typeof sizes] || sizes.all;
    onFiltersChange({
      ...filters,
      albumSizeRange: selectedSize
    });
  };

  const getBulkSelectionIcon = (keywordId: string, type: 'images' | 'albums') => {
    const keywordData = keywords.find(k => k.id === keywordId);
    if (!keywordData) return <Square className="h-4 w-4" />;

    const selectedIds = type === 'images' ? bulkSelection.selectedImages : bulkSelection.selectedAlbums;
    const totalCount = keywordData.imageCount;
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

  const getAlbumSizeValue = () => {
    const { min, max } = filters.albumSizeRange;
    if (min === 0 && max === 1000) return 'all';
    if (min === 1 && max === 50) return 'small';
    if (min === 51 && max === 200) return 'medium';
    if (min === 201 && max === 1000) return 'large';
    return 'all';
  };

  return (
    <div className="space-y-3">
      {/* Main Search and Filter Card */}
      <Card className="p-4 shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden animate-scale-in">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
        <div className="relative z-10">
          {/* Single Row: Keywords + Filters + Actions */}
          <div className="flex flex-col xl:flex-row gap-4 mb-4">
            {/* Keywords Section - Narrower */}
            <div className="xl:w-80 flex-shrink-0">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Keywords
              </label>
              <Popover open={isKeywordOpen} onOpenChange={setIsKeywordOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10 px-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">
                        {selectedCount > 0
                          ? `${selectedCount} selected`
                          : 'Select keywords'
                        }
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                  <div className="p-4 border-b">
                    <div className="space-y-3">
                      <Input
                        placeholder="Search keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowHiddenKeywords(!showHiddenKeywords)}
                          className="gap-2"
                          disabled={hiddenCount === 0}
                        >
                          {showHiddenKeywords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {showHiddenKeywords ? 'Hide Hidden Keywords' : 'Show Hidden Keywords'}
                        </Button>
                      </div>
                    </div>
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
                              <span className={cn(
                                "font-medium text-sm flex-1",
                                keyword.isHidden && "opacity-50 line-through"
                              )}>
                                {keyword.text}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onKeywordVisibilityToggle(keyword.id)}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {keyword.isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
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

            {/* Filters Section - Compact */}
            <div className="flex flex-wrap gap-3 items-end flex-1">
              {/* Date Range Filter */}
              <div className="min-w-40">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Date & Time Range
                </label>
                <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 text-sm",
                        !filters.dateRange.start && !filters.dateRange.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.start && filters.dateRange.end
                        ? `${format(filters.dateRange.start, "MMM dd HH:mm:ss")} - ${format(filters.dateRange.end, "MMM dd HH:mm:ss")}`
                        : filters.dateRange.start
                          ? format(filters.dateRange.start, "MMM dd HH:mm:ss")
                          : "Pick dates & times"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex gap-4">
                      <div className="space-y-3">
                        <label className="text-sm font-medium mb-2 block">Start Date & Time</label>
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.start || undefined}
                          onSelect={(date) => handleDateRangeChange('start', date)}
                          className="rounded-md border pointer-events-auto"
                        />
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Time (HH:MM:SS)</label>
                          <TimePicker
                            value={filters.dateRange.start}
                            onChange={(date) => handleTimeChange('start', date)}
                            disabled={!filters.dateRange.start}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium mb-2 block">End Date & Time</label>
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.end || undefined}
                          onSelect={(date) => handleDateRangeChange('end', date)}
                          className="rounded-md border pointer-events-auto"
                        />
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Time (HH:MM:SS)</label>
                          <TimePicker
                            value={filters.dateRange.end}
                            onChange={(date) => handleTimeChange('end', date)}
                            disabled={!filters.dateRange.end}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
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
              <div className="min-w-32">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Album Size
                </label>
                <Select
                  value={getAlbumSizeValue()}
                  onValueChange={handleAlbumSizeChange}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="small">Small (1-50)</SelectItem>
                    <SelectItem value="medium">Medium (51-200)</SelectItem>
                    <SelectItem value="large">Large (201+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="min-w-32">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Sort by
                </label>
                <Select value={filters.sortBy} onValueChange={(value: 'newest' | 'oldest') =>
                  onFiltersChange({ ...filters, sortBy: value })
                }>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Occurrence Filter */}
              <div className="min-w-36">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Occurrence
                </label>
                <Select value={occurrence} onValueChange={onOccurrenceChange}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (20+)</SelectItem>
                    <SelectItem value="medium">Medium (5-19)</SelectItem>
                    <SelectItem value="low">Low (1-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions Section - Compact */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={onCreateAIModel}
                className="bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-glow hover:shadow-hover transition-glow h-10 px-3 text-sm"
                disabled={selectedCount === 0}
              >
                <Bot className="mr-2 h-4 w-4" />
                AI Model
              </Button>
              <Button
                onClick={onAnnotateImages}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 h-10 px-3 text-sm"
                disabled={selectedCount === 0}
              >
                <Tag className="mr-2 h-4 w-4" />
                Annotate
              </Button>
            </div>
          </div>

          {/* Selected Keywords Display - Compact */}
          {selectedCount > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/20">
              <div className="flex flex-wrap gap-1">
                {keywords
                  .filter(k => k.isSelected)
                  .map((keyword) => (
                    <Badge
                      key={keyword.id}
                      variant="default"
                      className="bg-gradient-primary text-white px-2 py-1 text-xs shadow-glow hover:shadow-hover transition-glow animate-scale-in"
                    >
                      {keyword.text}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onKeywordToggle(keyword.id)}
                        className="ml-1 h-3 w-3 p-0 hover:bg-white/20 transition-colors duration-200"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};