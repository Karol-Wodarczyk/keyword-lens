import { render, screen, waitFor } from '@/test/utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { mockApiClient } from '@/services/mockApi'

// Mock the API config to use mock client BEFORE importing the hook
vi.mock('@/services/apiConfig', () => ({
    apiClient: mockApiClient
}))

// Now import the hook after mocking
import { useKeywords } from '@/hooks/useKeywords'

// Mock hooks that will be tested separately
vi.mock('@/hooks/useFrames', () => ({
    useFrames: vi.fn()
}))

vi.mock('@/hooks/useAlbums', () => ({
    useAlbums: vi.fn()
}))

// Mock component that uses the hook
function TestComponent() {
    const { keywords, loading, error, refetch } = useKeywords()

    return (
        <div>
            <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
            <div data-testid="error">{error || 'no-error'}</div>
            <div data-testid="keywords-count">{keywords.length}</div>
            <button onClick={refetch} data-testid="fetch-button">
                Refetch Keywords
            </button>
            <div data-testid="keywords">
                {keywords.map(keyword => (
                    <span key={keyword.id} data-testid={`keyword-${keyword.id}`}>
                        {keyword.text} ({keyword.imageCount})
                    </span>
                ))}
            </div>
        </div>
    )
}

describe('useKeywords', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should load keywords on mount and handle refetch', async () => {
        render(<TestComponent />)

        // Initially should be loading (useEffect triggers fetchKeywords on mount)
        expect(screen.getByTestId('loading')).toHaveTextContent('loading')

        // Wait for keywords to load
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        }, { timeout: 1000 })

        // Should have keywords loaded
        expect(screen.getByTestId('error')).toHaveTextContent('no-error')
        expect(screen.getByTestId('keywords-count')).not.toHaveTextContent('0')

        // Should have specific keywords
        await waitFor(() => {
            expect(screen.getByTestId('keyword-1')).toBeInTheDocument()
        })

        // Test refetch functionality
        const initialKeywordCount = parseInt(screen.getByTestId('keywords-count').textContent || '0')
        screen.getByTestId('fetch-button').click()

        // Should briefly show loading then return to not-loading
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        }, { timeout: 1000 })

        // Should still have keywords
        expect(parseInt(screen.getByTestId('keywords-count').textContent || '0')).toBeGreaterThan(0)
    })

    it('should handle API errors gracefully', async () => {
        // Mock API to throw error
        const originalGetKeywords = mockApiClient.getKeywords
        mockApiClient.getKeywords = vi.fn().mockRejectedValue(new Error('API Error'))

        render(<TestComponent />)

        // Click fetch button
        screen.getByTestId('fetch-button').click()

        // Wait for error to appear
        await waitFor(() => {
            expect(screen.getByTestId('error')).toHaveTextContent('API Error')
        }, { timeout: 1000 })

        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        expect(screen.getByTestId('keywords-count')).toHaveTextContent('0')

        // Restore original function
        mockApiClient.getKeywords = originalGetKeywords
    })

    it('should transform API keywords correctly', async () => {
        render(<TestComponent />)

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        }, { timeout: 1000 })

        // Check that keywords are transformed correctly
        const machineKeyword = screen.getByTestId('keyword-1')
        expect(machineKeyword).toHaveTextContent('machine')
        expect(machineKeyword).toHaveTextContent('(40)') // Updated count from mock data
    })
})
