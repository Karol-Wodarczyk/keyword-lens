import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Images, FolderOpen } from 'lucide-react';
import { Keyword, Album, ImageItem } from '../types/keyword';
import { ImageViewer } from './ImageViewer';

interface ImageContentProps {
  selectedKeywords: Keyword[];
  occurrence: string;
  keywords: Keyword[];
  onKeywordUpdate: (keywords: Keyword[]) => void;
}

// Mock data with real image URLs
const mockAlbums: Album[] = [
  {
    id: '1',
    name: 'Summer Landscapes 2024',
    imageCount: 45,
    thumbnailUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=2070&auto=format',
    keywords: ['landscape', 'nature']
  },
  {
    id: '2',
    name: 'Urban Photography',
    imageCount: 32,
    thumbnailUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b58aba04b?q=80&w=2070&auto=format',
    keywords: ['urban', 'street', 'architecture']
  },
  {
    id: '3',
    name: 'Portrait Collection',
    imageCount: 28,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format',
    keywords: ['portrait']
  }
];

const mockImages: ImageItem[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=400&auto=format',
    keywords: ['landscape', 'nature'],
    title: 'Woman with Laptop',
    albumId: '1'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1488590528505-98d2b58aba04b?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b58aba04b?q=80&w=400&auto=format',
    keywords: ['landscape', 'nature'],
    title: 'Gray Laptop Computer',
    albumId: '1'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format',
    keywords: ['portrait'],
    title: 'Circuit Board Macro',
    albumId: '3'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=400&auto=format',
    keywords: ['urban', 'architecture'],
    title: 'Java Programming Monitor',
    albumId: '2'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=400&auto=format',
    keywords: ['nature', 'wildlife'],
    title: 'MacBook Pro User',
    albumId: '1'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format',
    keywords: ['street', 'urban'],
    title: 'Woman with Black Laptop',
    albumId: '2'
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=400&auto=format',
    keywords: ['urban', 'architecture'],
    title: 'White Robot',
    albumId: '2'
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format',
    keywords: ['portrait'],
    title: 'Matrix Movie Still',
    albumId: '3'
  },
  {
    id: '9',
    url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=400&auto=format',
    keywords: ['landscape', 'nature'],
    title: 'Gray and Black Laptop',
    albumId: '1'
  },
  {
    id: '10',
    url: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=2070&auto=format',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=400&auto=format',
    keywords: ['street', 'urban'],
    title: 'Colorful Code Monitor',
    albumId: '2'
  }
];

export const ImageContent: React.FC<ImageContentProps> = ({
  selectedKeywords,
  keywords,
  onKeywordUpdate,
}) => {
  const [viewerImage, setViewerImage] = useState<ImageItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const handleImageClick = (image: ImageItem) => {
    setViewerImage(image);
    setViewerOpen(true);
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
  };

  const handleBackToKeywords = () => {
    setSelectedAlbum(null);
  };


  const handleKeywordHide = (imageId: string, keywordText: string) => {
    // Remove keyword from the specific image
    const imageIndex = mockImages.findIndex(img => img.id === imageId);
    if (imageIndex !== -1) {
      mockImages[imageIndex].keywords = mockImages[imageIndex].keywords.filter(k => k !== keywordText);
    }
    
    // Update keyword count in keywords list
    const updatedKeywords = keywords.map(keyword => {
      if (keyword.text === keywordText) {
        return { ...keyword, imageCount: Math.max(0, keyword.imageCount - 1) };
      }
      return keyword;
    });
    onKeywordUpdate(updatedKeywords);
  };

  const handleKeywordRename = (imageId: string, oldKeyword: string, newKeyword: string) => {
    // Update keyword in the specific image
    const imageIndex = mockImages.findIndex(img => img.id === imageId);
    if (imageIndex !== -1) {
      const keywordIndex = mockImages[imageIndex].keywords.findIndex(k => k === oldKeyword);
      if (keywordIndex !== -1) {
        mockImages[imageIndex].keywords[keywordIndex] = newKeyword;
      }
    }
    
    // Update keywords list
    const updatedKeywords = keywords.map(keyword => {
      if (keyword.text === oldKeyword) {
        return { ...keyword, text: newKeyword };
      }
      return keyword;
    });
    onKeywordUpdate(updatedKeywords);
    
    // Update viewer image if it's currently displayed
    if (viewerImage && viewerImage.id === imageId) {
      const updatedViewerImage = {
        ...viewerImage,
        keywords: viewerImage.keywords.map(k => k === oldKeyword ? newKeyword : k)
      };
      setViewerImage(updatedViewerImage);
    }
  };
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
            Select keywords from the filter above to view related albums and images
          </p>
        </div>
      </Card>
    );
  }

  const getFilteredAlbums = (keyword: string) => {
    return mockAlbums.filter(album => 
      album.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
    );
  };

  const getFilteredImages = (keyword: string) => {
    return mockImages.filter(image => 
      image.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
    );
  };

  const getAlbumImages = (albumId: string) => {
    return mockImages.filter(image => image.albumId === albumId);
  };

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
        const images = getFilteredImages(keyword.text);

        return (
          <Collapsible key={keyword.id} defaultOpen>
            <CollapsibleTrigger className="w-full">
              <Card className="p-4 shadow-glow hover:shadow-hover transition-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-gradient-primary shadow-glow animate-glow-pulse"></div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Images tagged with "{keyword.text}"
                    </h3>
                    <Badge variant="secondary" className="ml-2 bg-secondary/80 backdrop-blur-sm border border-primary/20">
                      {albums.length + images.length} items
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

              {/* Individual Images Section */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Images className="h-5 w-5 text-primary" />
                    <h4 className="font-medium text-foreground">Individual Images</h4>
                    <Badge variant="outline">{images.length}</Badge>
                  </div>
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                     {images.map((image) => (
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

               {albums.length === 0 && images.length === 0 && (
                 <Card className="p-8 text-center shadow-glow bg-gradient-card border border-primary/20 backdrop-blur-sm relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
                   <div className="relative z-10">
                     <Images className="h-12 w-12 text-primary mx-auto mb-3 animate-glow-pulse" />
                     <p className="text-muted-foreground">
                       No albums or images found for "{keyword.text}"
                     </p>
                   </div>
                 </Card>
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