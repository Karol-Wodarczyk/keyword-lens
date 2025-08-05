import { useState, useCallback } from 'react';
import { Album } from '../types/keyword';
import { apiClient } from '../services/apiConfig';

export const useAlbums = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingBackground, setLoadingBackground] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAlbumsForKeywords = useCallback(async (keywordFrameIds: number[], progressiveLoad: boolean = true) => {
        if (keywordFrameIds.length === 0) {
            setAlbums([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('🔍 ALBUM DEBUG: Step 1 - Got frame IDs for selected keyword(s):', keywordFrameIds.slice(0, 10), '... (total:', keywordFrameIds.length, ')');

            // Step 2: Get all configurations (which contain albums)
            console.log('🔍 ALBUM DEBUG: Step 2 - Getting all album configurations...');
            const configIds = await apiClient.getConfigIds();
            console.log('📁 ALBUM DEBUG: Found configurations:', configIds);

            const matchingAlbums: Album[] = [];

            // Helper function to process a batch of albums
            const processAlbumBatch = async (configId: number, albumIds: number[]): Promise<Album[]> => {
                const batchResults: Album[] = [];

                for (let i = 0; i < albumIds.length; i++) {
                    const albumId = albumIds[i];
                    try {
                        console.log(`🔍 ALBUM DEBUG: Checking album ${albumId} (${i + 1}/${albumIds.length}) in config ${configId}...`);

                        // Get all frame IDs in this album
                        const albumFrameIds = await apiClient.getFrameIdsForGroup(configId, albumId);

                        // Check if at least one frame from the album matches the keyword frames
                        const matchingFrameIds = albumFrameIds.filter(frameId =>
                            keywordFrameIds.includes(frameId)
                        );

                        // If at least one frame matches, keep this album
                        if (matchingFrameIds.length > 0) {
                            console.log(`✅ ALBUM DEBUG: Album ${albumId} in config ${configId} has ${matchingFrameIds.length} matching frames - KEEPING ALBUM`);

                            // Get frame count for this album
                            const frameCount = await apiClient.getFramesCountForGroupConfig(configId, albumId);

                            // Get thumbnail frame IDs (4 for 2x2 grid)
                            const thumbnailFrameIds = await apiClient.getFrameIdsForAlbumThumbnail(
                                configId,
                                albumId,
                                frameCount
                            );

                            // Get base64 thumbnail images
                            const thumbnailImages: string[] = await Promise.all(
                                thumbnailFrameIds.map(async (frameId) => {
                                    const response = await apiClient.getFrameThumbnail(frameId.toString());
                                    return apiClient.base64ToDataUrl(response.thumbnail, 'thumbnail');
                                })
                            );

                            // Get keywords from matching frames in the album
                            const albumKeywords: string[] = [];
                            for (const frameId of matchingFrameIds.slice(0, 5)) { // Sample first 5 matching frames
                                try {
                                    const frameKeywords = await apiClient.getFrameKeywords(frameId.toString());
                                    frameKeywords.forEach(fk => {
                                        if (!albumKeywords.includes(fk.KeywordName)) {
                                            albumKeywords.push(fk.KeywordName);
                                        }
                                    });
                                } catch (error) {
                                    console.warn(`⚠️ ALBUM DEBUG: Error getting keywords for frame ${frameId}:`, error);
                                }
                            }

                            // Create album object with all required properties
                            const album: Album = {
                                id: `${configId}-${albumId}`,
                                configId: configId,
                                albumId: albumId,
                                name: `Album ${albumId}`,
                                keywords: albumKeywords,
                                imageCount: frameCount,
                                thumbnailUrls: thumbnailImages,
                                timestamp: Date.now(),
                            };

                            batchResults.push(album);
                        }
                    } catch (error) {
                        console.error(`❌ ALBUM DEBUG: Error processing album ${albumId} in config ${configId}:`, error);
                    }
                }

                return batchResults;
            };

            // Step 3: For each configuration, get all albums and check them
            for (const configId of configIds) {
                try {
                    const albumIds = await apiClient.getAlbumIdsForConfig(configId);

                    if (progressiveLoad && albumIds.length > 2) {
                        // Load first 2 albums immediately
                        const firstBatchAlbums = albumIds.slice(0, 2);
                        const firstBatchResults = await processAlbumBatch(configId, firstBatchAlbums);
                        matchingAlbums.push(...firstBatchResults);

                        // Update state with first batch
                        setAlbums([...matchingAlbums]);
                        setLoading(false);

                        // Process remaining albums in background
                        const remainingAlbums = albumIds.slice(2);
                        if (remainingAlbums.length > 0) {
                            setLoadingBackground(true);

                            // Process in batches of 2
                            for (let i = 0; i < remainingAlbums.length; i += 2) {
                                const batchAlbums = remainingAlbums.slice(i, i + 2);
                                const batchResults = await processAlbumBatch(configId, batchAlbums);

                                if (batchResults.length > 0) {
                                    matchingAlbums.push(...batchResults);
                                    setAlbums([...matchingAlbums]);
                                }

                                // Small delay between batches
                                await new Promise(resolve => setTimeout(resolve, 200));
                            }

                            setLoadingBackground(false);
                        }
                    } else {
                        // Process all albums at once for small datasets
                        const albumsToCheck = albumIds.slice(0, 10); // Limit for performance
                        const batchResults = await processAlbumBatch(configId, albumsToCheck);
                        matchingAlbums.push(...batchResults);
                    }
                } catch (error) {
                    console.error(`❌ ALBUM DEBUG: Error processing configuration ${configId}:`, error);
                }
            }

            if (!progressiveLoad || matchingAlbums.length <= 2) {
                setAlbums(matchingAlbums);
                setLoading(false);
            }

        } catch (error) {
            console.error('❌ ALBUM DEBUG: Error in fetchAlbumsForKeywords:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch albums');
            setLoading(false);
            setLoadingBackground(false);
        }
    }, []);

    const getAlbumFrames = useCallback(async (albumId: string) => {
        console.log('Getting frames for album:', albumId);
        return [];
    }, []);

    return {
        albums,
        loading,
        loadingBackground,
        error,
        fetchAlbumsForKeywords,
        getAlbumFrames,
    };
};
