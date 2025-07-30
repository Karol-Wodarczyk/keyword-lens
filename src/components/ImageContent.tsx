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
                       <Card key={album.id} className="overflow-hidden shadow-glow hover:shadow-hover transition-glow group cursor-pointer bg-gradient-card border border-primary/20 backdrop-blur-sm relative">
                         <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
                         <div className="aspect-video bg-muted relative overflow-hidden">
                           <div className="w-full h-full bg-gradient-subtle flex items-center justify-center relative z-10">
                             <FolderOpen className="h-8 w-8 text-primary group-hover:text-primary-glow transition-colors duration-300" />
                           </div>
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
                       <Card key={image.id} className="overflow-hidden shadow-glow hover:shadow-hover transition-glow group cursor-pointer bg-gradient-card border border-primary/20 backdrop-blur-sm relative">
                         <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
                         <div className="aspect-square bg-muted relative overflow-hidden">
                           <div className="w-full h-full bg-gradient-subtle flex items-center justify-center relative z-10">
                             <Images className="h-6 w-6 text-primary group-hover:text-primary-glow transition-colors duration-300" />
                           </div>
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
    </div>
  );
};