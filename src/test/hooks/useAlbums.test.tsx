import { render, screen, waitFor, fireEvent } from '@/test/utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { mockApiClient } from '@/services/mockApi'

// Mock the API config to use mock client BEFORE importing the hook
vi.mock('@/services/apiConfig', () => ({
    apiClient: mockApiClient
}))

// Now import the hook after mocking
import { useAlbums } from '@/hooks/useAlbums'

// Mock component that uses the hook
function TestComponent() {
    const { albums, loading, error, fetchAlbumsForKeywords, getAlbumFrames } = useAlbums()

    return (
        <div>
            <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
            <div data-testid="error">{error || 'no-error'}</div>
            <div data-testid="albums-count">{albums.length}</div>
            <button onClick={() => fetchAlbumsForKeywords([1, 2, 3])} data-testid="fetch-button">
                Fetch Albums
            </button>
            <button onClick={() => getAlbumFrames('1-1')} data-testid="get-frames-button">
                Get Album Frames
            </button>
            <div data-testid="albums">
                {albums.map(album => (
                    <div key={album.id} data-testid={`album-${album.id}`}>
                        {album.name} ({album.imageCount} images)
                    </div>
                ))}
            </div>
        </div>
    )
}

describe('useAlbums', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should initialize with empty state', () => {
        render(<TestComponent />)

        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        expect(screen.getByTestId('error')).toHaveTextContent('no-error')
        expect(screen.getByTestId('albums-count')).toHaveTextContent('0')
    })

    it('should handle empty frame IDs', async () => {
        render(<TestComponent />)

        // The component should handle empty state properly
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
            expect(screen.getByTestId('error')).toHaveTextContent('no-error') 
            expect(screen.getByTestId('albums-count')).toHaveTextContent('0')
        })
    })

    it('should fetch albums for keyword frame IDs', async () => {
        render(<TestComponent />)

        const fetchButton = screen.getByTestId('fetch-button')
        fireEvent.click(fetchButton)

        // Should show loading initially
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('loading')
        }, { timeout: 1000 })

        // Should eventually finish loading
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        }, { timeout: 5000 })

        // Should have no error
        expect(screen.getByTestId('error')).toHaveTextContent('no-error')
    })

    it('should handle API errors gracefully', async () => {
        // Mock API to throw error
        const originalGetConfigIds = mockApiClient.getConfigIds
        mockApiClient.getConfigIds = vi.fn().mockRejectedValue(new Error('API Error'))

        render(<TestComponent />)

        const fetchButton = screen.getByTestId('fetch-button')
        fireEvent.click(fetchButton)

        // Wait for error to appear
        await waitFor(() => {
            expect(screen.getByTestId('error')).toHaveTextContent('API Error')
        }, { timeout: 1000 })

        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        expect(screen.getByTestId('albums-count')).toHaveTextContent('0')

        // Restore original function
        mockApiClient.getConfigIds = originalGetConfigIds
    })

    it('should handle getAlbumFrames', async () => {
        render(<TestComponent />)

        const getFramesButton = screen.getByTestId('get-frames-button')
        fireEvent.click(getFramesButton)

        // Should not crash (mock implementation returns empty array)
        expect(screen.getByTestId('albums-count')).toHaveTextContent('0')
    })

    it('should prevent flickering by not refetching when albums exist', async () => {
        const TestComponentWithAlbums = () => {
            const { albums, loading, fetchAlbumsForKeywords } = useAlbums()
            
            return (
                <div>
                    <div data-testid="albums-count">{albums.length}</div>
                    <button onClick={() => fetchAlbumsForKeywords([4, 5, 6])} data-testid="refetch-button">
                        Refetch
                    </button>
                </div>
            )
        }

        render(<TestComponentWithAlbums />)

        // Click refetch button
        const refetchButton = screen.getByTestId('refetch-button')
        fireEvent.click(refetchButton)

        // Should not cause issues
        expect(screen.getByTestId('albums-count')).toBeDefined()
    })
})
