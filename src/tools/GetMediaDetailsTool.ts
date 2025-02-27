import { z } from "zod";
import { OverseerrClient } from "../services/OverseerrClient.js";
import config from "../config.js";
import { sessionManager } from "../services/SessionManager.js";
import { BaseTool } from "./BaseTool.js";

interface GetMediaDetailsInput {
  mediaType?: 'movie' | 'tv' | string;
  mediaId?: number | string;
  reference?: string;
}

/**
 * Tool for retrieving detailed information about a specific movie or TV show
 */
class GetMediaDetailsTool extends BaseTool<GetMediaDetailsInput> {
  name = "get_media_details";
  description = "Get detailed information about a specific movie or TV show";
  
  private client: OverseerrClient;

  /**
   * Create a new GetMediaDetailsTool
   */
  constructor() {
    super();
    this.client = new OverseerrClient(config.baseUrl, config.apiKey);
  }

  schema = {
    mediaType: {
      type: z.enum(["movie", "tv"]).or(z.string().transform(val => {
        // Normalize string input to valid enum
        if (val.toLowerCase() === "movie" || val.toLowerCase() === "movies") return "movie";
        if (val.toLowerCase() === "tv" || val.toLowerCase() === "tvshow" || val.toLowerCase() === "tv show") return "tv";
        return val;
      })).optional(),
      description: "Type of media (movie or tv)",
    },
    mediaId: {
      type: z.union([z.string().transform(val => parseInt(val, 10)), z.number()]).optional(),
      description: "The TMDB ID of the media item",
    },
    reference: {
      type: z.string().optional(),
      description: "Reference to a previous search result (e.g., 'first_result', 'last_search', or just 'inception')",
    }
  };

  async executeWithContext(input: GetMediaDetailsInput, ctx?: any) {
    // Get session ID from context
    const sessionId = ctx?.sessionId;
    
    // Check if we're using a reference to a previous search
    if (input.reference && sessionId) {
      const searchResults = sessionManager.getSessionData(sessionId, 'searchResults');
      
      if (!searchResults || searchResults.length === 0) {
        return {
          type: "text",
          text: "No previous search results found. Please search for a movie or TV show first."
        };
      }
      
      // Find the referenced result
      let resultIndex = 0;
      
      // Handle different reference types
      if (input.reference.toLowerCase().includes('first') || input.reference === '1') {
        resultIndex = 0;
      } else if (input.reference.toLowerCase().includes('second') || input.reference === '2') {
        resultIndex = 1;
      } else if (input.reference.toLowerCase().includes('third') || input.reference === '3') {
        resultIndex = 2;
      } else if (input.reference.toLowerCase().includes('last')) {
        resultIndex = searchResults.length - 1;
      } else {
        // Try to parse a number
        const parsedIndex = parseInt(input.reference, 10);
        if (!isNaN(parsedIndex) && parsedIndex > 0 && parsedIndex <= searchResults.length) {
          resultIndex = parsedIndex - 1; // Convert from 1-indexed to 0-indexed
        }
      }
      
      // Bounds check
      if (resultIndex < 0 || resultIndex >= searchResults.length) {
        return {
          type: "text",
          text: `Invalid reference. There are ${searchResults.length} search results available.`
        };
      }
      
      // Get the referenced result
      const selectedResult = searchResults[resultIndex];
      
      // Now get detailed information about this result
      return this.getMediaDetails(
        selectedResult.mediaType,
        selectedResult.id
      );
    } else if (!input.mediaId || !input.mediaType) {
      // No reference and missing required fields
      return {
        type: "text",
        text: `Please provide either a reference to a previous search result (e.g., "first_result") or both mediaType and mediaId.`
      };
    }
    
    // Handle direct mediaId/mediaType path
    return this.getMediaDetails(input.mediaType!, input.mediaId!);
  }
  
  /**
   * Helper method to get media details
   */
  private async getMediaDetails(mediaType: string, mediaId: string | number) {
    // Handle string input for mediaId
    const parsedMediaId = typeof mediaId === 'string' ? parseInt(mediaId, 10) : mediaId;
    
    // Normalize mediaType
    let normalizedMediaType = mediaType;
    if (typeof mediaType === 'string') {
      if (mediaType.toLowerCase() === 'movie' || mediaType.toLowerCase() === 'movies') {
        normalizedMediaType = 'movie';
      } else if (mediaType.toLowerCase() === 'tv' || mediaType.toLowerCase() === 'tvshow' || mediaType.toLowerCase() === 'tv show') {
        normalizedMediaType = 'tv';
      }
    }
    
    // Validate mediaType after normalization
    if (normalizedMediaType !== 'movie' && normalizedMediaType !== 'tv') {
      return {
        type: "text",
        text: `Invalid media type: ${mediaType}. Must be 'movie' or 'tv'.`
      };
    }
    
    try {
      // Get basic details
      const details = await this.client.getMediaDetails(normalizedMediaType as 'movie' | 'tv', parsedMediaId);
      
      // Enhance the response with formatted information
      const enhancedDetails = {
        id: details.id,
        tmdbId: details.id, // For clarity
        mediaType: details.mediaType,
        title: normalizedMediaType === 'movie' ? details.title : details.name,
        originalTitle: normalizedMediaType === 'movie' ? details.originalTitle : details.originalName,
        releaseDate: normalizedMediaType === 'movie' ? details.releaseDate : details.firstAirDate,
        overview: details.overview,
        status: details.status,
        
        // Images
        posterUrl: details.posterUrl,
        backdropUrl: details.backdropUrl,
        
        // Additional details
        runtime: details.runtime,
        genres: details.genres,
        voteAverage: details.voteAverage,
        popularity: details.popularity,
        
        // If available
        mediaInfo: details.mediaInfo,
      };
      
      return {
        type: "text",
        text: JSON.stringify(enhancedDetails, null, 2)
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          type: "text",
          text: `Failed to get media details: ${error.message}`
        };
      }
      return {
        type: "text",
        text: 'Failed to get media details due to an unknown error'
      };
    }
  }
}

export default GetMediaDetailsTool; 