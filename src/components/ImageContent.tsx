import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Images, FolderOpen, Loader2 } from 'lucide-react';
import { Keyword, Album, ImageItem, OccurrenceType } from '../types/keyword';
import { ImageViewer } from './ImageViewer';
import { useFrames } from '../hooks/useFrames';

interface ImageContentProps {
  selectedKeywords: Keyword[];
  occurrence: OccurrenceType;
  keywords: Keyword[];
  onKeywordUpdate: (keywords: Keyword[]) => void;
}

// Mock data for albums (keeping albums as mock for now)
const mockAlbums: Album[] = [
  {
    id: '1',
    name: 'Factory Images',
    imageCount: 45,
    thumbnailUrl: 'https://stlpartnership.com/wp-content/uploads/2024/02/TrueManufacturing_Collage.jpg',
    keywords: ['landscape', 'nature'],
    timestamp: Date.now() - 86400000 * 5 // 5 days ago
  },
  {
    id: '2',
    name: 'Urban Photography',
    imageCount: 32,
    thumbnailUrl: 'https://stlpartnership.com/wp-content/uploads/2024/02/TrueManufacturing_Collage.jpg',
    keywords: ['urban', 'street', 'architecture'],
    timestamp: Date.now() - 86400000 * 10 // 10 days ago
  },
  {
    id: '3',
    name: 'Portrait Collection',
    imageCount: 28,
    thumbnailUrl: 'https://stlpartnership.com/wp-content/uploads/2024/02/TrueManufacturing_Collage.jpg',
    keywords: ['portrait'],
    timestamp: Date.now() - 86400000 * 2 // 2 days ago
  }
];

export const ImageContent: React.FC<ImageContentProps> = ({
  selectedKeywords,
  occurrence,
  keywords,
  onKeywordUpdate,
}) => {
  const [viewerImage, setViewerImage] = useState<ImageItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const { frames, loading, fetchFramesForKeywords, getFrameImage } = useFrames();

  // Filter keywords based on occurrence (imageCount), then fetch frames
  useEffect(() => {
    if (selectedKeywords.length === 0) {
      return;
    }

    // Filter keywords based on occurrence level (imageCount)
    const getOccurrenceRange = (occ: OccurrenceType): [number, number] => {
      switch (occ) {
        case 'high': return [50, Infinity];    // Keywords with 50+ frames
        case 'medium': return [10, 49];        // Keywords with 10-49 frames  
        case 'low': return [1, 9];             // Keywords with 1-9 frames
        default: return [0, Infinity];
      }
    };

    const [minCount, maxCount] = getOccurrenceRange(occurrence);

    // Filter selected keywords by their occurrence (imageCount)
    const filteredKeywords = selectedKeywords.filter(keyword =>
      keyword.imageCount >= minCount && keyword.imageCount <= maxCount
    );

    if (filteredKeywords.length === 0) {
      // Call with empty array to clear frames
      fetchFramesForKeywords([], 0, 1);
      return;
    }

    const filteredKeywordIds = filteredKeywords.map(k => k.id);

    console.log('🔍 Fetching frames with:', {
      occurrence,
      occurrenceRange: [minCount, maxCount],
      originalKeywords: selectedKeywords.map(k => ({ text: k.text, count: k.imageCount })),
      filteredKeywords: filteredKeywords.map(k => ({ text: k.text, count: k.imageCount })),
      filteredKeywordIds
    });

    // Fetch frames without confidence filtering (confidence not used)
    fetchFramesForKeywords(filteredKeywordIds, 0, 1);
  }, [selectedKeywords, occurrence, fetchFramesForKeywords]);

  const handleImageClick = async (image: ImageItem) => {
    try {
      // Load the full image if not already loaded
      if (!image.url) {
        const fullImageUrl = await getFrameImage(image.id);
        image.url = fullImageUrl;
      }
      setViewerImage(image);
      setViewerOpen(true);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
  };

  const handleBackToKeywords = () => {
    setSelectedAlbum(null);
  };

  const handleKeywordHide = (imageId: string, keywordText: string) => {
    // For now, just update local state - would need backend endpoint
    console.log('Hide keyword:', keywordText, 'from image:', imageId);
  };

  const handleKeywordRename = (imageId: string, oldKeyword: string, newKeyword: string) => {
    // For now, just update local state - would need backend endpoint
    console.log('Rename keyword:', oldKeyword, 'to:', newKeyword, 'for image:', imageId);
  };

  const getFilteredAlbums = (keyword: string) => {
    return mockAlbums.filter(album =>
      album.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
    );
  };

  const getAlbumImages = (albumId: string) => {
    // Would need to fetch album images from backend
    return frames.slice(0, 6); // Mock implementation
  };

  // Show loading state
  if (loading && selectedKeywords.length > 0) {
    return (
      <Card className="p-12 text-center shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
        <div className="relative z-10">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Loading Frames...
          </h3>
          <p className="text-muted-foreground">
            Fetching frames from the backend for selected keywords
          </p>
        </div>
      </Card>
    );
  }

  // Show empty state when no keywords selected
  if (selectedKeywords.length === 0) {
    return (
      <Card className="p-12 text-center shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
        <div className="relative z-10">
          <Images className="h-16 w-16 text-primary mx-auto mb-4 animate-glow-pulse" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Keywords Selected
          </h3>
          <p className="text-muted-foreground">
            Select keywords from the filter above to view related frames and albums
          </p>
        </div>
      </Card>
    );
  }

  // Show no results state
  if (frames.length === 0 && selectedKeywords.length > 0 && !loading) {
    return (
      <Card className="p-12 text-center shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
        <div className="relative z-10">
          <Images className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Frames Found
          </h3>
          <p className="text-muted-foreground">
            No frames found for keywords with the current occurrence level ({occurrence}).
            Try adjusting the occurrence level or selecting keywords with different frame counts.
          </p>
        </div>
      </Card>
    );
  }

  // If an album is selected, show album view
  if (selectedAlbum) {
    const albumImages = getAlbumImages(selectedAlbum.id);

    return (
      <div className="space-y-6">
        {/* Album Header */}
        <Card className="p-6 shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToKeywords}
                  className="hover:bg-primary/10"
                >
                  ← Back to Keywords
                </Button>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedAlbum.name}</h2>
                  <p className="text-muted-foreground">{albumImages.length} images</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {selectedAlbum.keywords.map((keyword, idx) => (
                <Badge key={idx} variant="secondary" className="bg-secondary/80 backdrop-blur-sm border border-primary/20">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Album Images Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {albumImages.map((image) => (
            <Card
              key={image.id}
              className="overflow-hidden shadow-glow hover:shadow-hover transition-glow group cursor-pointer bg-gradient-card border border-primary/20 backdrop-blur-sm relative"
              onClick={() => handleImageClick(image)}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img
                  src={image.thumbnailUrl}
                  alt={image.title}
                  className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-3 relative z-10">
                <h6 className="text-sm font-medium text-foreground mb-1 line-clamp-1 group-hover:text-primary-glow transition-colors duration-300">
                  {image.title}
                </h6>
                <div className="flex flex-wrap gap-1">
                  {image.keywords.slice(0, 2).map((kw, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-primary/30 bg-secondary/50 backdrop-blur-sm">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Image Viewer Dialog */}
        <ImageViewer
          image={viewerImage}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          onKeywordHide={handleKeywordHide}
          onKeywordRename={handleKeywordRename}
          allKeywords={keywords}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedKeywords.map((keyword) => {
        const albums = getFilteredAlbums(keyword.text);
        
        // The frames array already contains frames that match the selected keywords
        // No need to filter again since fetchFramesForKeywords already did the filtering
        const keywordFrames = frames;
        
        console.log(`🖼️ Displaying frames for keyword "${keyword.text}":`, {
          totalFramesFromAPI: frames.length,
          keywordFramesCount: keywordFrames.length,
          albumsCount: albums.length
        });

        return (
          <Collapsible key={keyword.id} defaultOpen>
            <CollapsibleTrigger className="w-full">
              <Card className="p-4 shadow-glow hover:shadow-hover transition-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-gradient-primary shadow-glow animate-glow-pulse"></div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Frames tagged with "{keyword.text}"
                    </h3>
                    <Badge variant="secondary" className="ml-2 bg-secondary/80 backdrop-blur-sm border border-primary/20">
                      {albums.length + keywordFrames.length} items
                    </Badge>
                  </div>
                  <ChevronDown className="h-5 w-5 text-primary transition-all duration-300 data-[state=open]:rotate-180 group-hover:text-primary-glow" />
                </div>
              </Card>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 mt-4">
              {/* Albums Section */}
              {albums.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-foreground">Albums</h4>
                    <Badge variant="outline">{albums.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {albums.map((album) => (
                      <Card
                        key={album.id}
                        className="overflow-hidden shadow-glow hover:shadow-hover transition-glow group cursor-pointer bg-gradient-card border border-primary/20 backdrop-blur-sm relative"
                        onClick={() => handleAlbumClick(album)}
                      >
                        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <img
                            src={album.thumbnailUrl}
                            alt={album.name}
                            className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-4 relative z-10">
                          <h5 className="font-medium text-foreground mb-2 line-clamp-1 group-hover:text-primary-glow transition-colors duration-300">
                            {album.name}
                          </h5>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{album.imageCount} images</span>
                            <div className="flex gap-1">
                              {album.keywords.slice(0, 2).map((kw, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-primary/30 bg-secondary/50 backdrop-blur-sm">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Frames Section */}
              {keywordFrames.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Images className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-foreground">Frames</h4>
                    <Badge variant="outline">{keywordFrames.length}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {keywordFrames.map((image) => (
                      <Card
                        key={image.id}
                        className="overflow-hidden shadow-glow hover:shadow-hover transition-glow group cursor-pointer bg-gradient-card border border-primary/20 backdrop-blur-sm relative"
                        onClick={() => handleImageClick(image)}
                      >
                        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          <img
                            src={image.thumbnailUrl}
                            alt={image.title}
                            className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-3 relative z-10">
                          <h6 className="text-sm font-medium text-foreground mb-1 line-clamp-1 group-hover:text-primary-glow transition-colors duration-300">
                            {image.title}
                          </h6>
                          <div className="flex flex-wrap gap-1">
                            {image.keywords.slice(0, 2).map((kw, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-primary/30 bg-secondary/50 backdrop-blur-sm">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {/* Image Viewer Dialog */}
      <ImageViewer
        image={viewerImage}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onKeywordHide={handleKeywordHide}
        onKeywordRename={handleKeywordRename}
        allKeywords={keywords}
      />
    </div>
  );
};
