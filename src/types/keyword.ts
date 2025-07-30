export interface Keyword {
  id: string;
  text: string;
  imageCount: number;
  isSelected: boolean;
}

export interface Album {
  id: string;
  name: string;
  imageCount: number;
  thumbnailUrl: string;
  keywords: string[];
}

export interface ImageItem {
  id: string;
  url: string;
  thumbnailUrl: string;
  keywords: string[];
  title: string;
}

export type OccurrenceType = 'high' | 'medium' | 'low';