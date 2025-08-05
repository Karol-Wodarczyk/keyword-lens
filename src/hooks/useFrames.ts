import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiConfig';
import { FrameMetaDataDto, FramesForKeywords, FramesFromCluster } from '../services/api';
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
}

export function useFrames() {
  const [frames, setFrames] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFramesForKeywords = useCallback(async (
    keywordIds: string[],
    confidenceMin: number = 0,
    confidenceMax: number = 1,
    progressiveLoad: boolean = true
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

      console.log('🔍 FRAME DEBUG: fetchFramesForKeywords called with:', {
        keywordIds,
        numericKeywordIds,
        confidenceMin,
        confidenceMax,
        progressiveLoad,
        apiType: 'API Type Check: ' + (apiClient.getFramesForKeywords ? 'Real API' : 'Mock API')
      });

      // Note: confidence parameters are ignored as confidence is not currently used
      const params: FramesForKeywords = {
        keyword_ids: numericKeywordIds,
        confidence_min: 0,    // Fixed to 0 since confidence not used
        confidence_max: 1,    // Fixed to 1 since confidence not used
      };

      const frameIdsResponse = await apiClient.getFramesForKeywords(params);

      console.log('🔍 FRAME DEBUG: API response:', {
        frameIdsCount: frameIdsResponse.values.length,
        frameIds: frameIdsResponse.values.slice(0, 10),
        totalFramesReturned: frameIdsResponse.values.length,
        willUseProgressiveLoading: progressiveLoad && frameIdsResponse.values.length > 9,
        expectedFor284Conveyor: 'Should be 284 if using real API, much less if using mock API'
      });

      // Use progressive loading for large datasets to improve UX
      if (progressiveLoad && frameIdsResponse.values.length > 9) {
        // Load first page (9 frames) immediately
        const firstPageFrameIds = frameIdsResponse.values.slice(0, 9);
        console.log(`🔍 FRAME DEBUG: Loading first 9 frames immediately`);

        const firstPagePromises = firstPageFrameIds.map(async (frameId) => {
          const [metadata, thumbnail, frameKeywords] = await Promise.all([
            apiClient.getFrameMetadata(frameId.toString()),
            apiClient.getFrameThumbnail(frameId.toString()).catch(() => ({ thumbnail: '' })),
            apiClient.getFrameKeywords(frameId.toString()).catch(() => []),
          ]);

          const frame = transformFrame(metadata, thumbnail.thumbnail);
          frame.keywords = frameKeywords.map(fk => fk.KeywordName);
          return frame;
        });

        const firstPageFrames = await Promise.all(firstPagePromises);
        setFrames(firstPageFrames);
        setLoading(false);
        console.log(`🔍 FRAME DEBUG: First 9 frames loaded, loading indicator hidden`);

        // Load remaining frames in background
        const remainingFrameIds = frameIdsResponse.values.slice(9);
        if (remainingFrameIds.length > 0) {
          console.log(`🔍 FRAME DEBUG: Starting background loading of ${remainingFrameIds.length} remaining frames`);
          console.log(`🔍 FRAME DEBUG: Remaining frame IDs:`, remainingFrameIds);

          // Start background loading after a small delay
          setTimeout(() => {
            loadFramesInBackground(remainingFrameIds, setFrames, apiClient);
          }, 100);
        } else {
          console.log(`🔍 FRAME DEBUG: No remaining frames to load in background`);
        }
      } else {
        // Load all frames at once (fallback or small dataset)
        console.log(`🔍 FRAME DEBUG: Loading all ${frameIdsResponse.values.length} frames at once (no progressive loading)`);
        const framePromises = frameIdsResponse.values.map(async (frameId) => {
          const [metadata, thumbnail, frameKeywords] = await Promise.all([
            apiClient.getFrameMetadata(frameId.toString()),
            apiClient.getFrameThumbnail(frameId.toString()).catch(() => ({ thumbnail: '' })),
            apiClient.getFrameKeywords(frameId.toString()).catch(() => []),
          ]);

          const frame = transformFrame(metadata, thumbnail.thumbnail);
          frame.keywords = frameKeywords.map(fk => fk.KeywordName);
          return frame;
        });

        const transformedFrames = await Promise.all(framePromises);
        console.log(`🔍 FRAME DEBUG: Loaded ${transformedFrames.length} frames directly (no progressive loading)`);
        setFrames(transformedFrames);
        setLoading(false);
      }

      console.log('🔍 useFrames: Frame loading process completed');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch frames';
      setError(errorMessage);
      setLoading(false);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const getFrameImage = async (frameId: string): Promise<string> => {
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

  // Fetch frames from a specific cluster/album
  const fetchFramesFromCluster = useCallback(async (clusterId: number) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 useFrames: fetchFramesFromCluster called with clusterId: ${clusterId}`);

      const params: FramesFromCluster = {
        cluster_id: clusterId,
        config_id: 1, // Default config ID
        images_number: 1000, // Get a large number to get all frames
        order: 'DESC',
        redundant: false,
      };

      const frameIdsResponse = await apiClient.getFramesFromCluster(params);

      console.log('🔍 useFrames: Cluster API response:', {
        frameIdsCount: frameIdsResponse.values.length,
        frameIds: frameIdsResponse.values.slice(0, 10)
      });

      // Fetch metadata, thumbnails, and keywords for each frame
      const framePromises = frameIdsResponse.values.map(async (frameId) => {
        const [metadata, thumbnail, frameKeywords] = await Promise.all([
          apiClient.getFrameMetadata(frameId.toString()),
          apiClient.getFrameThumbnail(frameId.toString()).catch(() => ({ thumbnail: '' })),
          apiClient.getFrameKeywords(frameId.toString()).catch(() => []),
        ]);

        const frame = transformFrame(metadata, thumbnail.thumbnail);
        // Populate keywords for this frame
        frame.keywords = frameKeywords.map(fk => fk.KeywordName);
        return frame;
      });

      const transformedFrames = await Promise.all(framePromises);

      console.log('🔍 useFrames: Transformed cluster frames:', {
        transformedFramesCount: transformedFrames.length,
        sampleFrame: transformedFrames[0]
      });

      setFrames(transformedFrames);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch frames from cluster';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    frames,
    loading,
    error,
    fetchFramesForKeywords,
    fetchFramesFromCluster,
    getFrameImage,
    updateFrameKeywords,
  };
}

// Separate function for background loading to avoid complex nesting
async function loadFramesInBackground(
  frameIds: number[],
  setFrames: React.Dispatch<React.SetStateAction<ImageItem[]>>,
  apiClient: typeof import('../services/apiConfig').apiClient
) {
  console.log(`🔍 BACKGROUND LOADING: Starting with ${frameIds.length} frames:`, frameIds);

  try {
    const batchSize = 18;
    const accumulatedFrames: ImageItem[] = [];
    let processedCount = 0;

    for (let i = 0; i < frameIds.length; i += batchSize) {
      const batchFrameIds = frameIds.slice(i, i + batchSize);
      console.log(`🔍 BACKGROUND LOADING: Processing batch ${Math.floor(i / batchSize) + 1}, frames ${i + 1}-${Math.min(i + batchSize, frameIds.length)} of ${frameIds.length}`);
      console.log(`🔍 BACKGROUND LOADING: Batch frame IDs:`, batchFrameIds);

      try {
        const batchPromises = batchFrameIds.map(async (frameId) => {
          try {
            console.log(`🔍 BACKGROUND LOADING: Processing individual frame ${frameId}`);
            const [metadata, thumbnail, frameKeywords] = await Promise.all([
              apiClient.getFrameMetadata(frameId.toString()),
              apiClient.getFrameThumbnail(frameId.toString()).catch(() => ({ thumbnail: '' })),
              apiClient.getFrameKeywords(frameId.toString()).catch(() => []),
            ]);

            const frame = transformFrame(metadata, thumbnail.thumbnail);
            frame.keywords = frameKeywords.map(fk => fk.KeywordName);
            console.log(`🔍 BACKGROUND LOADING: Successfully processed frame ${frameId}`);
            return frame;
          } catch (frameError) {
            console.error(`🔍 BACKGROUND LOADING: Error processing frame ${frameId}:`, frameError);
            return null; // Skip failed frames
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const batchFrames = batchResults.filter(frame => frame !== null) as ImageItem[];

        console.log(`🔍 BACKGROUND LOADING: Batch completed, ${batchFrames.length} frames successfully processed`);

        if (batchFrames.length > 0) {
          accumulatedFrames.push(...batchFrames);
          processedCount += batchFrames.length;

          // For small datasets (< 36 frames), update UI immediately after each batch
          // For large datasets, update UI every 2 batches or at the end to reduce flashing
          const shouldUpdateUI = accumulatedFrames.length >= 36 ||
            i + batchSize >= frameIds.length ||
            frameIds.length <= 36; // Update immediately for small datasets

          if (shouldUpdateUI) {
            console.log(`🔍 BACKGROUND LOADING: Updating UI with ${accumulatedFrames.length} new frames (total processed: ${processedCount})`);
            console.log(`🔍 BACKGROUND LOADING: Frame IDs being added:`, accumulatedFrames.map(f => f.id));
            console.log(`🔍 BACKGROUND LOADING: AccumulatedFrames sample:`, accumulatedFrames.slice(0, 3));

            // Capture accumulated frames before clearing the array to avoid React timing issues
            const framesToProcess = [...accumulatedFrames];
            accumulatedFrames.length = 0; // Clear accumulated frames immediately

            setFrames(prev => {
              console.log(`🔍 BACKGROUND LOADING: SetFrames callback - prev.length: ${prev.length}, adding: ${framesToProcess.length}`);
              console.log(`🔍 BACKGROUND LOADING: Checking if we're at 81 limit: ${prev.length === 81}`);

              // Check for duplicate IDs before adding
              const existingIds = new Set(prev.map(f => f.id));
              const framesToAdd = framesToProcess.filter(f => !existingIds.has(f.id));
              console.log(`🔍 BACKGROUND LOADING: After duplicate filtering: ${framesToAdd.length} frames to add (was ${framesToProcess.length})`);

              if (framesToAdd.length === 0) {
                console.log(`🔍 BACKGROUND LOADING: No new frames to add - all were duplicates`);
                return prev;
              }

              const newFrames = [...prev, ...framesToAdd];
              console.log(`🔍 BACKGROUND LOADING: UI updated, total frames now: ${newFrames.length} (was ${prev.length}, added ${framesToAdd.length})`);
              console.log(`🔍 BACKGROUND LOADING: Previous frame IDs:`, prev.map(f => f.id));
              console.log(`🔍 BACKGROUND LOADING: New frame IDs:`, newFrames.map(f => f.id));
              return newFrames;
            });
          }
        }

        // Shorter delay for small datasets to speed up loading
        const delay = frameIds.length <= 36 ? 200 : 400;
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (batchError) {
        console.error(`🔍 BACKGROUND LOADING: Error processing batch ${Math.floor(i / batchSize) + 1}:`, batchError);
        // Continue with next batch even if this one fails
      }
    }

    console.log(`🔍 BACKGROUND LOADING: Completed successfully. Total processed: ${processedCount} frames`);
  } catch (error) {
    console.error('🔍 BACKGROUND LOADING: Failed:', error);
  }
}
