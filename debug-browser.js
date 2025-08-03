// Debug script to test the album fetching directly in the browser
// Open browser console and paste this to test album fetching

async function debugAlbumFetching() {
    console.log('🔍 Starting direct album fetching test...');
    
    // Test if we can access the API client
    try {
        // Get keywords to find "row" keyword
        const response = await fetch('/api/keywords');
        const keywords = await response.json();
        const rowKeyword = keywords.find(k => k.Name === 'row');
        console.log('📋 Row keyword:', rowKeyword);
        
        if (!rowKeyword) {
            console.error('❌ Row keyword not found');
            return;
        }
        
        // Get frames for row keyword
        const framesResponse = await fetch('/api/keywords/frames', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                keyword_ids: [rowKeyword.Id],
                confidence_min: 0,
                confidence_max: 1
            })
        });
        const framesData = await framesResponse.json();
        console.log('📋 Frames for row keyword:', framesData);
        
        // Get configurations
        const configsResponse = await fetch('/api/clusters/config-ids');
        const configsData = await configsResponse.json();
        console.log('📁 Configurations:', configsData);
        
        // Test first config and first album
        const configId = configsData.values[0];
        const albumsResponse = await fetch(`/api/configs/${configId}/cluster-ids`);
        const albumsData = await albumsResponse.json();
        console.log(`📦 Albums in config ${configId}:`, albumsData);
        
        // Test first album
        const albumId = albumsData.values[0];
        const albumFramesResponse = await fetch('/api/clusters/frame-ids', {
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
        console.log(`📋 Frames in album ${albumId}:`, albumFramesData);
        
        // Check for matches
        const rowFrameIds = framesData.values;
        const albumFrameIds = albumFramesData.values;
        const matches = albumFrameIds.filter(frameId => rowFrameIds.includes(frameId));
        console.log('🎯 Matching frames:', matches);
        
    } catch (error) {
        console.error('💥 Error in direct test:', error);
    }
}

// Run the test
debugAlbumFetching();
