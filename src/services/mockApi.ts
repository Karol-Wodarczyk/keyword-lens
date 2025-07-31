// Mock data for development and testing
import {
    KeywordDto,
    FrameMetaDataDto,
    FrameKeywordDataDto,
    BoundingBoxDto,
    FrameResponse,
    ThumbnailResponse,
    ListInt64Dto,
    FramesForKeywords
} from './api';

// Mock Keywords Data
const mockKeywords: KeywordDto[] = [
    { Id: 1, Name: "machine", IsEntity: false, Count: 156 },
    { Id: 2, Name: "automatic", IsEntity: false, Count: 34 },
    { Id: 3, Name: "production", IsEntity: false, Count: 41 },
    { Id: 4, Name: "plastic", IsEntity: false, Count: 25 },
    { Id: 5, Name: "manufacturing", IsEntity: false, Count: 89 },
    { Id: 6, Name: "factory", IsEntity: false, Count: 3 },
    { Id: 7, Name: "industrial", IsEntity: false, Count: 67 },
    { Id: 8, Name: "equipment", IsEntity: false, Count: 78 },
    { Id: 9, Name: "assembly", IsEntity: false, Count: 23 },
    { Id: 10, Name: "conveyor", IsEntity: false, Count: 12 },
    { Id: 11, Name: "robotic", IsEntity: false, Count: 45 },
    { Id: 12, Name: "worker", IsEntity: false, Count: 67 },
    { Id: 13, Name: "quality", IsEntity: false, Count: 34 },
    { Id: 14, Name: "control", IsEntity: false, Count: 28 },
    { Id: 15, Name: "packaging", IsEntity: false, Count: 19 }
];

// Mock Frame Metadata
const mockFrameMetadata: FrameMetaDataDto[] = Array.from({ length: 100 }, (_, i) => ({
    Id: i + 1,
    Height: 1080,
    Width: 1920,
    Timestamp: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(), // Random date within last 30 days
    IsValuable: Math.random() > 0.3, // 70% chance of being valuable
    Thumbnail: `mock_thumbnail_${i + 1}` // Mock base64 thumbnail data
}));

// Mock Frame Keywords Data
const mockFrameKeywords: FrameKeywordDataDto[] = [];
// Generate frame keywords for each frame
mockFrameMetadata.forEach(frame => {
    const numKeywords = Math.floor(Math.random() * 5) + 1; // 1-5 keywords per frame
    const selectedKeywords = mockKeywords
        .sort(() => 0.5 - Math.random())
        .slice(0, numKeywords);

    selectedKeywords.forEach((keyword, idx) => {
        mockFrameKeywords.push({
            Id: mockFrameKeywords.length + 1,
            FrameId: frame.Id,
            KeywordId: keyword.Id,
            KeywordName: keyword.Name,
            Confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0 confidence
            X1: Math.random() * 800,
            Y1: Math.random() * 600,
            X2: Math.random() * 800 + 800,
            Y2: Math.random() * 600 + 600
        });
    });
});

// Mock Frame Images (base64 encoded placeholder)
const createMockImageBase64 = (frameId: number): string => {
    // This creates a simple SVG-based placeholder image
    const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="24" fill="#666">
        Frame ${frameId}
      </text>
      <rect x="50" y="50" width="700" height="500" fill="none" stroke="#ddd" stroke-width="2"/>
    </svg>
  `;
    return btoa(svg); // Convert to base64
};

const createMockThumbnailBase64 = (frameId: number): string => {
    const svg = `
    <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e8e8e8"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#999">
        Thumb ${frameId}
      </text>
    </svg>
  `;
    return btoa(svg);
};

// Mock Bounding Boxes
const mockBoundingBoxes: { [key: string]: BoundingBoxDto[] } = {};
mockFrameKeywords.forEach(fk => {
    const key = `${fk.FrameId}-${fk.KeywordId}`;
    if (!mockBoundingBoxes[key]) {
        mockBoundingBoxes[key] = [];
    }
    mockBoundingBoxes[key].push({
        X1: fk.X1,
        Y1: fk.Y1,
        X2: fk.X2,
        Y2: fk.Y2
    });
});

// Mock API Implementation
export const mockApiClient = {
    async getKeywords(): Promise<KeywordDto[]> {
        console.log('🎭 Mock: Getting keywords');
        await delay(300); // Simulate network delay
        return mockKeywords;
    },

    async getFrameKeywords(frameId: string): Promise<FrameKeywordDataDto[]> {
        console.log(`🎭 Mock: Getting keywords for frame ${frameId}`);
        await delay(200);
        const frameIdNum = parseInt(frameId, 10);
        return mockFrameKeywords.filter(fk => fk.FrameId === frameIdNum);
    },

    async getFramesForKeywords(params: FramesForKeywords): Promise<ListInt64Dto> {
        console.log('🎭 Mock: Getting frames for keywords', params);
        await delay(400);

        // Find frames that contain any of the specified keywords
        const relevantFrameKeywords = mockFrameKeywords.filter(fk =>
            params.keyword_ids.includes(fk.KeywordId) &&
            fk.Confidence >= params.confidence_min &&
            fk.Confidence <= params.confidence_max
        );

        const frameIds = [...new Set(relevantFrameKeywords.map(fk => fk.FrameId))];

        return {
            values: frameIds
        };
    },

    async getFrameIds(): Promise<ListInt64Dto> {
        console.log('🎭 Mock: Getting all frame IDs');
        await delay(300);
        return {
            values: mockFrameMetadata.map(f => f.Id)
        };
    },

    async getFrame(frameId: string): Promise<FrameResponse> {
        console.log(`🎭 Mock: Getting frame ${frameId}`);
        await delay(500); // Simulate longer load time for full image
        const frameIdNum = parseInt(frameId, 10);
        return {
            frame: createMockImageBase64(frameIdNum)
        };
    },

    async getFrameMetadata(frameId: string): Promise<FrameMetaDataDto> {
        console.log(`🎭 Mock: Getting metadata for frame ${frameId}`);
        await delay(200);
        const frameIdNum = parseInt(frameId, 10);
        const metadata = mockFrameMetadata.find(f => f.Id === frameIdNum);
        if (!metadata) {
            throw new Error(`Frame ${frameId} not found`);
        }
        return metadata;
    },

    async getFrameThumbnail(frameId: string): Promise<ThumbnailResponse> {
        console.log(`🎭 Mock: Getting thumbnail for frame ${frameId}`);
        await delay(150);
        const frameIdNum = parseInt(frameId, 10);
        return {
            thumbnail: createMockThumbnailBase64(frameIdNum)
        };
    },

    async getBoundingBoxes(frameId: string, keywordId: string): Promise<BoundingBoxDto[]> {
        console.log(`🎭 Mock: Getting bounding boxes for frame ${frameId}, keyword ${keywordId}`);
        await delay(200);
        const key = `${frameId}-${keywordId}`;
        return mockBoundingBoxes[key] || [];
    },

    base64ToDataUrl(base64: string, type: 'image' | 'thumbnail' = 'image'): string {
        const mimeType = 'image/svg+xml'; // Since we're using SVG placeholders
        return `data:${mimeType};base64,${base64}`;
    }
};

// Utility function to simulate network delay
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Export individual mock data for testing
export {
    mockFrameMetadata,
    mockFrameKeywords,
    mockBoundingBoxes
};
