import { useState, useCallback } from 'react';
import { Album } from '../types/keyword';
import { apiClient } from '../services/apiConfig';

export const useAlbums = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAlbumsForKeywords = useCallback(async (keywordFrameIds: number[]) => {
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

            // Step 3: For each configuration, get all albums and check them one by one
            for (const configId of configIds) {
                try {
                    console.log(`🔍 ALBUM DEBUG: Step 3 - Processing configuration ${configId}...`);
                    const albumIds = await apiClient.getAlbumIdsForConfig(configId);
                    console.log(`📁 ALBUM DEBUG: Config ${configId} has ${albumIds.length} albums:`, albumIds);

                    // Step 4: Check each album one by one (limit to reasonable number for performance)
                    const albumsToCheck = albumIds.slice(0, 10); // Check first 10 albums per config for debugging
                    console.log(`📁 ALBUM DEBUG: Config ${configId} has ${albumIds.length} albums, checking first ${albumsToCheck.length}`);

                    for (let i = 0; i < albumsToCheck.length; i++) {
                        const albumId = albumsToCheck[i];
                        try {
                            console.log(`🔍 ALBUM DEBUG: Step 4 - Checking album ${albumId} (${i + 1}/${albumsToCheck.length}) in config ${configId}...`);

                            // Get all frame IDs in this album
                            const albumFrameIds = await apiClient.getFrameIdsForGroup(configId, albumId);
                            console.log(`📁 ALBUM DEBUG: Album ${albumId} contains ${albumFrameIds.length} frames:`, albumFrameIds.slice(0, 5), '...');

                            // Step 5: Check if at least one frame from the album matches the keyword frames
                            const matchingFrameIds = albumFrameIds.filter(frameId =>
                                keywordFrameIds.includes(frameId)
                            );

                            console.log(`🔍 ALBUM DEBUG: Step 5 - Album ${albumId} matching analysis:`, {
                                albumFrameCount: albumFrameIds.length,
                                keywordFrameCount: keywordFrameIds.length,
                                matchingFrameCount: matchingFrameIds.length,
                                matchingFrameIds: matchingFrameIds.slice(0, 3),
                                hasMatch: matchingFrameIds.length > 0
                            });

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
                                console.log(`🖼️ ALBUM DEBUG: Getting thumbnails for album ${albumId}...`);
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

                                // Create album object
                                const album: Album = {
                                    id: `${configId}-${albumId}`,
                                    configId,
                                    albumId,
                                    name: `Album ${albumId}`,
                                    imageCount: frameCount,
                                    thumbnailUrls: thumbnailImages,
                                    keywords: albumKeywords,
                                    timestamp: Date.now(),
                                    isSelected: false
                                };

                                console.log(`✅ ALBUM DEBUG: Created album object:`, album);
                                matchingAlbums.push(album);
                            } else {
                                console.log(`❌ ALBUM DEBUG: Album ${albumId} in config ${configId} has no matching frames - IGNORING ALBUM`);
                            }

                        } catch (albumError) {
                            console.warn(`⚠️ ALBUM DEBUG: Error processing album ${albumId} in config ${configId}:`, albumError);
                            // Continue with next album
                        }
                    }
                } catch (configError) {
                    console.warn(`⚠️ ALBUM DEBUG: Error processing config ${configId}:`, configError);
                    // Continue with next config
                }
            }

            console.log(`🎯 ALBUM DEBUG: Final result - Found ${matchingAlbums.length} albums with matching frames:`, matchingAlbums);
            setAlbums(matchingAlbums);

        } catch (err) {
            console.error('💥 ALBUM DEBUG: Error fetching albums:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch albums');
        } finally {
            setLoading(false);
        }
    }, []);

    const getAlbumFrames = useCallback(async (album: Album) => {
        try {
            console.log(`📁 ALBUM DEBUG: Getting frames for album ${album.albumId} in config ${album.configId}`);
            const frameIds = await apiClient.getFrameIdsForGroup(album.configId, album.albumId);
            return frameIds;
        } catch (err) {
            console.error('📁 ALBUM DEBUG: Error getting album frames:', err);
            throw err;
        }
    }, []);

    return {
        albums,
        loading,
        error,
        fetchAlbumsForKeywords,
        getAlbumFrames
    };
};
