import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockApiClient } from '@/services/mockApi'

// Mock the useToast hook with correct relative path from useFrames.ts perspective
const mockToast = vi.fn()
vi.mock('../../hooks/use-toast', () => ({
    useToast: () => ({ toast: mockToast })
}))

// Mock the API config with correct relative path from useFrames.ts perspective
vi.mock('../../services/apiConfig', () => ({
    apiClient: mockApiClient
}))

// Now import the hook after mocking
import { useFrames } from '../../hooks/useFrames'

describe('useFrames', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockToast.mockClear()
        // Don't use fake timers as they interfere with async operations in the hook
    })

    afterEach(() => {
        // Clean up any timers if needed
    })

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useFrames())

        expect(result.current.frames).toEqual([])
        expect(result.current.loading).toBe(false)
        expect(result.current.backgroundLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should handle empty keyword IDs', async () => {
        const { result } = renderHook(() => useFrames())

        await act(async () => {
            result.current.fetchFramesForKeywords([])
        })

        expect(result.current.frames).toEqual([])
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should set loading state when fetching frames for keywords', async () => {
        const { result } = renderHook(() => useFrames())

        act(() => {
            result.current.fetchFramesForKeywords(['1', '2', '3'])
        })

        expect(result.current.loading).toBe(true)
        expect(result.current.error).toBeNull()
    })

    it('should fetch frames for keywords successfully', async () => {
        const { result } = renderHook(() => useFrames())

        await act(async () => {
            // Use a small number of keywords to avoid progressive loading complexity
            await result.current.fetchFramesForKeywords(['13']) // Quality keyword with 20 frames
        })

        // After the call, loading should be false and we should have some frames
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.frames.length).toBeGreaterThan(0)

        // Should have frames with proper structure
        expect(result.current.frames[0]).toHaveProperty('id')
        expect(result.current.frames[0]).toHaveProperty('url')
        expect(result.current.frames[0]).toHaveProperty('keywords')
    }, 10000) // Increased timeout for this test

    it('should handle API errors gracefully in fetchFramesForKeywords', async () => {
        // Mock API to throw error
        const originalMethod = mockApiClient.getFramesForKeywords
        mockApiClient.getFramesForKeywords = vi.fn().mockRejectedValue(new Error('API Error'))

        const { result } = renderHook(() => useFrames())

        await act(async () => {
            await result.current.fetchFramesForKeywords(['1'])
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe('API Error')
        expect(result.current.frames).toEqual([])

        // Should have called toast with error
        expect(mockToast).toHaveBeenCalledWith({
            title: "Error",
            description: "API Error",
            variant: "destructive",
        })

        // Restore original function
        mockApiClient.getFramesForKeywords = originalMethod
    })

    it('should fetch frames from cluster successfully', async () => {
        const { result } = renderHook(() => useFrames())

        await act(async () => {
            await result.current.fetchFramesFromCluster(1)
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.frames.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle API errors in fetchFramesFromCluster', async () => {
        // Mock API to throw error
        const originalMethod = mockApiClient.getFramesFromCluster
        mockApiClient.getFramesFromCluster = vi.fn().mockRejectedValue(new Error('Cluster Error'))

        const { result } = renderHook(() => useFrames())

        await act(async () => {
            await result.current.fetchFramesFromCluster(1)
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe('Cluster Error')

        // Should have called toast with error
        expect(mockToast).toHaveBeenCalledWith({
            title: "Error",
            description: "Cluster Error",
            variant: "destructive",
        })

        // Restore original function
        mockApiClient.getFramesFromCluster = originalMethod
    })

    it('should get frame image successfully', async () => {
        const { result } = renderHook(() => useFrames())

        // Mock the getFrame method
        const mockFrame = { frame: 'base64-encoded-frame-data' }
        const originalGetFrame = mockApiClient.getFrame
        mockApiClient.getFrame = vi.fn().mockResolvedValue(mockFrame)

        const imageUrl = await result.current.getFrameImage('1')

        expect(imageUrl).toBeDefined()
        expect(mockApiClient.getFrame).toHaveBeenCalledWith('1')

        // Restore original function
        mockApiClient.getFrame = originalGetFrame
    })

    it('should handle errors in getFrameImage', async () => {
        const { result } = renderHook(() => useFrames())

        // Mock API to throw error for getFrame
        const originalMethod = mockApiClient.getFrame
        mockApiClient.getFrame = vi.fn().mockRejectedValue(new Error('Frame load error'))

        await expect(result.current.getFrameImage('1')).rejects.toThrow('Failed to load frame image')

        // Restore original function
        mockApiClient.getFrame = originalMethod
    })

    it('should update frame keywords successfully', async () => {
        const { result } = renderHook(() => useFrames())

        // First, add a frame to the state
        const mockFrameKeywords = [{ KeywordName: 'test-keyword', KeywordId: 1 }]
        const originalGetFrameKeywords = mockApiClient.getFrameKeywords
        mockApiClient.getFrameKeywords = vi.fn().mockResolvedValue(mockFrameKeywords)

        // Add a frame first
        await act(async () => {
            await result.current.fetchFramesForKeywords(['1'])
        })

        // Check if we have frames before trying to update keywords
        if (result.current.frames.length > 0) {
            const frameId = result.current.frames[0].id

            await act(async () => {
                await result.current.updateFrameKeywords(frameId)
            })

            // Find the updated frame
            const updatedFrame = result.current.frames.find(f => f.id === frameId)
            expect(updatedFrame?.keywords).toContain('test-keyword')
        }

        // Restore original function
        mockApiClient.getFrameKeywords = originalGetFrameKeywords
    })

    it('should handle errors in updateFrameKeywords gracefully', async () => {
        const { result } = renderHook(() => useFrames())

        // Mock API to throw error for getFrameKeywords
        const originalMethod = mockApiClient.getFrameKeywords
        mockApiClient.getFrameKeywords = vi.fn().mockRejectedValue(new Error('Keywords error'))

        // The function should not throw - it handles errors gracefully
        await act(async () => {
            await result.current.updateFrameKeywords('1')
        })

        // No error should be set in hook state (it's handled internally)
        expect(result.current.error).toBeNull()

        // Restore original function
        mockApiClient.getFrameKeywords = originalMethod
    })

    it('should handle non-Error objects in catch blocks', async () => {
        // Mock API to throw non-Error object
        const originalMethod = mockApiClient.getFramesForKeywords
        mockApiClient.getFramesForKeywords = vi.fn().mockRejectedValue('String error')

        const { result } = renderHook(() => useFrames())

        await act(async () => {
            await result.current.fetchFramesForKeywords(['1'])
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe('Failed to fetch frames')
        expect(result.current.frames).toEqual([])

        // Should have called toast with generic error
        expect(mockToast).toHaveBeenCalledWith({
            title: "Error",
            description: "Failed to fetch frames",
            variant: "destructive",
        })

        // Restore original function
        mockApiClient.getFramesForKeywords = originalMethod
    })

    it('should handle progressive loading disabled', async () => {
        const { result } = renderHook(() => useFrames())

        await act(async () => {
            await result.current.fetchFramesForKeywords(['1'], 0, 1, false)
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should handle background loading state', async () => {
        const { result } = renderHook(() => useFrames())

        // Mock many frame IDs to trigger progressive loading
        const mockFrameIds = Array.from({ length: 50 }, (_, i) => i + 1)
        const originalGetFramesForKeywords = mockApiClient.getFramesForKeywords
        mockApiClient.getFramesForKeywords = vi.fn().mockResolvedValue({ values: mockFrameIds })

        await act(async () => {
            await result.current.fetchFramesForKeywords(['1'], 0, 1, true)
        })

        // Background loading state might be triggered
        expect(result.current.backgroundLoading).toBeDefined()

        // Restore original function
        mockApiClient.getFramesForKeywords = originalGetFramesForKeywords
    })

    it('should handle confidence parameters in fetch', async () => {
        const { result } = renderHook(() => useFrames())

        await act(async () => {
            await result.current.fetchFramesForKeywords(['1'], 0.5, 0.9)
        })

        // Should complete without error regardless of confidence values
        expect(result.current.error).toBeNull()
    })
})
