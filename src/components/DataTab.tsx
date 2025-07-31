import React, { useState } from 'react';
import { SearchAndFilter } from './SearchAndFilter';
import { ImageContent } from './ImageContent';
import { FilterState, BulkSelectionState } from '../types/keyword';
import { useToast } from '@/hooks/use-toast';
import { useKeywords } from '../hooks/useKeywords';

export const DataTab: React.FC = () => {
  const { keywords, loading: keywordsLoading, toggleKeyword, editKeyword } = useKeywords();
  const [occurrence, setOccurrence] = useState<'high' | 'medium' | 'low'>('high');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: null, end: null },
    albumSizeRange: { min: 0, max: 1000 },
    sortBy: 'newest'
  });
  const [bulkSelection, setBulkSelection] = useState<BulkSelectionState>({
    selectedImages: [],
    selectedAlbums: []
  });
  const { toast } = useToast();

  const handleKeywordToggle = (keywordId: string) => {
    toggleKeyword(keywordId);
  };

  const handleKeywordEdit = (keywordId: string, newText: string) => {
    editKeyword(keywordId, newText);
  };

  const handleBulkSelectAll = (keywordId: string, type: 'images' | 'albums') => {
    // Mock implementation - in real app, would fetch actual items for the keyword
    const mockIds = Array.from({length: 10}, (_, i) => `${type}-${keywordId}-${i}`);
    
    setBulkSelection(prev => ({
      ...prev,
      [type === 'images' ? 'selectedImages' : 'selectedAlbums']: [
        ...prev[type === 'images' ? 'selectedImages' : 'selectedAlbums'],
        ...mockIds
      ]
    }));

    toast({
      title: "Selection Updated",
      description: `Selected all ${type} for keyword`
    });
  };

  const handleBulkDeselectAll = (keywordId: string, type: 'images' | 'albums') => {
    setBulkSelection(prev => ({
      ...prev,
      [type === 'images' ? 'selectedImages' : 'selectedAlbums']: prev[type === 'images' ? 'selectedImages' : 'selectedAlbums']
        .filter(id => !id.includes(keywordId))
    }));

    toast({
      title: "Selection Cleared",
      description: `Cleared ${type} selection for keyword`
    });
  };

  const handleCreateAIModel = () => {
    toast({
      title: "AI Model Creation",
      description: "Starting AI model training with selected data...",
    });
  };

  const handleAnnotateImages = () => {
    toast({
      title: "Image Annotation",
      description: "Opening annotation tool for selected images...",
    });
  };

  const selectedKeywords = keywords.filter(k => k.isSelected);

  return (
    <div className="min-h-screen bg-gradient-subtle p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 animate-fade-in">
            Image Data Management
          </h1>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-4 rounded-full shadow-glow"></div>
          <p className="text-muted-foreground text-lg animate-fade-in">
            Search, filter, and organize your image collection by keywords
          </p>
        </div>

        {/* Search and Filter Section */}
        <SearchAndFilter
          keywords={keywords}
          occurrence={occurrence}
          filters={filters}
          bulkSelection={bulkSelection}
          onKeywordToggle={handleKeywordToggle}
          onKeywordEdit={handleKeywordEdit}
          onOccurrenceChange={setOccurrence}
          onFiltersChange={setFilters}
          onBulkSelectionChange={setBulkSelection}
          onBulkSelectAll={handleBulkSelectAll}
          onBulkDeselectAll={handleBulkDeselectAll}
          onCreateAIModel={handleCreateAIModel}
          onAnnotateImages={handleAnnotateImages}
        />

        {/* Image Content Section */}
        <ImageContent 
          selectedKeywords={selectedKeywords}
          occurrence={occurrence}
          keywords={keywords}
          onKeywordUpdate={() => {}} // No longer needed since keywords are managed by useKeywords hook
        />
      </div>
    </div>
  );
};