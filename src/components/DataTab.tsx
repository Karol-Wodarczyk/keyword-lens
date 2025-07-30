import React, { useState } from 'react';
import { SearchAndFilter } from './SearchAndFilter';
import { ImageContent } from './ImageContent';
import { Keyword } from '../types/keyword';

const mockKeywords: Keyword[] = [
  { id: '1', text: 'landscape', imageCount: 245, isSelected: false },
  { id: '2', text: 'portrait', imageCount: 189, isSelected: false },
  { id: '3', text: 'nature', imageCount: 156, isSelected: false },
  { id: '4', text: 'urban', imageCount: 89, isSelected: false },
  { id: '5', text: 'wildlife', imageCount: 67, isSelected: false },
  { id: '6', text: 'architecture', imageCount: 134, isSelected: false },
  { id: '7', text: 'macro', imageCount: 45, isSelected: false },
  { id: '8', text: 'street', imageCount: 78, isSelected: false },
];

export const DataTab: React.FC = () => {
  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywords);
  const [occurrence, setOccurrence] = useState<'high' | 'medium' | 'low'>('high');

  const handleKeywordToggle = (keywordId: string) => {
    setKeywords(prev => prev.map(keyword => 
      keyword.id === keywordId 
        ? { ...keyword, isSelected: !keyword.isSelected }
        : keyword
    ));
  };

  const handleKeywordEdit = (keywordId: string, newText: string) => {
    setKeywords(prev => prev.map(keyword => 
      keyword.id === keywordId 
        ? { ...keyword, text: newText }
        : keyword
    ));
  };

  const selectedKeywords = keywords.filter(k => k.isSelected);

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Image Data Management
          </h1>
          <p className="text-muted-foreground">
            Search, filter, and organize your image collection by keywords
          </p>
        </div>

        {/* Search and Filter Section */}
        <SearchAndFilter
          keywords={keywords}
          occurrence={occurrence}
          onKeywordToggle={handleKeywordToggle}
          onKeywordEdit={handleKeywordEdit}
          onOccurrenceChange={setOccurrence}
        />

        {/* Image Content Section */}
        <ImageContent 
          selectedKeywords={selectedKeywords}
          occurrence={occurrence}
        />
      </div>
    </div>
  );
};