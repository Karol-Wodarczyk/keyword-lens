import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Images, FolderOpen } from 'lucide-react';
import { Keyword, Album, ImageItem } from '../types/keyword';

interface ImageContentProps {
  selectedKeywords: Keyword[];
  occurrence: string;
}

// Mock data
const mockAlbums: Album[] = [
  {
    id: '1',
    name: 'Summer Landscapes 2024',
    imageCount: 45,
    thumbnailUrl: '/api/placeholder/200/150',
    keywords: ['landscape', 'nature']
  },
  {
    id: '2',
    name: 'Urban Photography',
    imageCount: 32,
    thumbnailUrl: '/api/placeholder/200/150',
    keywords: ['urban', 'street', 'architecture']
  },
  {
    id: '3',
    name: 'Portrait Collection',
    imageCount: 28,
    thumbnailUrl: '/api/placeholder/200/150',
    keywords: ['portrait']
  }
];

const mockImages: ImageItem[] = [
  {
    id: '1',
    url: '/api/placeholder/400/300',
    thumbnailUrl: '/api/placeholder/200/150',
    keywords: ['landscape', 'nature'],
    title: 'Mountain Sunset'
  },
  {
    id: '2',
    url: '/api/placeholder/400/300',
    thumbnailUrl: '/api/placeholder/200/150',
    keywords: ['landscape', 'nature'],
    title: 'Forest Path'
  },
  {
    id: '3',
    url: '/api/placeholder/400/300',
    thumbnailUrl: '/api/placeholder/200/150',
    keywords: ['portrait'],
    title: 'Studio Portrait'
  },
  {
    id: '4',
    url: '/api/placeholder/400/300',
    thumbnailUrl: '/api/placeholder/200/150',
    keywords: ['urban', 'architecture'],
    title: 'City Skyline'
  },
  {
    id: '5',
    url: '/api/placeholder/400/300',
    thumbnailUrl: '/api/placeholder/200/150',
    keywords: ['nature', 'wildlife'],
    title: 'Eagle in Flight'
  },
  {
    id: '6',
    url: '/api/placeholder/400/300',
    thumbnailUrl: '/api/placeholder/200/150',
    keywords: ['street', 'urban'],
    title: 'Street Scene'
  }
];

export const ImageContent: React.FC<ImageContentProps> = ({
  selectedKeywords,
}) => {
  if (selectedKeywords.length === 0) {
    return (
      <Card className="p-12 text-center shadow-card bg-gradient-card">
        <Images className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Keywords Selected
        </h3>
        <p className="text-muted-foreground">
          Select keywords from the filter above to view related albums and images
        </p>
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

  return (
    <div className="space-y-6">
      {selectedKeywords.map((keyword) => {
        const albums = getFilteredAlbums(keyword.text);
        const images = getFilteredImages(keyword.text);

        return (
          <Collapsible key={keyword.id} defaultOpen>
            <CollapsibleTrigger className="w-full">
              <Card className="p-4 shadow-card hover:shadow-hover transition-all duration-300 bg-gradient-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-gradient-primary"></div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Images tagged with "{keyword.text}"
                    </h3>
                    <Badge variant="secondary" className="ml-2">
                      {albums.length + images.length} items
                    </Badge>
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
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
                      <Card key={album.id} className="overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 group cursor-pointer">
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <div className="w-full h-full bg-gradient-subtle flex items-center justify-center">
                            <FolderOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </div>
                        <div className="p-4">
                          <h5 className="font-medium text-foreground mb-2 line-clamp-1">
                            {album.name}
                          </h5>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{album.imageCount} images</span>
                            <div className="flex gap-1">
                              {album.keywords.slice(0, 2).map((kw, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
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
                      <Card key={image.id} className="overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 group cursor-pointer">
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          <div className="w-full h-full bg-gradient-subtle flex items-center justify-center">
                            <Images className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </div>
                        <div className="p-3">
                          <h6 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                            {image.title}
                          </h6>
                          <div className="flex flex-wrap gap-1">
                            {image.keywords.slice(0, 2).map((kw, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
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
                <Card className="p-8 text-center shadow-card bg-gradient-card">
                  <Images className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No albums or images found for "{keyword.text}"
                  </p>
                </Card>
              )}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};