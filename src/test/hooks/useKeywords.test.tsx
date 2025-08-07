import { render, screen, waitFor } from '@/test/utils'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { mockApiClient } from '@/services/mockApi'

// Mock the useToast hook with correct relative path from useKeywords.ts perspective
const mockToast = vi.fn()
vi.mock('../../hooks/use-toast', () => ({
    useToast: () => ({ toast: mockToast })
}))

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

// Mock component that uses the hook for integration tests
function TestComponent() {
    const { keywords, loading, error, refetch, toggleKeyword, editKeyword, toggleKeywordVisibility } = useKeywords()

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
                    <div key={keyword.id} data-testid={`keyword-${keyword.id}`}>
                        <span data-testid={`keyword-text-${keyword.id}`}>
                            {keyword.text} ({keyword.imageCount})
                        </span>
                        <span data-testid={`keyword-selected-${keyword.id}`}>
                            {keyword.isSelected ? 'selected' : 'not-selected'}
                        </span>
                        <span data-testid={`keyword-visibility-${keyword.id}`}>
                            {keyword.isHidden ? 'hidden' : 'visible'}
                        </span>
                        <button
                            onClick={() => toggleKeyword(keyword.id)}
                            data-testid={`toggle-${keyword.id}`}
                        >
                            Toggle
                        </button>
                        <button
                            onClick={() => editKeyword(keyword.id, `edited-${keyword.text}`)}
                            data-testid={`edit-${keyword.id}`}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => toggleKeywordVisibility(keyword.id)}
                            data-testid={`visibility-${keyword.id}`}
                        >
                            Toggle Visibility
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

describe('useKeywords', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockToast.mockClear()
    })

    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useKeywords())

        expect(result.current.keywords).toEqual([])
        expect(result.current.loading).toBe(true) // Initially loading due to useEffect
        expect(result.current.error).toBeNull()
    })

    it('should load keywords on mount', async () => {
        const { result } = renderHook(() => useKeywords())

        // Wait for the initial fetch to complete
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.error).toBeNull()
        expect(result.current.keywords.length).toBeGreaterThan(0)

        // Should have proper structure
        const firstKeyword = result.current.keywords[0]
        expect(firstKeyword).toHaveProperty('id')
        expect(firstKeyword).toHaveProperty('text')
        expect(firstKeyword).toHaveProperty('imageCount')
        expect(firstKeyword).toHaveProperty('isSelected', false)
        expect(firstKeyword).toHaveProperty('isHidden', false)
    })

    it('should toggle keyword selection', async () => {
        const { result } = renderHook(() => useKeywords())

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const firstKeyword = result.current.keywords[0]
        const keywordId = firstKeyword.id

        // Initially not selected
        expect(firstKeyword.isSelected).toBe(false)

        // Toggle selection
        act(() => {
            result.current.toggleKeyword(keywordId)
        })

        // Should be selected now
        const updatedKeyword = result.current.keywords.find(k => k.id === keywordId)
        expect(updatedKeyword?.isSelected).toBe(true)

        // Toggle again
        act(() => {
            result.current.toggleKeyword(keywordId)
        })

        // Should be unselected again
        const finalKeyword = result.current.keywords.find(k => k.id === keywordId)
        expect(finalKeyword?.isSelected).toBe(false)
    })

    it('should edit keyword text', async () => {
        const { result } = renderHook(() => useKeywords())

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const firstKeyword = result.current.keywords[0]
        const keywordId = firstKeyword.id
        const originalText = firstKeyword.text
        const newText = 'edited-keyword'

        // Edit keyword
        act(() => {
            result.current.editKeyword(keywordId, newText)
        })

        // Should have new text
        const updatedKeyword = result.current.keywords.find(k => k.id === keywordId)
        expect(updatedKeyword?.text).toBe(newText)
        expect(updatedKeyword?.text).not.toBe(originalText)

        // Other properties should remain unchanged
        expect(updatedKeyword?.id).toBe(keywordId)
        expect(updatedKeyword?.imageCount).toBe(firstKeyword.imageCount)
        expect(updatedKeyword?.isSelected).toBe(firstKeyword.isSelected)
        expect(updatedKeyword?.isHidden).toBe(firstKeyword.isHidden)
    })

    it('should toggle keyword visibility', async () => {
        const { result } = renderHook(() => useKeywords())

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const firstKeyword = result.current.keywords[0]
        const keywordId = firstKeyword.id

        // Initially visible (not hidden)
        expect(firstKeyword.isHidden).toBe(false)

        // Toggle visibility
        act(() => {
            result.current.toggleKeywordVisibility(keywordId)
        })

        // Should be hidden now
        const updatedKeyword = result.current.keywords.find(k => k.id === keywordId)
        expect(updatedKeyword?.isHidden).toBe(true)

        // Toggle again
        act(() => {
            result.current.toggleKeywordVisibility(keywordId)
        })

        // Should be visible again
        const finalKeyword = result.current.keywords.find(k => k.id === keywordId)
        expect(finalKeyword?.isHidden).toBe(false)
    })

    it('should handle API errors gracefully', async () => {
        // Mock API to throw error
        const originalGetKeywords = mockApiClient.getKeywords
        mockApiClient.getKeywords = vi.fn().mockRejectedValue(new Error('API Error'))

        const { result } = renderHook(() => useKeywords())

        // Wait for error to be set
        await waitFor(() => {
            expect(result.current.error).toBe('API Error')
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.keywords).toEqual([])

        // Should have called toast with error
        expect(mockToast).toHaveBeenCalledWith({
            title: "Error",
            description: "API Error",
            variant: "destructive",
        })

        // Restore original function
        mockApiClient.getKeywords = originalGetKeywords
    })

    it('should handle non-Error objects in catch blocks', async () => {
        // Mock API to throw non-Error object
        const originalGetKeywords = mockApiClient.getKeywords
        mockApiClient.getKeywords = vi.fn().mockRejectedValue('String error')

        const { result } = renderHook(() => useKeywords())

        // Wait for error to be set
        await waitFor(() => {
            expect(result.current.error).toBe('Failed to fetch keywords')
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.keywords).toEqual([])

        // Should have called toast with generic error
        expect(mockToast).toHaveBeenCalledWith({
            title: "Error",
            description: "Failed to fetch keywords",
            variant: "destructive",
        })

        // Restore original function
        mockApiClient.getKeywords = originalGetKeywords
    })

    it('should refetch keywords when refetch is called', async () => {
        const { result } = renderHook(() => useKeywords())

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const initialKeywordsLength = result.current.keywords.length

        // Call refetch
        await act(async () => {
            await result.current.refetch()
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.keywords.length).toBe(initialKeywordsLength)
    })

    it('should not affect unrelated keywords when toggling', async () => {
        const { result } = renderHook(() => useKeywords())

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const keywords = result.current.keywords
        if (keywords.length < 2) {
            // Skip test if not enough keywords
            return
        }

        const firstKeyword = keywords[0]
        const secondKeyword = keywords[1]
        const firstId = firstKeyword.id
        const secondId = secondKeyword.id

        // Toggle first keyword
        act(() => {
            result.current.toggleKeyword(firstId)
        })

        const updatedKeywords = result.current.keywords
        const updatedFirst = updatedKeywords.find(k => k.id === firstId)
        const updatedSecond = updatedKeywords.find(k => k.id === secondId)

        // First keyword should be toggled
        expect(updatedFirst?.isSelected).toBe(true)
        // Second keyword should remain unchanged
        expect(updatedSecond?.isSelected).toBe(false)
        expect(updatedSecond?.text).toBe(secondKeyword.text)
        expect(updatedSecond?.isHidden).toBe(false)
    })

    it('should handle editing non-existent keyword gracefully', async () => {
        const { result } = renderHook(() => useKeywords())

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const initialKeywords = result.current.keywords

        // Try to edit non-existent keyword
        act(() => {
            result.current.editKeyword('non-existent-id', 'new-text')
        })

        // Keywords should remain unchanged
        expect(result.current.keywords).toEqual(initialKeywords)
    })

    it('should handle toggling non-existent keyword gracefully', async () => {
        const { result } = renderHook(() => useKeywords())

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const initialKeywords = result.current.keywords

        // Try to toggle non-existent keyword
        act(() => {
            result.current.toggleKeyword('non-existent-id')
        })

        // Keywords should remain unchanged
        expect(result.current.keywords).toEqual(initialKeywords)
    })

    it('should handle visibility toggle for non-existent keyword gracefully', async () => {
        const { result } = renderHook(() => useKeywords())

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const initialKeywords = result.current.keywords

        // Try to toggle visibility of non-existent keyword
        act(() => {
            result.current.toggleKeywordVisibility('non-existent-id')
        })

        // Keywords should remain unchanged
        expect(result.current.keywords).toEqual(initialKeywords)
    })

    // Integration tests with component
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

    it('should handle API errors gracefully in component', async () => {
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

    it('should handle keyword interactions in component', async () => {
        render(<TestComponent />)

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
        }, { timeout: 1000 })

        // Check initial state
        expect(screen.getByTestId('keyword-selected-1')).toHaveTextContent('not-selected')
        expect(screen.getByTestId('keyword-visibility-1')).toHaveTextContent('visible')

        // Toggle selection
        act(() => {
            screen.getByTestId('toggle-1').click()
        })
        expect(screen.getByTestId('keyword-selected-1')).toHaveTextContent('selected')

        // Edit keyword
        act(() => {
            screen.getByTestId('edit-1').click()
        })
        expect(screen.getByTestId('keyword-text-1')).toHaveTextContent('edited-machine (40)')

        // Toggle visibility
        act(() => {
            screen.getByTestId('visibility-1').click()
        })
        expect(screen.getByTestId('keyword-visibility-1')).toHaveTextContent('hidden')
    })
})
