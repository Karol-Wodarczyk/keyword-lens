// API client for backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

export interface FramesForGroupThumbnail {
  cluster_id: number;
  config_id: number;
  frames_count: number;
}

export interface FramesFromCluster {
  cluster_id: number;
  config_id: number;
  images_number: number;
  order: string;
  redundant: boolean;
}

export interface Int64Dto {
  Value: number; // API returns uppercase V
}

export interface KeywordRename {
  SourceId: number;
  Target: string;
}

export interface PostKeyword {
  action: string;
  name: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  confidence: number;
  is_entity: boolean;
  origin: number;
  id?: number;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`📡 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      throw new ApiError(response.status, `API request failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    console.error(`💥 Network Error:`, error);
    if (error instanceof ApiError) {
      throw error;
    }

    // Check for common CORS/network issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new ApiError(0, `🚫 CORS or Network error: Cannot connect to ${url}. Is the backend server running?`);
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

  // Get frames from a specific cluster/album
  async getFramesFromCluster(params: FramesFromCluster): Promise<ListInt64Dto> {
    return apiRequest<ListInt64Dto>('/clusters/frame-ids', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Configuration and Album methods
  async getConfigIds(): Promise<number[]> {
    const response = await apiRequest<ListInt64Dto>('/clusters/config-ids');
    return response.values;
  },

  async getAlbumIdsForConfig(configId: number): Promise<number[]> {
    const response = await apiRequest<ListInt64Dto>(`/configs/${configId}/cluster-ids`);
    return response.values;
  },

  async getFramesCountForGroupConfig(configId: number, albumId: number): Promise<number> {
    const response = await apiRequest<Int64Dto>(`/configs/${configId}/clusters/${albumId}/frames-count`);
    return response.Value; // Use uppercase V to match API response
  },

  async getFrameIdsForAlbumThumbnail(configId: number, albumId: number, totalFramesCountInAlbum: number): Promise<number[]> {
    const params: FramesForGroupThumbnail = {
      cluster_id: albumId,
      config_id: configId,
      frames_count: totalFramesCountInAlbum
    };

    console.log('🖼️ THUMBNAIL DEBUG: Sending request with params:', params);

    const response = await apiRequest<ListInt64Dto>('/clusters/frame-ids-thumbnail', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.values;
  },

  async getFrameIdsForGroup(configId: number, albumId: number): Promise<number[]> {
    const params: FramesFromCluster = {
      cluster_id: albumId,
      config_id: configId,
      images_number: 1000, // Get a large number to get all frames
      order: 'DESC',
      redundant: false
    };
    const response = await apiRequest<ListInt64Dto>('/clusters/frame-ids', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.values;
  },

  // Keyword operations
  async renameKeywordForFrame(frameId: string, sourceKeywordId: number, targetKeywordName: string): Promise<void> {
    const params: KeywordRename = {
      SourceId: sourceKeywordId,
      Target: targetKeywordName,
    };

    return apiRequest<void>(`/frame/${frameId}/keyword/replace`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async deleteKeywordFromFrame(frameId: string, keywordId: number): Promise<void> {
    const deleteAction: PostKeyword = {
      action: 'delete',
      name: '', // Name not required for delete action
      confidence: 0,
      is_entity: false,
      origin: 0,
      id: keywordId,
    };

    return apiRequest<void>(`/frame/${frameId}/keywords`, {
      method: 'POST',
      body: JSON.stringify([deleteAction]),
    });
  },

  // Utility function to convert base64 to data URL
  base64ToDataUrl(base64: string, type: 'image' | 'thumbnail' = 'image'): string {
    const mimeType = 'image/jpeg'; // Assuming JPEG, could be made configurable
    return `data:${mimeType};base64,${base64}`;
  }
};