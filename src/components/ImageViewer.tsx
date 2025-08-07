import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Edit2, Trash2, Check, Save } from 'lucide-react';
import { ImageItem, Keyword } from '../types/keyword';

interface ImageViewerProps {
  image: ImageItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeywordDelete: (imageId: string, keywordText: string) => void;
  onKeywordRename: (imageId: string, oldKeyword: string, newKeyword: string) => void;
  allKeywords: Keyword[];
  selectedKeywords: Keyword[];
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  open,
  onOpenChange,
  onKeywordDelete,
  onKeywordRename,
  allKeywords,
  selectedKeywords
}) => {
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!image) return null;

  const handleKeywordEdit = (keyword: string) => {
    setEditingKeyword(keyword);
    setEditValue(keyword);
  };

  const handleKeywordSave = (oldKeyword: string) => {
    if (editValue.trim() && editValue !== oldKeyword) {
      onKeywordRename(image.id, oldKeyword, editValue.trim());
    }
    setEditingKeyword(null);
    setEditValue('');
  };

  const handleKeywordCancel = () => {
    setEditingKeyword(null);
    setEditValue('');
  };

  const getKeywordImageCount = (keywordText: string) => {
    const keyword = allKeywords.find(k => k.text.toLowerCase() === keywordText.toLowerCase());
    return keyword ? keyword.imageCount : 0;
  };

  // Sort keywords to show main/selected keywords first, and deduplicate
  const uniqueKeywords = image ? [...new Set(image.keywords)] : [];
  const sortedKeywords = uniqueKeywords.sort((a, b) => {
    const aIsSelected = selectedKeywords.some(sk => sk.text.toLowerCase() === a.toLowerCase());
    const bIsSelected = selectedKeywords.some(sk => sk.text.toLowerCase() === b.toLowerCase());

    // Selected keywords come first
    if (aIsSelected && !bIsSelected) return -1;
    if (!aIsSelected && bIsSelected) return 1;

    // Within same category, sort alphabetically
    return a.localeCompare(b);
  });

  const isMainKeyword = (keywordText: string) => {
    return selectedKeywords.some(sk => sk.text.toLowerCase() === keywordText.toLowerCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-gradient-card border border-primary/20 backdrop-blur-sm">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-foreground text-lg">{image.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main Keywords Label - Above Image */}
          {selectedKeywords.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Found for keywords:</h3>
              <div className="flex flex-wrap gap-1">
                {selectedKeywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="default"
                    className="bg-primary/20 border-primary/40 text-primary font-medium text-xs"
                  >
                    {keyword.text}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Image Display - Reduced height */}
          <div className="relative bg-muted rounded-lg overflow-hidden shadow-glow">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-auto max-h-[40vh] object-contain"
            />
          </div>

          {/* Keywords Management - Scrollable section */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              All Keywords
              <Badge variant="outline" className="border-primary/30 bg-secondary/50 text-xs">
                {sortedKeywords.length}
              </Badge>
            </h3>

            {/* Scrollable keywords container */}
            <div className="max-h-[25vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {sortedKeywords.map((keyword, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg border group hover:shadow-glow transition-all duration-300 ${isMainKeyword(keyword)
                      ? 'bg-gradient-primary/10 border-primary/40 ring-1 ring-primary/20'
                      : 'bg-gradient-subtle border-primary/20'
                      }`}
                  >
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      {editingKeyword === keyword ? (
                        <div className="flex items-center gap-1 flex-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 h-6 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleKeywordSave(keyword);
                              } else if (e.key === 'Escape') {
                                handleKeywordCancel();
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleKeywordSave(keyword)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleKeywordCancel}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-1 flex-1 min-w-0">
                            <span className={`font-medium text-sm truncate ${isMainKeyword(keyword) ? 'text-primary font-semibold' : 'text-foreground'}`}>
                              {keyword}
                            </span>
                            <Badge
                              variant={isMainKeyword(keyword) ? "default" : "secondary"}
                              className={`text-xs flex-shrink-0 ${isMainKeyword(keyword)
                                ? 'bg-primary/20 border-primary/40 text-primary'
                                : 'bg-secondary/50 border border-primary/20'
                                }`}
                            >
                              {getKeywordImageCount(keyword)}
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleKeywordEdit(keyword)}
                              className="h-5 w-5 p-0 hover:bg-primary/10"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onKeywordDelete(image.id, keyword)}
                              className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                              title="Delete keyword"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {sortedKeywords.length === 0 && (
                <div className="col-span-full text-center py-4 text-muted-foreground">
                  <Save className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No keywords associated with this image</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};