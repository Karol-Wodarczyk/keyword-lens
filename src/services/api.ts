// API client for backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API Response Types based on OpenAPI schema
export interface KeywordDto {
  Name: string;
  IsEntity: boolean;
  Id: number;
  Count: number;
}

export interface FrameMetaDataDto {
  Height: number;
  Width: number;
  Timestamp: string;
  Id: number;
  IsValuable: boolean;
  Thumbnail: string;
}

export interface FrameKeywordDataDto {
  KeywordName: string;
  Confidence: number;
  X1: number;
  X2: number;
  Y1: number;
  Y2: number;
  Id: number;
  FrameId: number;
  KeywordId: number;
}

export interface BoundingBoxDto {
  X1: number;
  X2: number;
  Y1: number;
  Y2: number;
}

export interface FrameResponse {
  frame: string; // Base64 encoded image
}

export interface ThumbnailResponse {
  thumbnail: string; // Base64 encoded image thumbnail
}

export interface ListInt64Dto {
  values: number[];
}

export interface FramesForKeywords {
  keyword_ids: number[];
  confidence_min: number;
  confidence_max: number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const apiClient = {
  // Keywords
  async getKeywords(): Promise<KeywordDto[]> {
    return apiRequest<KeywordDto[]>('/keywords');
  },

  async getFrameKeywords(frameId: string): Promise<FrameKeywordDataDto[]> {
    return apiRequest<FrameKeywordDataDto[]>(`/frame/${frameId}/keywords`);
  },

  async getFramesForKeywords(params: FramesForKeywords): Promise<ListInt64Dto> {
    return apiRequest<ListInt64Dto>('/keywords/frames', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Frames
  async getFrameIds(): Promise<ListInt64Dto> {
    return apiRequest<ListInt64Dto>('/frame-ids');
  },

  async getFrame(frameId: string): Promise<FrameResponse> {
    return apiRequest<FrameResponse>(`/frame/${frameId}`);
  },

  async getFrameMetadata(frameId: string): Promise<FrameMetaDataDto> {
    return apiRequest<FrameMetaDataDto>(`/frame/${frameId}/metadata`);
  },

  async getFrameThumbnail(frameId: string): Promise<ThumbnailResponse> {
    return apiRequest<ThumbnailResponse>(`/frame/${frameId}/thumbnail`);
  },

  async getBoundingBoxes(frameId: string, keywordId: string): Promise<BoundingBoxDto[]> {
    return apiRequest<BoundingBoxDto[]>(`/frame/${frameId}/keyword/${keywordId}/bounding-boxes`);
  },

  // Utility function to convert base64 to data URL
  base64ToDataUrl(base64: string, type: 'image' | 'thumbnail' = 'image'): string {
    const mimeType = 'image/jpeg'; // Assuming JPEG, could be made configurable
    return `data:${mimeType};base64,${base64}`;
  }
};