import { useState, useEffect } from 'react';
import { apiClient, KeywordDto } from '../services/api';
import { Keyword } from '../types/keyword';
import { useToast } from './use-toast';

// Transform API keyword to frontend keyword type
function transformKeyword(apiKeyword: KeywordDto): Keyword {
  return {
    id: apiKeyword.Id.toString(),
    text: apiKeyword.Name,
    imageCount: apiKeyword.Count,
    isSelected: false,
  };
}

export function useKeywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchKeywords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiKeywords = await apiClient.getKeywords();
      const transformedKeywords = apiKeywords.map(transformKeyword);
      setKeywords(transformedKeywords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch keywords';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyword = (keywordId: string) => {
    setKeywords(prev => prev.map(keyword => 
      keyword.id === keywordId 
        ? { ...keyword, isSelected: !keyword.isSelected }
        : keyword
    ));
  };

  const editKeyword = (keywordId: string, newText: string) => {
    setKeywords(prev => prev.map(keyword => 
      keyword.id === keywordId 
        ? { ...keyword, text: newText }
        : keyword
    ));
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  return {
    keywords,
    loading,
    error,
    toggleKeyword,
    editKeyword,
    refetch: fetchKeywords,
  };
}