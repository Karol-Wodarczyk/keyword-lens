import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    apiClient,
    KeywordDto,
    FrameMetaDataDto,
    FrameKeywordDataDto,
    BoundingBoxDto,
    FrameResponse,
    ThumbnailResponse,
    ListInt64Dto,
    Int64Dto,
    FramesForKeywords,
    FramesForGroupThumbnail,
    FramesFromCluster,
    KeywordRename,
    PostKeyword
} from '@/services/api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('apiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset console methods
        vi.spyOn(console, 'log').mockImplementation(() => { })
        vi.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    // Helper function to create mock successful responses
    const createMockResponse = <T>(data: T, status = 200) => ({
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? 'OK' : 'Error',
        json: vi.fn().mockResolvedValue(data),
        text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    })

    // Helper function to create mock error responses
    const createMockErrorResponse = (status: number, statusText: string, errorText = '') => ({
        ok: false,
        status,
        statusText,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: vi.fn().mockResolvedValue(errorText || `${status} ${statusText}`),
    })

    describe('Keywords API', () => {
        it('should get keywords successfully', async () => {
            const mockKeywords: KeywordDto[] = [
                { Name: 'machine', IsEntity: false, Id: 1, Count: 40 },
                { Name: 'production', IsEntity: true, Id: 2, Count: 25 }
            ]

            mockFetch.mockResolvedValue(createMockResponse(mockKeywords))

            const result = await apiClient.getKeywords()

            expect(mockFetch).toHaveBeenCalledWith('/api/keywords', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual(mockKeywords)
        })

        it('should get frame keywords successfully', async () => {
            const mockFrameKeywords: FrameKeywordDataDto[] = [
                {
                    KeywordName: 'machine',
                    Confidence: 0.95,
                    X1: 100, Y1: 100, X2: 200, Y2: 200,
                    Id: 1, FrameId: 10, KeywordId: 1
                }
            ]

            mockFetch.mockResolvedValue(createMockResponse(mockFrameKeywords))

            const result = await apiClient.getFrameKeywords('10')

            expect(mockFetch).toHaveBeenCalledWith('/api/frame/10/keywords', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual(mockFrameKeywords)
        })

        it('should get frames for keywords successfully', async () => {
            const params: FramesForKeywords = {
                keyword_ids: [1, 2],
                confidence_min: 0.5,
                confidence_max: 1.0
            }
            const mockResponse: ListInt64Dto = { values: [10, 20, 30] }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getFramesForKeywords(params)

            expect(mockFetch).toHaveBeenCalledWith('/api/keywords/frames', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            })
            expect(result).toEqual(mockResponse)
        })
    })

    describe('Frames API', () => {
        it('should get frame IDs successfully', async () => {
            const mockResponse: ListInt64Dto = { values: [1, 2, 3, 4, 5] }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getFrameIds()

            expect(mockFetch).toHaveBeenCalledWith('/api/frame-ids', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual(mockResponse)
        })

        it('should get frame successfully', async () => {
            const mockResponse: FrameResponse = { frame: 'base64encodedimage' }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getFrame('123')

            expect(mockFetch).toHaveBeenCalledWith('/api/frame/123', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual(mockResponse)
        })

        it('should get frame metadata successfully', async () => {
            const mockMetadata: FrameMetaDataDto = {
                Height: 1080,
                Width: 1920,
                Timestamp: '2024-01-01T12:00:00Z',
                Id: 123,
                IsValuable: true,
                Thumbnail: 'base64thumb'
            }

            mockFetch.mockResolvedValue(createMockResponse(mockMetadata))

            const result = await apiClient.getFrameMetadata('123')

            expect(mockFetch).toHaveBeenCalledWith('/api/frame/123/metadata', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual(mockMetadata)
        })

        it('should get frame thumbnail successfully', async () => {
            const mockResponse: ThumbnailResponse = { thumbnail: 'base64thumbnail' }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getFrameThumbnail('123')

            expect(mockFetch).toHaveBeenCalledWith('/api/frame/123/thumbnail', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual(mockResponse)
        })

        it('should get bounding boxes successfully', async () => {
            const mockBoundingBoxes: BoundingBoxDto[] = [
                { X1: 100, Y1: 100, X2: 200, Y2: 200 },
                { X1: 300, Y1: 300, X2: 400, Y2: 400 }
            ]

            mockFetch.mockResolvedValue(createMockResponse(mockBoundingBoxes))

            const result = await apiClient.getBoundingBoxes('123', '456')

            expect(mockFetch).toHaveBeenCalledWith('/api/frame/123/keyword/456/bounding-boxes', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual(mockBoundingBoxes)
        })
    })

    describe('Clusters/Albums API', () => {
        it('should get frames from cluster successfully', async () => {
            const params: FramesFromCluster = {
                cluster_id: 10,
                config_id: 1,
                images_number: 50,
                order: 'DESC',
                redundant: false
            }
            const mockResponse: ListInt64Dto = { values: [100, 101, 102] }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getFramesFromCluster(params)

            expect(mockFetch).toHaveBeenCalledWith('/api/clusters/frame-ids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            })
            expect(result).toEqual(mockResponse)
        })

        it('should get config IDs successfully', async () => {
            const mockResponse: ListInt64Dto = { values: [1, 2, 3] }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getConfigIds()

            expect(mockFetch).toHaveBeenCalledWith('/api/clusters/config-ids', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual([1, 2, 3])
        })

        it('should get album IDs for config successfully', async () => {
            const mockResponse: ListInt64Dto = { values: [10, 20, 30] }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getAlbumIdsForConfig(1)

            expect(mockFetch).toHaveBeenCalledWith('/api/configs/1/cluster-ids', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual([10, 20, 30])
        })

        it('should get frames count for group config successfully', async () => {
            const mockResponse: Int64Dto = { Value: 150 }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getFramesCountForGroupConfig(1, 10)

            expect(mockFetch).toHaveBeenCalledWith('/api/configs/1/clusters/10/frames-count', {
                headers: { 'Content-Type': 'application/json' }
            })
            expect(result).toEqual(150)
        })

        it('should get frame IDs for album thumbnail successfully', async () => {
            const mockResponse: ListInt64Dto = { values: [100, 105, 110] }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getFrameIdsForAlbumThumbnail(1, 10, 50)

            const expectedParams: FramesForGroupThumbnail = {
                cluster_id: 10,
                config_id: 1,
                frames_count: 50
            }

            expect(mockFetch).toHaveBeenCalledWith('/api/clusters/frame-ids-thumbnail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expectedParams)
            })
            expect(result).toEqual([100, 105, 110])
        })

        it('should get frame IDs for group successfully', async () => {
            const mockResponse: ListInt64Dto = { values: [200, 201, 202] }

            mockFetch.mockResolvedValue(createMockResponse(mockResponse))

            const result = await apiClient.getFrameIdsForGroup(1, 10)

            const expectedParams: FramesFromCluster = {
                cluster_id: 10,
                config_id: 1,
                images_number: 1000,
                order: 'DESC',
                redundant: false
            }

            expect(mockFetch).toHaveBeenCalledWith('/api/clusters/frame-ids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expectedParams)
            })
            expect(result).toEqual([200, 201, 202])
        })
    })

    describe('Keyword Operations API', () => {
        it('should rename keyword for frame successfully', async () => {
            mockFetch.mockResolvedValue(createMockResponse(undefined, 204))

            await apiClient.renameKeywordForFrame('123', 456, 'new-keyword')

            const expectedParams: KeywordRename = {
                SourceId: 456,
                Target: 'new-keyword'
            }

            expect(mockFetch).toHaveBeenCalledWith('/api/frame/123/keyword/replace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expectedParams)
            })
        })

        it('should delete keyword from frame successfully', async () => {
            mockFetch.mockResolvedValue(createMockResponse(undefined, 204))

            await apiClient.deleteKeywordFromFrame('123', 456)

            const expectedAction: PostKeyword = {
                action: 'delete',
                name: '',
                confidence: 0,
                is_entity: false,
                origin: 0,
                id: 456
            }

            expect(mockFetch).toHaveBeenCalledWith('/api/frame/123/keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([expectedAction])
            })
        })
    })

    describe('Utility Methods', () => {
        it('should convert base64 to data URL for image', () => {
            const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

            const result = apiClient.base64ToDataUrl(base64)

            expect(result).toBe(`data:image/jpeg;base64,${base64}`)
        })

        it('should convert base64 to data URL for thumbnail', () => {
            const base64 = 'thumbnailbase64data'

            const result = apiClient.base64ToDataUrl(base64, 'thumbnail')

            expect(result).toBe(`data:image/jpeg;base64,${base64}`)
        })
    })

    describe('Error Handling', () => {
        it('should handle HTTP 404 error', async () => {
            mockFetch.mockResolvedValue(createMockErrorResponse(404, 'Not Found', 'Resource not found'))

            await expect(apiClient.getKeywords()).rejects.toThrow(
                'API request failed: Not Found - Resource not found'
            )

            expect(console.error).toHaveBeenCalledWith('❌ API Error: 404 - Resource not found')
        })

        it('should handle HTTP 500 error', async () => {
            mockFetch.mockResolvedValue(createMockErrorResponse(500, 'Internal Server Error', 'Server error'))

            await expect(apiClient.getFrameMetadata('123')).rejects.toThrow(
                'API request failed: Internal Server Error - Server error'
            )
        })

        it('should handle network/CORS error', async () => {
            mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

            await expect(apiClient.getKeywords()).rejects.toThrow(
                '🚫 CORS or Network error: Cannot connect to /api/keywords. Is the backend server running?'
            )

            expect(console.error).toHaveBeenCalledWith('💥 Network Error:', expect.any(TypeError))
        })

        it('should handle generic network error', async () => {
            const genericError = new Error('Network timeout')
            mockFetch.mockRejectedValue(genericError)

            await expect(apiClient.getKeywords()).rejects.toThrow(
                'Network error: Network timeout'
            )
        })

        it('should handle non-Error network issues', async () => {
            mockFetch.mockRejectedValue('Unknown error type')

            await expect(apiClient.getKeywords()).rejects.toThrow(
                'Network error: Unknown error'
            )
        })

        it('should handle JSON parsing errors in error responses', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
                text: vi.fn().mockResolvedValue('Invalid request format')
            }

            mockFetch.mockResolvedValue(mockResponse)

            await expect(apiClient.getKeywords()).rejects.toThrow(
                'API request failed: Bad Request - Invalid request format'
            )
        })
    })

    describe('Request Logging', () => {
        it('should log GET requests', async () => {
            mockFetch.mockResolvedValue(createMockResponse([]))

            await apiClient.getKeywords()

            expect(console.log).toHaveBeenCalledWith('🔗 API Request: GET /api/keywords')
            expect(console.log).toHaveBeenCalledWith('📡 API Response: 200 OK')
            expect(console.log).toHaveBeenCalledWith('✅ API Success:', [])
        })

        it('should log POST requests', async () => {
            mockFetch.mockResolvedValue(createMockResponse({ values: [] }))

            const params: FramesForKeywords = {
                keyword_ids: [1],
                confidence_min: 0,
                confidence_max: 1
            }

            await apiClient.getFramesForKeywords(params)

            expect(console.log).toHaveBeenCalledWith('🔗 API Request: POST /api/keywords/frames')
            expect(console.log).toHaveBeenCalledWith('📡 API Response: 200 OK')
        })
    })

    describe('Custom Headers', () => {
        it('should include Content-Type header by default', async () => {
            mockFetch.mockResolvedValue(createMockResponse([]))

            await apiClient.getKeywords()

            expect(mockFetch).toHaveBeenCalledWith('/api/keywords', {
                headers: { 'Content-Type': 'application/json' }
            })
        })

        it('should include Content-Type header in POST requests', async () => {
            mockFetch.mockResolvedValue(createMockResponse({ values: [] }))

            const params: FramesForKeywords = {
                keyword_ids: [1],
                confidence_min: 0,
                confidence_max: 1
            }

            await apiClient.getFramesForKeywords(params)

            expect(mockFetch).toHaveBeenCalledWith('/api/keywords/frames', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            })
        })
    })

    describe('Environment Configuration', () => {
        it('should use default API base URL', async () => {
            mockFetch.mockResolvedValue(createMockResponse([]))

            await apiClient.getKeywords()

            expect(mockFetch).toHaveBeenCalledWith('/api/keywords', expect.any(Object))
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty response data', async () => {
            mockFetch.mockResolvedValue(createMockResponse(null))

            const result = await apiClient.getKeywords()

            expect(result).toBeNull()
        })

        it('should handle malformed JSON response', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: 'OK',
                json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
                text: vi.fn().mockResolvedValue('invalid json')
            }

            mockFetch.mockResolvedValue(mockResponse)

            await expect(apiClient.getKeywords()).rejects.toThrow('Network error: Unexpected token')
        })

        it('should handle special characters in frame IDs', async () => {
            mockFetch.mockResolvedValue(createMockResponse({ frame: 'base64data' }))

            await apiClient.getFrame('frame-123-special_chars')

            expect(mockFetch).toHaveBeenCalledWith('/api/frame/frame-123-special_chars', {
                headers: { 'Content-Type': 'application/json' }
            })
        })

        it('should handle large numeric IDs', async () => {
            const largeId = '9999999999999999'
            mockFetch.mockResolvedValue(createMockResponse({ thumbnail: 'thumb' }))

            await apiClient.getFrameThumbnail(largeId)

            expect(mockFetch).toHaveBeenCalledWith(`/api/frame/${largeId}/thumbnail`, {
                headers: { 'Content-Type': 'application/json' }
            })
        })
    })
})
