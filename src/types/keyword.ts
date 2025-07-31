export interface Keyword {
  id: string;
  text: string;
  imageCount: number;
  isSelected: boolean;
  isHidden: boolean;
}

export interface Album {
  id: string;
  name: string;
  imageCount: number;
  thumbnailUrl: string;
  keywords: string[];
  timestamp: number;
  isSelected?: boolean;
}

export interface ImageItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  keywords: string[];
  title: string;
  albumId?: string;
  timestamp: number;
  isSelected?: boolean;
}

export interface FilterState {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  albumSizeRange: {
    min: number;
    max: number;
  };
  sortBy: 'newest' | 'oldest';
}

export type OccurrenceType = 'high' | 'medium' | 'low';

export interface BulkSelectionState {
  selectedImages: string[];
  selectedAlbums: string[];
}