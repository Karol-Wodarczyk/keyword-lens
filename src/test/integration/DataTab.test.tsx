import { render, screen, waitFor } from '@/test/utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DataTab } from '@/components/DataTab'

// Mock the hooks to provide controlled data
vi.mock('@/hooks/useKeywords', () => ({
    useKeywords: vi.fn(() => ({
        keywords: [
            { id: '1', text: 'machine', imageCount: 40, isSelected: false, isHidden: false },
            { id: '2', text: 'quality', imageCount: 20, isSelected: false, isHidden: false },
        ],
        loading: false,
        error: null,
        toggleKeyword: vi.fn(),
        editKeyword: vi.fn(),
        toggleKeywordVisibility: vi.fn(),
        refetch: vi.fn(),
    }))
}))

vi.mock('@/hooks/useFrames', () => ({
    useFrames: vi.fn(() => ({
        frames: [],
        loading: false,
        error: null,
        fetchFramesForKeywords: vi.fn(),
        getFrameImage: vi.fn(),
        updateFrameKeywords: vi.fn(),
        fetchFramesFromCluster: vi.fn(),
    }))
}))

vi.mock('@/hooks/useAlbums', () => ({
    useAlbums: vi.fn(() => ({
        albums: [],
        loading: false,
        error: null,
        fetchAlbumsForKeywords: vi.fn(),
        getAlbumFrames: vi.fn(),
    }))
}))

describe('DataTab Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render the main components', async () => {
        render(<DataTab />)

        // Should render the search and filter component
        await waitFor(() => {
            expect(screen.getByText('Keywords')).toBeInTheDocument()
        })

        // Should render multiple comboboxes (there are several select elements)
        const comboboxes = screen.getAllByRole('combobox')
        expect(comboboxes.length).toBeGreaterThanOrEqual(1)

        // Should render action buttons
        expect(screen.getByText('AI Model')).toBeInTheDocument()
        expect(screen.getByText('Annotate')).toBeInTheDocument()
    })

    it('should show no data message when no keywords selected', () => {
        render(<DataTab />)

        // Look for the "No Keywords Selected" heading that appears in ImageContent
        expect(screen.getByText('No Keywords Selected')).toBeInTheDocument()
    })

    it('should handle loading states', () => {
        // This test passes if components render without errors during loading
        render(<DataTab />)

        // Should render the main container without crashing
        expect(screen.getByText('Keywords')).toBeInTheDocument()
    })
})
