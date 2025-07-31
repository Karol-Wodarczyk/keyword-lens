import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiConfig';
import { FrameMetaDataDto, FramesForKeywords } from '../services/api';
import { ImageItem } from '../types/keyword';
import { useToast } from './use-toast';

// Transform API frame metadata to frontend image item type
function transformFrame(frameMetadata: FrameMetaDataDto, thumbnailBase64?: string): ImageItem {
  const thumbnailUrl = thumbnailBase64 
    ? apiClient.base64ToDataUrl(thumbnailBase64, 'thumbnail')
    : '';

  console.log(`🔄 Transform frame ${frameMetadata.Id}:`, {
    thumbnailBase64Length: thumbnailBase64?.length || 0,
    thumbnailUrl: thumbnailUrl.substring(0, 50) + '...',
    hasUrl: !!thumbnailUrl
  });

  return {
    id: frameMetadata.Id.toString(),
    url: '', // Will be loaded separately when needed
    thumbnailUrl,
    keywords: [], // Will be populated separately
    title: `Frame ${frameMetadata.Id}`,
    timestamp: new Date(frameMetadata.Timestamp).getTime(),
    isSelected: false,
  };
}export function useFrames() {
  const [frames, setFrames] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFramesForKeywords = useCallback(async (
    keywordIds: string[],
    confidenceMin: number = 0,
    confidenceMax: number = 1
  ) => {
    if (keywordIds.length === 0) {
      setFrames([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert string IDs to numbers
      const numericKeywordIds = keywordIds.map(id => parseInt(id, 10));

      // Note: confidence parameters are ignored as confidence is not currently used
      const params: FramesForKeywords = {
        keyword_ids: numericKeywordIds,
        confidence_min: 0,    // Fixed to 0 since confidence not used
        confidence_max: 1,    // Fixed to 1 since confidence not used
      };

      const frameIdsResponse = await apiClient.getFramesForKeywords(params);

      // Fetch metadata and thumbnails for each frame
      const framePromises = frameIdsResponse.values.map(async (frameId) => {
        const [metadata, thumbnail] = await Promise.all([
          apiClient.getFrameMetadata(frameId.toString()),
          apiClient.getFrameThumbnail(frameId.toString()).catch(() => ({ thumbnail: '' })),
        ]);

        return transformFrame(metadata, thumbnail.thumbnail);
      });

      const transformedFrames = await Promise.all(framePromises);
      setFrames(transformedFrames);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch frames';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); const getFrameImage = async (frameId: string): Promise<string> => {
    try {
      const response = await apiClient.getFrame(frameId);
      return apiClient.base64ToDataUrl(response.frame);
    } catch (err) {
      throw new Error(`Failed to load frame image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const updateFrameKeywords = async (frameId: string) => {
    try {
      const frameKeywords = await apiClient.getFrameKeywords(frameId);
      const keywordNames = frameKeywords.map(fk => fk.KeywordName);

      setFrames(prev => prev.map(frame =>
        frame.id === frameId
          ? { ...frame, keywords: keywordNames }
          : frame
      ));
    } catch (err) {
      console.error('Failed to update frame keywords:', err);
    }
  };

  return {
    frames,
    loading,
    error,
    fetchFramesForKeywords,
    getFrameImage,
    updateFrameKeywords,
  };
}