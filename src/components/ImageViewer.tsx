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
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  open,
  onOpenChange,
  onKeywordDelete,
  onKeywordRename,
  allKeywords
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-card border border-primary/20 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">{image.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Display */}
          <div className="relative bg-muted rounded-lg overflow-hidden shadow-glow">
            <img 
              src={image.url} 
              alt={image.title}
              className="w-full h-auto max-h-[60vh] object-contain"
            />
          </div>

          {/* Keywords Management */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Keywords
              <Badge variant="outline" className="border-primary/30 bg-secondary/50">
                {image.keywords.length}
              </Badge>
            </h3>
            
            <div className="grid gap-2">
              {image.keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gradient-subtle rounded-lg border border-primary/20 group hover:shadow-glow transition-all duration-300"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {editingKeyword === keyword ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 h-7"
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
                          className="h-7 w-7 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleKeywordCancel}
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium text-foreground text-sm">{keyword}</span>
                          <Badge variant="secondary" className="text-xs bg-secondary/50 border border-primary/20">
                            {getKeywordImageCount(keyword)} images
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleKeywordEdit(keyword)}
                            className="h-7 w-7 p-0 hover:bg-primary/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onKeywordDelete(image.id, keyword)}
                            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                            title="Delete keyword"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {image.keywords.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Save className="h-6 w-6 mx-auto mb-2 opacity-50" />
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