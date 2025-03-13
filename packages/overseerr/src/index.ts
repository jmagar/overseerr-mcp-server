import { config } from '@overseerr-mcp/config';
import { ServiceError } from '@overseerr-mcp/shared';
import { z } from 'zod';

export interface OverseerrConfig {
  url: string;
  apiKey: string;
}

export interface SearchResult {
  id: number;
  mediaType: 'movie' | 'tv' | 'person';
  title: string;
  overview: string;
  posterPath?: string;
  releaseDate?: string;
}

export interface RequestOptions {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  seasons?: number[];
}

export interface RequestStatus {
  id: number;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  updatedAt: string;
  type: 'movie' | 'tv';
  media: {
    id: number;
    title: string;
  };
}

export class OverseerrService {
  private readonly url: string;
  private readonly apiKey: string;

  constructor() {
    this.url = config.overseerr.url;
    this.apiKey = config.overseerr.apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = new URL(endpoint, this.url);
    
    // Create a new headers object
    const headers = new Headers(options.headers);
    headers.set('X-Api-Key', this.apiKey);
    headers.set('Content-Type', 'application/json');
    
    const response = await fetch(url.toString(), {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error text');
      throw new ServiceError(
        'API_ERROR',
        `Overseerr API error: ${response.statusText} - ${errorText}`,
        { status: response.status }
      );
    }

    return response.json() as Promise<T>;
  }

  async search(query: string, type?: 'movie' | 'tv' | 'person'): Promise<SearchResult[]> {
    const params = new URLSearchParams({ query });
    if (type) params.set('type', type);
    
    const results = await this.request<{ results: SearchResult[] }>(
      `/search?${params.toString()}`
    );
    return results.results;
  }

  async createRequest({ mediaId, mediaType, seasons }: RequestOptions): Promise<RequestStatus> {
    const request = await this.request<RequestStatus>('/request', {
      method: 'POST',
      body: JSON.stringify({
        mediaId,
        mediaType,
        seasons
      })
    });
    return request;
  }

  async getRequestStatus(requestId: number): Promise<RequestStatus> {
    return this.request<RequestStatus>(`/request/${requestId}`);
  }

  async listRequests(options: {
    status?: 'pending' | 'approved' | 'declined';
    take?: number;
    skip?: number;
  } = {}): Promise<RequestStatus[]> {
    const params = new URLSearchParams();
    if (options.status) params.set('status', options.status);
    if (options.take) params.set('take', options.take.toString());
    if (options.skip) params.set('skip', options.skip.toString());
    
    const results = await this.request<{ results: RequestStatus[] }>(
      `/request?${params.toString()}`
    );
    return results.results;
  }

  async approveRequest(requestId: number): Promise<void> {
    await this.request(`/request/${requestId}/approve`, {
      method: 'POST'
    });
  }

  async declineRequest(requestId: number, reason?: string): Promise<void> {
    await this.request(`/request/${requestId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
}
