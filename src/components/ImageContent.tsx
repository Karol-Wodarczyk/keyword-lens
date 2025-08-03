import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Images, FolderOpen, Loader2 } from 'lucide-react';
import { Keyword, Album, ImageItem, OccurrenceType } from '../types/keyword';
import { ImageViewer } from './ImageViewer';
import { useFrames } from '../hooks/useFrames';
import { useAlbums } from '../hooks/useAlbums';
import { apiClient } from '../services/apiConfig';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';

interface ImageContentProps {
  selectedKeywords: Keyword[];
  occurrence: OccurrenceType;
  keywords: Keyword[];
  onKeywordUpdate: (keywords: Keyword[]) => void;
}

export const ImageContent: React.FC<ImageContentProps> = ({
  selectedKeywords,
  occurrence,
  keywords,
  onKeywordUpdate,
}) => {
  const [viewerImage, setViewerImage] = useState<ImageItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerKeywordContext, setViewerKeywordContext] = useState<Keyword | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const { frames, loading, fetchFramesForKeywords, fetchFramesFromCluster, getFrameImage } = useFrames();
  const { albums, loading: albumsLoading, fetchAlbumsForKeywords, getAlbumFrames } = useAlbums();
  const { toast } = useToast();

  // Fetch frames for selected keywords
  useEffect(() => {
    if (selectedKeywords.length === 0) {
      return;
    }

    const filteredKeywordIds = selectedKeywords.map(k => k.id);

    console.log('🔍 Fetching frames for selected keywords:', {
      selectedKeywords: selectedKeywords.map(k => ({ text: k.text, count: k.imageCount, id: k.id })),
      filteredKeywordIds
    });

    console.log('🔍 SPECIFIC DEBUG: Is row keyword selected?', selectedKeywords.find(k => k.text === 'row'));

    // Fetch frames without confidence filtering (confidence not used)
    fetchFramesForKeywords(filteredKeywordIds, 0, 1);
  }, [selectedKeywords, fetchFramesForKeywords]);

  // Fetch albums when frames are loaded
  useEffect(() => {
    if (frames.length > 0) {
      const frameIds = frames.map(frame => parseInt(frame.id, 10));
      console.log('📁 IMAGECONTENTDEBUG: Fetching albums for frame IDs:', frameIds.slice(0, 10), '... (total:', frameIds.length, ')');
      console.log('📁 IMAGECONTENTDEBUG: Full frame IDs list:', frameIds);
      fetchAlbumsForKeywords(frameIds);
    } else {
      console.log('📁 IMAGECONTENTDEBUG: No frames available for albums');
    }
  }, [frames, fetchAlbumsForKeywords]);

  // Debug albums state
  useEffect(() => {
    console.log('🎯 ALBUMS STATE DEBUG:', { 
      albumsLength: albums.length, 
      albumsLoading, 
      albums: albums.slice(0, 2),
      selectedKeywords: selectedKeywords.map(k => k.text),
      framesLength: frames.length
    });
  }, [albums, albumsLoading, selectedKeywords, frames]);

  const handleImageClick = async (image: ImageItem, keywordContext?: Keyword) => {
    try {
      // Load the full image if not already loaded
      if (!image.url) {
        const fullImageUrl = await getFrameImage(image.id);
        image.url = fullImageUrl;
      }
      setViewerImage(image);
      setViewerKeywordContext(keywordContext || null);
      setViewerOpen(true);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  const handleAlbumClick = async (album: Album) => {
    setSelectedAlbum(album);
    // Fetch frames from the selected album/cluster
    const clusterId = parseInt(album.id, 10);
    await fetchFramesFromCluster(clusterId);
  };

  const handleBackToKeywords = () => {
    setSelectedAlbum(null);
  };

  const handleViewerClose = (open: boolean) => {
    setViewerOpen(open);
    if (!open) {
      setViewerKeywordContext(null);
    }
  };

  const { updateFrameKeywords } = useFrames();

  const handleKeywordDelete = async (imageId: string, keywordText: string) => {
    try {
      // Find the keyword ID from the global keywords list
      const keyword = keywords.find(k => k.text.toLowerCase() === keywordText.toLowerCase());
      if (!keyword) {
        console.error('Keyword not found:', keywordText);
        return;
      }

      // Call the API to delete the keyword from this frame
      await apiClient.deleteKeywordFromFrame(imageId, parseInt(keyword.id));

      // Update the frame's keywords in the local state
      await updateFrameKeywords(imageId);

      toast({
        title: "Keyword Deleted",
        description: `Successfully removed "${keywordText}" from the image.`,
      });

      console.log('Successfully deleted keyword:', keywordText, 'from image:', imageId);
    } catch (error) {
      console.error('Failed to delete keyword:', error);
      toast({
        title: "Error",
        description: `Failed to delete keyword: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleKeywordRename = async (imageId: string, oldKeyword: string, newKeyword: string) => {
    try {
      // Find the keyword ID from the global keywords list
      const keyword = keywords.find(k => k.text.toLowerCase() === oldKeyword.toLowerCase());
      if (!keyword) {
        console.error('Keyword not found:', oldKeyword);
        return;
      }

      // Call the API to rename the keyword for this frame
      await apiClient.renameKeywordForFrame(imageId, parseInt(keyword.id), newKeyword);

      // Update the frame's keywords in the local state
      await updateFrameKeywords(imageId);

      toast({
        title: "Keyword Renamed",
        description: `Successfully renamed "${oldKeyword}" to "${newKeyword}".`,
      });

      console.log('Successfully renamed keyword:', oldKeyword, 'to:', newKeyword, 'for image:', imageId);
    } catch (error) {
      console.error('Failed to rename keyword:', error);
      toast({
        title: "Error",
        description: `Failed to rename keyword: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const getFilteredAlbums = (keyword: string) => {
    // Instead of filtering by album keywords, we should show all albums
    // since they were already filtered during fetchAlbumsForKeywords to contain
    // frames that match the selected keywords (including this keyword)
    
    console.log(`📁 Showing albums for keyword "${keyword}":`, {
      totalAlbums: albums.length,
      albums: albums.map(a => ({ id: a.id, name: a.name, keywords: a.keywords }))
    });
    
    // Return all albums since they already contain matching frames
    return albums;
  };

  const getAlbumImages = (albumId: string) => {
    // Would need to fetch album images from backend
    return frames.slice(0, 6); // Mock implementation
  };

  // Show loading state
  if ((loading || albumsLoading) && selectedKeywords.length > 0) {
    return (
      <Card className="p-12 text-center shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
        <div className="relative z-10">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Loading {loading ? 'Frames' : 'Albums'}...
          </h3>
          <p className="text-muted-foreground">
            {loading ? 'Fetching frames from the backend for selected keywords' : 'Fetching albums that contain matching frames'}
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
                <div className="text-xs text-muted-foreground mb-1">
                  ID: {image.id}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(image.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Image Viewer Dialog */}
        <ImageViewer
          image={viewerImage}
          open={viewerOpen}
          onOpenChange={handleViewerClose}
          onKeywordDelete={handleKeywordDelete}
          onKeywordRename={handleKeywordRename}
          allKeywords={keywords}
          selectedKeywords={viewerKeywordContext ? [viewerKeywordContext] : selectedKeywords}
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
              {/* Two-column layout: Albums (30%) + Images (70%) */}
              <div className="flex gap-6 min-h-[400px]">
                {/* Albums Section - 30% width */}
                <div className="w-[30%] space-y-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-foreground">Albums</h4>
                    <Badge variant="outline">{albums.length}</Badge>
                  </div>

                  {albums.length > 0 ? (
                    <div className="space-y-3">
                      {albums.map((album) => (
                        <Card
                          key={album.id}
                          className="overflow-hidden shadow-glow hover:shadow-hover transition-glow group cursor-pointer bg-gradient-card border border-primary/20 backdrop-blur-sm relative"
                          onClick={() => handleAlbumClick(album)}
                        >
                          <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            {/* 2x2 Thumbnail Grid */}
                            <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 p-0.5">
                              {album.thumbnailUrls.slice(0, 4).map((thumbnailUrl, idx) => (
                                <div key={idx} className="overflow-hidden rounded-sm">
                                  <img
                                    src={thumbnailUrl}
                                    alt={`${album.name} thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              ))}
                              {/* Fill remaining spaces if less than 4 thumbnails */}
                              {Array.from({ length: Math.max(0, 4 - album.thumbnailUrls.length) }).map((_, idx) => (
                                <div key={`placeholder-${idx}`} className="bg-muted-foreground/20 rounded-sm"></div>
                              ))}
                            </div>
                            <div className="absolute inset-0 bg-gradient-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="p-3 relative z-10">
                            <h5 className="font-medium text-foreground mb-1 line-clamp-1 group-hover:text-primary-glow transition-colors duration-300 text-sm">
                              {album.name}
                            </h5>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{album.imageCount} images</span>
                              <div className="flex gap-1">
                                {album.keywords.slice(0, 1).map((kw, idx) => (
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
                  ) : (
                    <Card className="p-6 text-center bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
                      <div className="relative z-10">
                        <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No albums found for this keyword</p>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Images Section - 70% width */}
                <div className="w-[70%] space-y-4">
                  <div className="flex items-center gap-2">
                    <Images className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-foreground">Images</h4>
                    <Badge variant="outline">{keywordFrames.length}</Badge>
                  </div>

                  {keywordFrames.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {keywordFrames.map((image) => (
                        <Card
                          key={image.id}
                          className="overflow-hidden shadow-glow hover:shadow-hover transition-glow group cursor-pointer bg-gradient-card border border-primary/20 backdrop-blur-sm relative"
                          onClick={() => handleImageClick(image, keyword)}
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
                            <div className="text-xs text-muted-foreground mb-1">
                              ID: {image.id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(image.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
                      <div className="relative z-10">
                        <Images className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h5 className="font-medium text-foreground mb-1">No images found</h5>
                        <p className="text-sm text-muted-foreground">No frames found for this keyword</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {/* Image Viewer Dialog */}
      <ImageViewer
        image={viewerImage}
        open={viewerOpen}
        onOpenChange={handleViewerClose}
        onKeywordDelete={handleKeywordDelete}
        onKeywordRename={handleKeywordRename}
        allKeywords={keywords}
        selectedKeywords={viewerKeywordContext ? [viewerKeywordContext] : selectedKeywords}
      />
    </div>
  );
};
