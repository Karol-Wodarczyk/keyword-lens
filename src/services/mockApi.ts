// Mock data for development and testing
import {
    KeywordDto,
    FrameMetaDataDto,
    FrameKeywordDataDto,
    BoundingBoxDto,
    FrameResponse,
    ThumbnailResponse,
    ListInt64Dto,
    FramesForKeywords,
    FramesFromCluster
} from './api';

// Mock Keywords Data (counts will be calculated dynamically)
const mockKeywords: KeywordDto[] = [
    { Id: 1, Name: "machine", IsEntity: false, Count: 0 },
    { Id: 2, Name: "automatic", IsEntity: false, Count: 0 },
    { Id: 3, Name: "production", IsEntity: false, Count: 0 },
    { Id: 4, Name: "plastic", IsEntity: false, Count: 0 },
    { Id: 5, Name: "manufacturing", IsEntity: false, Count: 0 },
    { Id: 6, Name: "factory", IsEntity: false, Count: 0 },
    { Id: 7, Name: "industrial", IsEntity: false, Count: 0 },
    { Id: 8, Name: "equipment", IsEntity: false, Count: 0 },
    { Id: 9, Name: "assembly", IsEntity: false, Count: 0 },
    { Id: 10, Name: "conveyor", IsEntity: false, Count: 0 },
    { Id: 11, Name: "robotic", IsEntity: false, Count: 0 },
    { Id: 12, Name: "worker", IsEntity: false, Count: 0 },
    { Id: 13, Name: "quality", IsEntity: false, Count: 0 },
    { Id: 14, Name: "control", IsEntity: false, Count: 0 },
    { Id: 15, Name: "packaging", IsEntity: false, Count: 0 }
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

// STRATEGIC APPROACH: Create keywords with specific frame counts for each occurrence level
// This ensures we have keywords in all occurrence ranges

// Define keywords with their target frame counts for different occurrence levels
const keywordFrameStrategy = [
    // HIGH OCCURRENCE (20+ frames)
    { keyword: "machine", targetFrames: 35 },
    { keyword: "production", targetFrames: 28 },
    { keyword: "manufacturing", targetFrames: 32 },
    { keyword: "factory", targetFrames: 25 },
    { keyword: "industrial", targetFrames: 22 },

    // MEDIUM OCCURRENCE (5-19 frames)  
    { keyword: "quality", targetFrames: 15 },
    { keyword: "equipment", targetFrames: 12 },
    { keyword: "assembly", targetFrames: 18 },
    { keyword: "conveyor", targetFrames: 10 },
    { keyword: "robotic", targetFrames: 8 },

    // LOW OCCURRENCE (1-4 frames)
    { keyword: "automatic", targetFrames: 3 },
    { keyword: "plastic", targetFrames: 4 },
    { keyword: "worker", targetFrames: 2 },
    { keyword: "control", targetFrames: 3 },
    { keyword: "packaging", targetFrames: 1 }
];

// Generate frame-keyword relationships based on the strategy
keywordFrameStrategy.forEach(({ keyword: keywordName, targetFrames }) => {
    const keyword = mockKeywords.find(k => k.Name === keywordName);
    if (keyword) {
        console.log(`🎯 Assigning ${targetFrames} frames to "${keywordName}" (ID: ${keyword.Id})`);

        // Generate frame IDs for this keyword (distributed across the 100 frames)
        const step = Math.floor(100 / targetFrames);
        const startOffset = keyword.Id % 10; // Use keyword ID to create variation

        for (let i = 0; i < targetFrames; i++) {
            const frameId = ((startOffset + i * step) % 100) + 1;

            mockFrameKeywords.push({
                Id: mockFrameKeywords.length + 1,
                FrameId: frameId,
                KeywordId: keyword.Id,
                KeywordName: keyword.Name,
                Confidence: 0.7 + Math.random() * 0.3, // 0.7-1.0 confidence
                X1: Math.random() * 800,
                Y1: Math.random() * 600,
                X2: Math.random() * 800 + 800,
                Y2: Math.random() * 600 + 600
            });
        }
    }
});// VERIFICATION: Ensure no keyword has zero frames
const keywordsWithNoFrames = mockKeywords.filter(k => k.Count === 0);
if (keywordsWithNoFrames.length > 0) {
    console.error('🚨 CRITICAL: Some keywords have NO frames assigned:', keywordsWithNoFrames.map(k => k.Name));

    // Emergency fix: Add frames to keywords with zero frames
    keywordsWithNoFrames.forEach(keyword => {
        const emergencyFrameIds = [1, 2, 3, 4, 5]; // Use first 5 frames as emergency backup
        emergencyFrameIds.forEach(frameId => {
            mockFrameKeywords.push({
                Id: mockFrameKeywords.length + 1,
                FrameId: frameId,
                KeywordId: keyword.Id,
                KeywordName: keyword.Name,
                Confidence: 0.9, // High confidence
                X1: Math.random() * 800,
                Y1: Math.random() * 600,
                X2: Math.random() * 800 + 800,
                Y2: Math.random() * 600 + 600
            });
        });
        keyword.Count = 5; // Update count
        console.log(`🔧 Emergency fix: Added 5 frames to keyword "${keyword.Name}"`);
    });
} else {
    console.log('✅ All keywords have frames assigned');
}

// FINAL STEP: Calculate actual keyword counts
mockKeywords.forEach(keyword => {
    const actualCount = mockFrameKeywords.filter(fk => fk.KeywordId === keyword.Id).length;
    keyword.Count = actualCount;

    // Determine occurrence level for this keyword
    let occurrenceLevel = 'none';
    if (actualCount >= 20) occurrenceLevel = 'high';
    else if (actualCount >= 5) occurrenceLevel = 'medium';
    else if (actualCount >= 1) occurrenceLevel = 'low';

    console.log(`🎯 Keyword "${keyword.Name}" (ID: ${keyword.Id}): ${actualCount} frames [${occurrenceLevel} occurrence]`);
});

console.log('🎯 STRATEGIC TEST: Keywords distributed across all occurrence levels:');
console.log('  📈 HIGH (20+): machine, production, manufacturing, factory, industrial');
console.log('  📊 MEDIUM (5-19): quality, equipment, assembly, conveyor, robotic');
console.log('  📉 LOW (1-4): automatic, plastic, worker, control, packaging');

// Debug: Log the frame-keyword generation results
console.log('🎭 Mock Data Generation Complete:');
console.log(`📊 Generated ${mockFrameKeywords.length} frame-keyword relationships`);
console.log(`🖼️ Across ${mockFrameMetadata.length} frames`);
console.log(`🏷️ Using ${mockKeywords.length} keywords`);

// Show keyword counts
console.log('🔢 Keyword counts (frames containing each keyword):');
mockKeywords.forEach(keyword => {
    const frameCount = keyword.Count;
    const actualFrameCount = mockFrameKeywords.filter(fk => fk.KeywordId === keyword.Id).length;
    const status = frameCount > 0 ? '✅' : '❌';
    const countMatch = frameCount === actualFrameCount ? '✅' : '❌';
    console.log(`  ${status} ${keyword.Name}: ${frameCount} frames ${countMatch} (actual: ${actualFrameCount})`);
});

// Verify minimum coverage
const totalKeywordsWithFrames = mockKeywords.filter(k => k.Count > 0).length;
const totalKeywords = mockKeywords.length;
console.log(`📊 Coverage: ${totalKeywordsWithFrames}/${totalKeywords} keywords have frames (${((totalKeywordsWithFrames / totalKeywords) * 100).toFixed(1)}%)`);

if (totalKeywordsWithFrames === totalKeywords) {
    console.log('🎉 PERFECT: All keywords have frame associations!');
} else {
    console.warn(`⚠️ WARNING: ${totalKeywords - totalKeywordsWithFrames} keywords have no frames`);
}

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

        // SPECIFIC DEBUG for quality keyword
        if (params.keyword_ids.includes(13)) {
            console.log('🎯 QUALITY DEBUG: Quality keyword (ID: 13) requested!');
            const qualityRelationships = mockFrameKeywords.filter(fk => fk.KeywordId === 13);
            console.log('🎯 QUALITY DEBUG: Found relationships:', qualityRelationships);
        }

        // Debug: Show all available frame-keyword relationships
        console.log('🎭 Mock: Total frame-keyword relationships:', mockFrameKeywords.length);

        // Debug: Show keyword names for the requested IDs
        const requestedKeywordNames = params.keyword_ids.map(id => {
            const keyword = mockKeywords.find(k => k.Id === id);
            return keyword ? keyword.Name : `Unknown(${id})`;
        });
        console.log('🎭 Mock: Requested keyword names:', requestedKeywordNames);

        // Debug: Check frame count for each requested keyword individually
        params.keyword_ids.forEach(keywordId => {
            const keywordName = mockKeywords.find(k => k.Id === keywordId)?.Name || `Unknown(${keywordId})`;
            const framesForThisKeyword = mockFrameKeywords.filter(fk => fk.KeywordId === keywordId);
            console.log(`🎭 Mock: Keyword "${keywordName}" (ID: ${keywordId}) has ${framesForThisKeyword.length} frame associations`);
        });

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
        console.log('🎭 Mock: Unique frame IDs returned:', frameIds.length, frameIds.slice(0, 10));

        // SPECIFIC DEBUG for quality keyword
        if (params.keyword_ids.includes(13)) {
            console.log('🎯 QUALITY DEBUG: Returning frame IDs for quality:', frameIds);
        }

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

    async getFramesFromCluster(params: FramesFromCluster): Promise<ListInt64Dto> {
        console.log(`🎭 Mock: Getting frames from cluster ${params.cluster_id}`);
        await delay(300);
        
        // Mock cluster data - each cluster contains a subset of frames
        // For demo purposes, create clusters of ~10 frames each
        const clusterSize = 10;
        const startFrame = ((params.cluster_id - 1) * clusterSize) + 1;
        const endFrame = Math.min(startFrame + clusterSize - 1, mockFrameMetadata.length);
        
        const clusterFrameIds = [];
        for (let i = startFrame; i <= endFrame; i++) {
            clusterFrameIds.push(i);
        }
        
        console.log(`🎭 Mock: Cluster ${params.cluster_id} contains frames ${startFrame}-${endFrame}:`, clusterFrameIds);
        
        return {
            values: clusterFrameIds
        };
    },

    base64ToDataUrl(base64: string, type: 'image' | 'thumbnail' = 'image'): string {
        // For mock SVG images, use the proper SVG mime type
        const mimeType = 'image/svg+xml';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        console.log(`🖼️ Mock: Creating data URL for ${type}, length: ${base64.length}, URL preview: ${dataUrl.substring(0, 100)}...`);
        return dataUrl;
    },

    // DEBUG: Direct test function
    debugQualityKeyword(): void {
        const qualityKeyword = mockKeywords.find(k => k.Name === 'quality');
        console.log('🔧 DEBUG: Quality keyword:', qualityKeyword);

        const qualityRelationships = mockFrameKeywords.filter(fk => fk.KeywordName === 'quality');
        console.log('🔧 DEBUG: Quality relationships:', qualityRelationships);

        const qualityFrameIds = qualityRelationships.map(fk => fk.FrameId);
        console.log('🔧 DEBUG: Quality frame IDs:', qualityFrameIds);

        // Test the API call directly
        if (qualityKeyword) {
            this.getFramesForKeywords({
                keyword_ids: [qualityKeyword.Id],
                confidence_min: 0,
                confidence_max: 1
            }).then(result => {
                console.log('🔧 DEBUG: API call result for quality:', result);
            });
        }
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
    mockBoundingBoxes,
    mockKeywords
};

// Simple test function - remove the call to avoid complexity
export const testMockData = () => {
    console.log('🧪 TEST: Quality keyword has', mockFrameKeywords.filter(fk => fk.KeywordName === 'quality').length, 'frames');

    // Run debug test
    mockApiClient.debugQualityKeyword();
};

// Call test function to debug
testMockData();
