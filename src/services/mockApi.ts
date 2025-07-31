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

// First, ensure every keyword gets assigned to at least some frames
// This guarantees no keyword will have zero frames
mockKeywords.forEach(keyword => {
    // Each keyword appears in 8-15 random frames (to match their Count values roughly)
    const targetCount = Math.floor(keyword.Count / 10) + Math.floor(Math.random() * 8) + 3;
    const frameIndices = Array.from({ length: 100 }, (_, i) => i + 1)
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(targetCount, 100));

    frameIndices.forEach(frameId => {
        mockFrameKeywords.push({
            Id: mockFrameKeywords.length + 1,
            FrameId: frameId,
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

// Then add some additional random relationships to make it more realistic
mockFrameMetadata.forEach(frame => {
    const additionalKeywords = Math.floor(Math.random() * 3); // 0-2 additional keywords
    if (additionalKeywords > 0) {
        const randomKeywords = mockKeywords
            .sort(() => 0.5 - Math.random())
            .slice(0, additionalKeywords)
            .filter(keyword => !mockFrameKeywords.some(fk => 
                fk.FrameId === frame.Id && fk.KeywordId === keyword.Id
            )); // Avoid duplicates

        randomKeywords.forEach(keyword => {
            mockFrameKeywords.push({
                Id: mockFrameKeywords.length + 1,
                FrameId: frame.Id,
                KeywordId: keyword.Id,
                KeywordName: keyword.Name,
                Confidence: Math.random() * 0.4 + 0.6,
                X1: Math.random() * 800,
                Y1: Math.random() * 600,
                X2: Math.random() * 800 + 800,
                Y2: Math.random() * 600 + 600
            });
        });
    }
});

// Debug: Log the frame-keyword generation results
console.log('🎭 Mock Data Generation Complete:');
console.log(`📊 Generated ${mockFrameKeywords.length} frame-keyword relationships`);
console.log(`🖼️ Across ${mockFrameMetadata.length} frames`);
console.log(`🏷️ Using ${mockKeywords.length} keywords`);

// Show sample relationships for debugging
const sampleRelationships = mockFrameKeywords.slice(0, 10).map(fk => ({
    frameId: fk.FrameId,
    keywordId: fk.KeywordId,
    keywordName: fk.KeywordName
}));
console.log('🔍 Sample frame-keyword relationships:', sampleRelationships);

// Mock Frame Images (base64 encoded placeholder) 
const createMockImageBase64 = (frameId: number): string => {
  // Create a simple canvas-based image as backup
  try {
    const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${frameId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad${frameId})"/>
        <rect x="50" y="50" width="700" height="500" fill="none" stroke="#ccc" stroke-width="2" rx="10"/>
        <text x="50%" y="30%" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#666">
          Frame ${frameId}
        </text>
        <text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#999">
          Mock Manufacturing Image Data
        </text>
        <circle cx="200" cy="200" r="30" fill="#ff6b6b" opacity="0.7"/>
        <circle cx="600" cy="300" r="25" fill="#4ecdc4" opacity="0.7"/>
        <circle cx="400" cy="450" r="35" fill="#45b7d1" opacity="0.7"/>
        <rect x="300" y="150" width="200" height="80" fill="#96ceb4" opacity="0.5" rx="5"/>
      </svg>`;
    
    // Properly encode the SVG
    return btoa(unescape(encodeURIComponent(svg)));
  } catch (error) {
    console.error('Error creating mock image:', error);
    // Fallback to a simple base64 image
    return 'PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiI+RnJhbWU8L3RleHQ+Cjwvc3ZnPg==';
  }
};

const createMockThumbnailBase64 = (frameId: number): string => {
  try {
    const svg = `<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="thumbGrad${frameId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#thumbGrad${frameId})"/>
        <rect x="10" y="10" width="180" height="130" fill="none" stroke="#dee2e6" stroke-width="1" rx="5"/>
        <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#495057">
          Frame ${frameId}
        </text>
        <text x="50%" y="65%" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#6c757d">
          Thumbnail
        </text>
        <circle cx="50" cy="50" r="8" fill="#ff6b6b" opacity="0.8"/>
        <circle cx="150" cy="100" r="6" fill="#4ecdc4" opacity="0.8"/>
        <rect x="80" y="90" width="40" height="20" fill="#96ceb4" opacity="0.6" rx="2"/>
      </svg>`;
    
    // Properly encode the SVG
    return btoa(unescape(encodeURIComponent(svg)));
  } catch (error) {
    console.error('Error creating mock thumbnail:', error);
    // Fallback to a simple base64 thumbnail
    return 'PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSI+VGh1bWI8L3RleHQ+Cjwvc3ZnPg==';
  }
};// Mock Bounding Boxes
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
        console.log('🎭 Mock: Available keywords:', mockKeywords.map(k => ({ id: k.Id, name: k.Name, count: k.Count })));
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

        // Debug: Show all available frame-keyword relationships
        console.log('🎭 Mock: Total frame-keyword relationships:', mockFrameKeywords.length);
        
        // Find frames that contain any of the specified keywords
        const relevantFrameKeywords = mockFrameKeywords.filter(fk => 
            params.keyword_ids.includes(fk.KeywordId) &&
            fk.Confidence >= params.confidence_min &&
            fk.Confidence <= params.confidence_max
        );

        const frameIds = [...new Set(relevantFrameKeywords.map(fk => fk.FrameId))];
        
        console.log('🎭 Mock: Keyword IDs requested:', params.keyword_ids);
        console.log('🎭 Mock: Confidence range:', [params.confidence_min, params.confidence_max]);
        console.log('🎭 Mock: Found frame-keyword relationships:', relevantFrameKeywords.length);
        console.log('🎭 Mock: Sample relationships:', relevantFrameKeywords.slice(0, 5).map(fk => ({
            frameId: fk.FrameId,
            keywordId: fk.KeywordId,
            keywordName: fk.KeywordName,
            confidence: fk.Confidence.toFixed(2)
        })));
        console.log('🎭 Mock: Unique frame IDs:', frameIds);

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
        const thumbnailBase64 = createMockThumbnailBase64(frameIdNum);
        console.log(`🎭 Mock: Generated thumbnail base64 length: ${thumbnailBase64.length}`);
        return {
            thumbnail: thumbnailBase64
        };
    },

    async getBoundingBoxes(frameId: string, keywordId: string): Promise<BoundingBoxDto[]> {
        console.log(`🎭 Mock: Getting bounding boxes for frame ${frameId}, keyword ${keywordId}`);
        await delay(200);
        const key = `${frameId}-${keywordId}`;
        return mockBoundingBoxes[key] || [];
    },

    base64ToDataUrl(base64: string, type: 'image' | 'thumbnail' = 'image'): string {
        // For mock SVG images, use the proper SVG mime type
        const mimeType = 'image/svg+xml';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        console.log(`🖼️ Mock: Creating data URL for ${type}, length: ${base64.length}, URL preview: ${dataUrl.substring(0, 100)}...`);
        return dataUrl;
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
