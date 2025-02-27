import { z } from "zod";
import { OverseerrClient } from "../services/OverseerrClient.js";
import config from "../config.js";
import { BaseTool } from "./BaseTool.js";

interface GetRequestsInput {
  page?: number | string; // Keep in interface for internal use
  status?: 'all' | 'pending' | 'approved' | 'processing' | 'available' | string;
}

/**
 * Tool for retrieving media requests from Overseerr
 */
class GetRequestsTool extends BaseTool<GetRequestsInput> {
  name = "get_requests";
  description = "Get a list of media requests from Overseerr";
  
  private client: OverseerrClient;

  /**
   * Create a new GetRequestsTool
   */
  constructor() {
    super();
    this.client = new OverseerrClient(config.baseUrl, config.apiKey);
  }

  schema = {
    // Page parameter removed from schema to simplify user experience
    status: {
      type: z.enum(['all', 'pending', 'approved', 'processing', 'available']).or(
        z.string().transform(val => {
          // Normalize string input
          const normalized = val.toLowerCase();
          if (['all', 'pending', 'approved', 'processing', 'available'].includes(normalized)) {
            return normalized as 'all' | 'pending' | 'approved' | 'processing' | 'available';
          }
          return 'all' as const; // Default to 'all' for invalid values
        })
      ).optional().default('all'),
      description: "Filter requests by their status (default: all)",
    },
  };

  async executeWithContext(input: GetRequestsInput) {
    // Handle string input for page - always default to page 1
    const page = input.page ? (typeof input.page === 'string' ? parseInt(input.page, 10) : input.page) : 1;
    
    // Normalize status
    let status: 'all' | 'pending' | 'approved' | 'processing' | 'available' = 'all';
    if (input.status) {
      const validStatuses = ['all', 'pending', 'approved', 'processing', 'available'];
      const normalizedStatus = typeof input.status === 'string' ? input.status.toLowerCase() : input.status;
      
      if (validStatuses.includes(normalizedStatus)) {
        status = normalizedStatus as 'all' | 'pending' | 'approved' | 'processing' | 'available';
      }
    }
    
    try {
      const requests = await this.client.getRequests(page, status);
      
      // Format the requests for better readability
      const formattedRequests = requests.results.map(request => {
        const media = request.media;
        return {
          id: request.id,
          status: request.status,
          type: request.type,
          is4k: request.is4k,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          mediaInfo: {
            id: media.id,
            tmdbId: media.id,
            title: media.mediaType === 'movie' ? media.title : media.name,
            releaseDate: media.mediaType === 'movie' ? media.releaseDate : media.firstAirDate,
            mediaType: media.mediaType,
            status: media.status,
            // Images
            posterUrl: media.posterUrl,
            backdropUrl: media.backdropUrl
          },
          // Include season info if present
          seasons: request.seasons || [],
          // Include user who requested, if available
          requestedBy: request.requestedBy
            ? {
                id: request.requestedBy.id,
                username: request.requestedBy.username || request.requestedBy.email
              }
            : undefined
        };
      });
      
      return {
        type: "text",
        text: JSON.stringify({
          pageInfo: {
            page: requests.page,
            totalPages: requests.totalPages,
            totalResults: requests.totalResults
          },
          requests: formattedRequests
        }, null, 2)
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          type: "text",
          text: `Failed to get requests: ${error.message}`
        };
      }
      return {
        type: "text",
        text: 'Failed to get requests due to an unknown error'
      };
    }
  }
}

// Create an instance and export it directly
const getRequestsTool = new GetRequestsTool();
export default getRequestsTool; 