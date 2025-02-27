/**
 * Client for interacting with the Overseerr API
 * @see https://api-docs.overseerr.dev/
 */

// Type definitions for API responses
interface MediaResult {
  id: number;
  mediaType: 'movie' | 'tv';
  tmdbId?: number;
  tvdbId?: number;
  status?: string;
  title?: string;
  name?: string;
  originalTitle?: string;
  originalName?: string;
  releaseDate?: string;
  firstAirDate?: string;
  year?: number;
  voteAverage?: number;
  popularity?: number;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  mediaInfo?: any;
  serviceUrl?: string;
  serviceId?: number;
  // Added for enhanced responses
  posterUrl?: string | null;
  backdropUrl?: string | null;
}

interface SearchResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: MediaResult[];
}

interface MediaDetails extends MediaResult {
  // Additional fields specific to detailed responses
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  video?: boolean;
  credits?: any;
  videos?: any;
  keywords?: any;
  // These are added by our client
  posterUrl?: string | null;
  backdropUrl?: string | null;
}

interface ImageObject {
  filePath: string;
  height: number;
  width: number;
  aspectRatio: number;
  language?: string;
  voteAverage?: number;
  // Added by our client
  url?: string | null;
}

interface MediaImages {
  backdrops: ImageObject[];
  posters: ImageObject[];
  logos?: ImageObject[];
}

interface RequestResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Array<{
    id: number;
    status: string;
    media: MediaResult;
    createdAt: string;
    updatedAt: string;
    type: 'movie' | 'tv';
    is4k: boolean;
    serverId?: number;
    profileId?: number;
    rootFolder?: string;
    languageProfileId?: number;
    tags?: number[];
    requestedBy?: any;
    modifiedBy?: any;
    seasons?: any[];
  }>;
}

interface UserInfo {
  id: number;
  email: string;
  username?: string;
  permissions: number;
  avatar?: string;
}

export class OverseerrClient {
  private baseUrl: string;
  private apiKey: string;

  /**
   * Creates a new Overseerr API client
   * @param baseUrl - The base URL of your Overseerr instance (e.g., "http://localhost:5055")
   * @param apiKey - Your Overseerr API key
   */
  constructor(baseUrl: string, apiKey: string) {
    // Ensure the base URL doesn't end with a slash
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Makes an authenticated request to the Overseerr API
   * @param endpoint - API endpoint path
   * @param method - HTTP method
   * @param body - Optional request body
   * @returns Response data
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Overseerr API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Overseerr API request failed: ${error.message}`);
      }
      throw new Error('Overseerr API request failed with unknown error');
    }
  }

  /**
   * Get a full URL for a media image from Overseerr's image proxy
   * @param path - The image path
   * @param type - Type of image (poster or backdrop)
   * @returns Full URL to the image from Overseerr
   */
  private getOverseerrImageUrl(path: string | null | undefined, type: 'poster' | 'backdrop'): string | null {
    if (!path) return null;
    return `${this.baseUrl}/api/v1/image?img=${encodeURIComponent(path)}&i=${type}`;
  }

  /**
   * Search for media on Overseerr
   * @param query - Search query
   * @param page - Page number for results (default: 1)
   * @returns Search results with image URLs
   */
  async search(query: string, page = 1): Promise<SearchResponse> {
    const results = await this.request<SearchResponse>(`/search?query=${encodeURIComponent(query)}&page=${page}`);
    
    // Enhance results with direct image URLs
    if (results.results) {
      results.results = results.results.map((item) => ({
        ...item,
        // Add URLs that point to Overseerr's proxy of the images
        posterUrl: this.getOverseerrImageUrl(item.posterPath, 'poster'),
        backdropUrl: this.getOverseerrImageUrl(item.backdropPath, 'backdrop')
      }));
    }
    
    return results;
  }

  /**
   * Get details about a specific media item
   * @param mediaType - Type of media ('movie' or 'tv')
   * @param tmdbId - The TMDB ID of the media
   * @returns Media details with image URLs
   */
  async getMediaDetails(mediaType: 'movie' | 'tv', tmdbId: number): Promise<MediaDetails> {
    const details = await this.request<MediaDetails>(`/${mediaType}/${tmdbId}`);
    
    // Enhance with direct image URLs
    return {
      ...details,
      posterUrl: this.getOverseerrImageUrl(details.posterPath, 'poster'),
      backdropUrl: this.getOverseerrImageUrl(details.backdropPath, 'backdrop')
    };
  }

  /**
   * Get images for a specific media item
   * @param mediaType - Type of media ('movie' or 'tv')
   * @param tmdbId - The TMDB ID of the media
   * @returns All available images for the media
   */
  async getMediaImages(mediaType: 'movie' | 'tv', tmdbId: number): Promise<MediaImages> {
    const images = await this.request<MediaImages>(`/${mediaType}/${tmdbId}/images`);
    
    // Process and enhance image URLs using Overseerr's image proxy
    if (images.backdrops) {
      images.backdrops = images.backdrops.map((backdrop) => ({
        ...backdrop,
        url: this.getOverseerrImageUrl(backdrop.filePath, 'backdrop')
      }));
    }
    
    if (images.posters) {
      images.posters = images.posters.map((poster) => ({
        ...poster,
        url: this.getOverseerrImageUrl(poster.filePath, 'poster')
      }));
    }
    
    return images;
  }

  /**
   * Request a media item
   * @param mediaType - Type of media ('movie' or 'tv')
   * @param tmdbId - The TMDB ID of the media
   * @param options - Request options
   * @returns Request result
   */
  async requestMedia(
    mediaType: 'movie' | 'tv',
    tmdbId: number, 
    options: {
      seasons?: number[];
      is4k?: boolean;
    } = {}
  ): Promise<any> {
    return this.request(
      `/request`,
      'POST',
      {
        mediaType,
        mediaId: tmdbId,
        seasons: options.seasons,
        is4k: options.is4k ?? false
      }
    );
  }

  /**
   * Get all pending requests
   * @param page - Page number (default: 1)
   * @param filter - Filter by request status
   * @returns List of requests with image URLs
   */
  async getRequests(
    page = 1,
    filter: 'all' | 'pending' | 'approved' | 'processing' | 'available' = 'all'
  ): Promise<RequestResponse> {
    const requests = await this.request<RequestResponse>(`/request?page=${page}&filter=${filter}`);
    
    // Enhance with image URLs using Overseerr's image proxy
    if (requests.results) {
      requests.results = requests.results.map((request) => {
        const media = request.media;
        if (media) {
          return {
            ...request,
            media: {
              ...media,
              posterUrl: this.getOverseerrImageUrl(media.posterPath, 'poster'),
              backdropUrl: this.getOverseerrImageUrl(media.backdropPath, 'backdrop')
            }
          };
        }
        return request;
      });
    }
    
    return requests;
  }

  /**
   * Get user info
   * @returns User information
   */
  async getUserInfo(): Promise<UserInfo> {
    return this.request<UserInfo>('/auth/me');
  }
} 