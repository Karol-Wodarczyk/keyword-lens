// Test script to check which albums contain "row" keyword frames
const API_BASE = 'http://localhost:5003';

async function testAlbumMatching() {
    console.log('🔍 Testing album matching for "row" keyword...');

    try {
        // Step 1: Get frame IDs for "row" keyword (ID 70)
        const rowFramesResponse = await fetch(`${API_BASE}/keywords/frames`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                keyword_ids: [70],
                confidence_min: 0,
                confidence_max: 1
            })
        });
        const rowFramesData = await rowFramesResponse.json();
        const rowFrameIds = rowFramesData.values;

        console.log(`📋 "row" keyword has ${rowFrameIds.length} frames:`, rowFrameIds);

        // Step 2: Get all configurations
        const configsResponse = await fetch(`${API_BASE}/clusters/config-ids`);
        const configsData = await configsResponse.json();
        const configIds = configsData.values;

        console.log(`📁 Found ${configIds.length} configurations:`, configIds);

        let totalMatchingAlbums = 0;

        // Step 3: Check each configuration
        for (const configId of configIds) {
            console.log(`\n=== Configuration ${configId} ===`);

            try {
                // Get albums for this config
                const albumsResponse = await fetch(`${API_BASE}/configs/${configId}/cluster-ids`);
                const albumsData = await albumsResponse.json();
                const albumIds = albumsData.values;

                console.log(`📦 Config ${configId} has ${albumIds.length} albums`);

                // Check first 3 albums (for speed)
                for (let i = 0; i < Math.min(3, albumIds.length); i++) {
                    const albumId = albumIds[i];
                    console.log(`\n  🔍 Checking album ${albumId} (${i + 1}/${Math.min(3, albumIds.length)})...`);

                    try {
                        // Get frames for this album
                        const albumFramesResponse = await fetch(`${API_BASE}/clusters/frame-ids`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                cluster_id: albumId,
                                config_id: configId,
                                images_number: 1000,
                                order: 'DESC',
                                redundant: false
                            })
                        });
                        const albumFramesData = await albumFramesResponse.json();
                        const albumFrameIds = albumFramesData.values;

                        // Find matching frames
                        const matchingFrames = albumFrameIds.filter(frameId =>
                            rowFrameIds.includes(frameId)
                        );

                        if (matchingFrames.length > 0) {
                            console.log(`    ✅ MATCH! Album ${albumId} contains ${matchingFrames.length} matching frames:`, matchingFrames);
                            console.log(`    📊 Album has ${albumFrameIds.length} total frames`);
                            totalMatchingAlbums++;
                        } else {
                            console.log(`    ❌ No matches (album has ${albumFrameIds.length} frames)`);
                        }

                    } catch (error) {
                        console.log(`    ⚠️ Error checking album ${albumId}:`, error.message);
                    }
                }

            } catch (error) {
                console.log(`⚠️ Error getting albums for config ${configId}:`, error.message);
            }
        }

        console.log(`\n🎯 SUMMARY: Found ${totalMatchingAlbums} albums with matching frames`);

    } catch (error) {
        console.error('💥 Error:', error);
    }
}

testAlbumMatching();
