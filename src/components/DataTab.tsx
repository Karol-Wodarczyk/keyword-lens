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
          onKeywordToggle={handleKeywordToggle}
          onKeywordEdit={handleKeywordEdit}
          onOccurrenceChange={setOccurrence}
        />

        {/* Image Content Section */}
        <ImageContent 
          selectedKeywords={selectedKeywords}
          occurrence={occurrence}
          keywords={keywords}
          onKeywordUpdate={setKeywords}
        />
      </div>
    </div>
  );
};