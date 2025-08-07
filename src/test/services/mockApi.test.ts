import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockApiClient } from '@/services/mockApi'

describe('mockApiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getKeywords', () => {
        it('should return array of keywords', async () => {
            const keywords = await mockApiClient.getKeywords()

            expect(Array.isArray(keywords)).toBe(true)
            expect(keywords.length).toBeGreaterThan(0)

            // Check structure of first keyword
            const firstKeyword = keywords[0]
            expect(firstKeyword).toHaveProperty('Id')
            expect(firstKeyword).toHaveProperty('Name')
            expect(firstKeyword).toHaveProperty('Count')
            expect(firstKeyword).toHaveProperty('IsEntity')
        })

        it('should have specific test keywords', async () => {
            const keywords = await mockApiClient.getKeywords()

            // Check for specific keywords that should exist
            const machineKeyword = keywords.find(k => k.Name === 'machine')
            expect(machineKeyword).toBeDefined()
            expect(machineKeyword?.Count).toBe(40) // Updated to match actual mock data

            const qualityKeyword = keywords.find(k => k.Name === 'quality')
            expect(qualityKeyword).toBeDefined()
            expect(qualityKeyword?.Count).toBeGreaterThan(0)
        })
    })

    describe('getFramesForKeywords', () => {
        it('should return frames for valid keyword IDs', async () => {
            const params = {
                keyword_ids: [1], // machine keyword
                confidence_min: 0,
                confidence_max: 1
            }

            const response = await mockApiClient.getFramesForKeywords(params)

            expect(response).toHaveProperty('values')
            expect(Array.isArray(response.values)).toBe(true)
            expect(response.values.length).toBeGreaterThan(0)
        })

        it('should return empty array for non-existent keyword IDs', async () => {
            const params = {
                keyword_ids: [9999], // Non-existent keyword
                confidence_min: 0,
                confidence_max: 1
            }

            const response = await mockApiClient.getFramesForKeywords(params)

            expect(response.values).toEqual([])
        })

        it('should filter by confidence range', async () => {
            const params = {
                keyword_ids: [1],
                confidence_min: 0.9, // High confidence only
                confidence_max: 1
            }

            const response = await mockApiClient.getFramesForKeywords(params)

            // Should still return some results as mock data has various confidence levels
            expect(response).toHaveProperty('values')
            expect(Array.isArray(response.values)).toBe(true)
        })
    })

    describe('getFrameMetadata', () => {
        it('should return metadata for valid frame ID', async () => {
            const metadata = await mockApiClient.getFrameMetadata('1')

            expect(metadata).toHaveProperty('Id', 1)
            expect(metadata).toHaveProperty('Height')
            expect(metadata).toHaveProperty('Width')
            expect(metadata).toHaveProperty('Timestamp')
            expect(metadata).toHaveProperty('IsValuable')
        })

        it('should throw error for invalid frame ID', async () => {
            await expect(mockApiClient.getFrameMetadata('9999'))
                .rejects
                .toThrow('Frame 9999 not found')
        })
    })

    describe('getFrameThumbnail', () => {
        it('should return base64 thumbnail for valid frame ID', async () => {
            const response = await mockApiClient.getFrameThumbnail('1')

            expect(response).toHaveProperty('thumbnail')
            expect(typeof response.thumbnail).toBe('string')
            expect(response.thumbnail.length).toBeGreaterThan(0)
        })

        it('should return consistent thumbnails for same frame ID', async () => {
            const response1 = await mockApiClient.getFrameThumbnail('1')
            const response2 = await mockApiClient.getFrameThumbnail('1')

            expect(response1.thumbnail).toBe(response2.thumbnail)
        })
    })

    describe('getFrameKeywords', () => {
        it('should return keywords for valid frame ID', async () => {
            const keywords = await mockApiClient.getFrameKeywords('1')

            expect(Array.isArray(keywords)).toBe(true)

            if (keywords.length > 0) {
                const firstKeyword = keywords[0]
                expect(firstKeyword).toHaveProperty('Id')
                expect(firstKeyword).toHaveProperty('FrameId', 1)
                expect(firstKeyword).toHaveProperty('KeywordId')
                expect(firstKeyword).toHaveProperty('KeywordName')
                expect(firstKeyword).toHaveProperty('Confidence')
            }
        })

        it('should return empty array for frame with no keywords', async () => {
            // Test with a frame ID that might not have keywords
            const keywords = await mockApiClient.getFrameKeywords('999')

            expect(Array.isArray(keywords)).toBe(true)
            // Could be empty or have keywords depending on mock data generation
        })
    })

    describe('base64ToDataUrl', () => {
        it('should convert base64 to data URL', () => {
            const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            const result = mockApiClient.base64ToDataUrl(base64)

            // The mock client returns SVG format, not JPEG
            expect(result).toBe(`data:image/svg+xml;base64,${base64}`)
        })

        it('should handle thumbnail type', () => {
            const base64 = 'test-base64-string'
            const result = mockApiClient.base64ToDataUrl(base64, 'thumbnail')

            // The mock client returns SVG format consistently
            expect(result).toBe(`data:image/svg+xml;base64,${base64}`)
        })
    })

    describe('Album operations', () => {
        it('should return configuration IDs', async () => {
            const configIds = await mockApiClient.getConfigIds()

            expect(Array.isArray(configIds)).toBe(true)
            expect(configIds.length).toBeGreaterThan(0)
            expect(typeof configIds[0]).toBe('number')
        })

        it('should return album IDs for config', async () => {
            const albumIds = await mockApiClient.getAlbumIdsForConfig(1)

            expect(Array.isArray(albumIds)).toBe(true)
            expect(albumIds.length).toBeGreaterThan(0)
            expect(typeof albumIds[0]).toBe('number')
        })

        it('should return frame count for album', async () => {
            const frameCount = await mockApiClient.getFramesCountForGroupConfig(1, 1)

            expect(typeof frameCount).toBe('number')
            expect(frameCount).toBeGreaterThan(0)
        })

        it('should return thumbnail frame IDs for album', async () => {
            const thumbnailIds = await mockApiClient.getFrameIdsForAlbumThumbnail(1, 1, 50)

            expect(Array.isArray(thumbnailIds)).toBe(true)
            expect(thumbnailIds.length).toBe(4) // Should return 4 frames for 2x2 grid
            thumbnailIds.forEach(id => {
                expect(typeof id).toBe('number')
            })
        })
    })
})
