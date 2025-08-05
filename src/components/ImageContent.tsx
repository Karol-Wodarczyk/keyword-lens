import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  // Pagination states
  const [currentAlbumPage, setCurrentAlbumPage] = useState(1);
  const [currentImagePage, setCurrentImagePage] = useState(1);
  const albumsPerPage = 2;
  const imagesPerPage = 9;

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
      // DISABLED FOR DEBUGGING - focusing only on frames
      // const frameIds = frames.map(frame => parseInt(frame.id, 10));
      // console.log('📁 IMAGECONTENTDEBUG: Fetching albums for frame IDs:', frameIds.slice(0, 10), '... (total:', frameIds.length, ')');
      // console.log('📁 IMAGECONTENTDEBUG: Full frame IDs list:', frameIds);
      // fetchAlbumsForKeywords(frameIds);
    } else {
      // console.log('📁 IMAGECONTENTDEBUG: No frames available for albums');
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
    <div className="space-y-3">
      {selectedKeywords.map((keyword) => {
        const albums = getFilteredAlbums(keyword.text);

        // The frames array already contains frames that match the selected keywords
        // No need to filter again since fetchFramesForKeywords already did the filtering
        const keywordFrames = frames;

        // Pagination calculations
        const totalAlbumPages = Math.ceil(albums.length / albumsPerPage);
        const totalImagePages = Math.ceil(keywordFrames.length / imagesPerPage);

        const albumStartIndex = (currentAlbumPage - 1) * albumsPerPage;
        const albumEndIndex = albumStartIndex + albumsPerPage;
        const currentAlbums = albums.slice(albumStartIndex, albumEndIndex);

        const imageStartIndex = (currentImagePage - 1) * imagesPerPage;
        const imageEndIndex = imageStartIndex + imagesPerPage;
        const currentImages = keywordFrames.slice(imageStartIndex, imageEndIndex);

        console.log(`🖼️ Displaying frames for keyword "${keyword.text}":`, {
          totalFramesFromAPI: frames.length,
          framesState: frames.map(f => f.id),
          keywordFramesCount: keywordFrames.length,
          albumsCount: albums.length,
          currentAlbumsCount: currentAlbums.length,
          currentImagesCount: currentImages.length,
          pagination: {
            albumPage: `${currentAlbumPage}/${totalAlbumPages}`,
            imagePage: `${currentImagePage}/${totalImagePages}`
          }
        });

        return (
          <Collapsible key={keyword.id} defaultOpen>
            <CollapsibleTrigger className="w-full">
              <Card className="p-3 shadow-glow hover:shadow-hover transition-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gradient-primary shadow-glow animate-glow-pulse"></div>
                    <h3 className="text-base font-semibold text-foreground">
                      Frames tagged with "{keyword.text}"
                    </h3>
                    <Badge variant="secondary" className="ml-2 bg-secondary/80 backdrop-blur-sm border border-primary/20 text-xs">
                      {albums.length + keywordFrames.length} items
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-primary transition-all duration-300 data-[state=open]:rotate-180 group-hover:text-primary-glow" />
                </div>
              </Card>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-2 border border-primary/20 border-t-0 rounded-b-lg rounded-t-none p-4 bg-gradient-card/30 backdrop-blur-sm">
              {/* Two-column layout: Albums (30%) + Images (70%) with vertical divider */}
              <div className="flex gap-6 min-h-[600px]">
                {/* Albums Section - 30% width */}
                <div className="w-[30%] flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-foreground text-sm">Albums</h4>
                    <Badge variant="outline" className="text-xs">{albums.length}</Badge>
                  </div>

                  {albums.length > 0 ? (
                    <>
                      <div className="space-y-3 flex-1 py-2">
                        {currentAlbums.map((album) => (
                          <Card
                            key={album.id}
                            className="overflow-hidden shadow-glow hover:shadow-hover transition-glow group cursor-pointer bg-gradient-card border border-primary/20 backdrop-blur-sm relative"
                            onClick={() => handleAlbumClick(album)}
                          >
                            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
                            <div className="aspect-[2/1] bg-muted relative overflow-hidden">
                              {/* 2x2 Thumbnail Grid */}
                              <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-1">
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
                            <div className="p-2 relative z-10">
                              <div className="text-xs text-muted-foreground truncate">
                                {album.name} • {album.imageCount}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      {albums.length > albumsPerPage && (
                        <div className="flex justify-center mt-1 w-full">
                          <div className="flex items-center gap-1 text-xs">
                            <button
                              onClick={() => setCurrentAlbumPage(Math.max(1, currentAlbumPage - 1))}
                              disabled={currentAlbumPage === 1}
                              className="h-6 w-6 flex items-center justify-center rounded border border-primary/20 bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ‹
                            </button>
                            <span className="px-2 text-muted-foreground">
                              {currentAlbumPage} / {totalAlbumPages}
                            </span>
                            <button
                              onClick={() => setCurrentAlbumPage(Math.min(totalAlbumPages, currentAlbumPage + 1))}
                              disabled={currentAlbumPage === totalAlbumPages}
                              className="h-6 w-6 flex items-center justify-center rounded border border-primary/20 bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ›
                            </button>
                          </div>
                        </div>
                      )}
                    </>
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

                {/* Vertical Divider */}
                <div className="w-px bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 mx-4"></div>

                {/* Images Section - 70% width */}
                <div className="w-[70%] flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Images className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-foreground text-sm">Images</h4>
                    <Badge variant="outline" className="text-xs">{keywordFrames.length}</Badge>
                  </div>

                  {keywordFrames.length > 0 ? (
                    <div className="flex flex-col h-full">
                      {/* Increased height grid container with better spacing for 3 rows */}
                      <div className="h-[550px] flex-shrink-0 overflow-hidden">
                        <div className="grid grid-cols-3 gap-4 h-full" style={{ gridTemplateRows: 'repeat(3, 1fr)' }}>
                          {currentImages.map((image) => (
                            <Card
                              key={image.id}
                              className="overflow-hidden shadow-glow hover:shadow-hover transition-glow group cursor-pointer bg-gradient-card border border-primary/20 backdrop-blur-sm relative flex flex-col"
                              onClick={() => handleImageClick(image, keyword)}
                            >
                              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
                              <div className="flex-1 bg-muted relative overflow-hidden">
                                <img
                                  src={image.thumbnailUrl}
                                  alt={image.title}
                                  className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                              <div className="px-2 py-2 relative z-10 flex-shrink-0 bg-gradient-card/95">
                                <div className="text-xs text-center leading-relaxed">
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="font-medium text-foreground">ID: {image.id}</span>
                                    <span className="text-muted-foreground/90">{format(new Date(image.timestamp), 'MM/dd HH:mm')}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                      {/* Fixed position pagination */}
                      <div className="flex justify-center mt-2 py-1 flex-shrink-0">
                        {keywordFrames.length > imagesPerPage && (
                          <Pagination>
                            <PaginationContent className="gap-1">
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => setCurrentImagePage(Math.max(1, currentImagePage - 1))}
                                  className={`h-8 px-2 text-xs ${currentImagePage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                                />
                              </PaginationItem>
                              {Array.from({ length: totalImagePages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => setCurrentImagePage(page)}
                                    isActive={currentImagePage === page}
                                    className="h-8 w-8 text-xs cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => setCurrentImagePage(Math.min(totalImagePages, currentImagePage + 1))}
                                  className={`h-8 px-2 text-xs ${currentImagePage === totalImagePages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <Card className="p-8 text-center bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
                        <div className="relative z-10">
                          <Images className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <h5 className="font-medium text-foreground mb-1">No images found</h5>
                          <p className="text-sm text-muted-foreground">No frames found for this keyword</p>
                        </div>
                      </Card>
                    </div>
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
