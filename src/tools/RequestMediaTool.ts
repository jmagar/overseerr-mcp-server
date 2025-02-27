import { z } from "zod";
import { OverseerrClient } from "../services/OverseerrClient.js";
import config from "../config.js";
import { BaseTool } from "./BaseTool.js";
import { sessionManager } from "../services/SessionManager.js";

interface RequestMediaInput {
  mediaType?: 'movie' | 'tv' | string;
  mediaId?: number | string;
  reference?: string;
  seasons?: number[] | string | string[];
}

/**
 * Tool for requesting media (movies or TV shows) via Overseerr
 */
class RequestMediaTool extends BaseTool<RequestMediaInput> {
  name = "request_media";
  description = "Request a movie or TV show to be added to the media server";
  
  private client: OverseerrClient;

  /**
   * Create a new RequestMediaTool
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
      description: "Type of media (movie or tv) - not needed if using reference",
    },
    mediaId: {
      type: z.union([z.string().transform(val => parseInt(val, 10)), z.number()]).optional(),
      description: "The TMDB ID of the media item - not needed if using reference",
    },
    reference: {
      type: z.string().optional(),
      description: "Reference to a media item from previous search results (e.g., 'first', 'second', '3', 'last')",
    },
    seasons: {
      type: z.union([
        // Handle array of numbers
        z.array(z.number()),
        // Handle array of strings that can be parsed to numbers
        z.array(z.string()).transform(vals => 
          vals.map(v => parseInt(v, 10)).filter(n => !isNaN(n))
        ),
        // Handle comma-separated string of numbers
        z.string().transform(val => 
          val.split(',')
            .map(v => parseInt(v.trim(), 10))
            .filter(n => !isNaN(n))
        )
      ]).optional(),
      description: "For TV shows, specific season numbers to request (leave empty for all seasons)",
    },
  };

  async executeWithContext(input: RequestMediaInput, ctx?: any) {
    // Check if we have a reference and sessionId
    let mediaType = input.mediaType;
    let mediaId = input.mediaId;

    // If we have a reference, try to get the media from stored search results
    if (input.reference && ctx?.sessionId) {
      const sessionData = sessionManager.getSessionData(ctx.sessionId, 'searchResults');
      const searchResults = sessionData;
      
      if (!searchResults || searchResults.length === 0) {
        return {
          type: "text",
          text: "No search results found. Please search for media first before using a reference."
        };
      }

      // Parse the reference (first, second, last, numeric index)
      let index = -1;
      const reference = input.reference.toLowerCase().trim();
      
      if (reference === "first") {
        index = 0;
      } else if (reference === "second") {
        index = 1;
      } else if (reference === "last") {
        index = searchResults.length - 1;
      } else if (!isNaN(parseInt(reference, 10))) {
        // Convert to 0-based index if numeric
        index = parseInt(reference, 10) - 1;
      }
      
      // Ensure the index is valid
      if (index < 0 || index >= searchResults.length) {
        return {
          type: "text",
          text: `Invalid reference: ${input.reference}. Available options: 1-${searchResults.length}, or 'first', 'last', etc.`
        };
      }

      // Get the media from the search results
      const media = searchResults[index];
      mediaType = media.mediaType;
      mediaId = media.id;
    }

    // Check if we have mediaType and mediaId after resolving reference
    if (!mediaType || !mediaId) {
      return {
        type: "text",
        text: "You must provide either a reference to a previous search result or both mediaType and mediaId."
      };
    }
    
    // Handle string input for mediaId
    mediaId = typeof mediaId === 'string' ? parseInt(mediaId, 10) : mediaId;
    
    // Normalize mediaType
    if (typeof mediaType === 'string') {
      if (mediaType.toLowerCase() === 'movie' || mediaType.toLowerCase() === 'movies') {
        mediaType = 'movie';
      } else if (mediaType.toLowerCase() === 'tv' || mediaType.toLowerCase() === 'tvshow' || mediaType.toLowerCase() === 'tv show') {
        mediaType = 'tv';
      }
    }
    
    // Validate mediaType after normalization
    if (mediaType !== 'movie' && mediaType !== 'tv') {
      return {
        type: "text",
        text: `Invalid media type: ${mediaType}. Must be 'movie' or 'tv'.`
      };
    }
    
    // Parse seasons input
    let seasons: number[] | undefined = undefined;
    if (input.seasons) {
      if (Array.isArray(input.seasons)) {
        // If it's already an array, ensure all values are numbers
        seasons = input.seasons.map(s => 
          typeof s === 'string' ? parseInt(s, 10) : s
        ).filter(n => !isNaN(n));
      } else if (typeof input.seasons === 'string') {
        // If it's a string, parse it as comma-separated values
        seasons = input.seasons.split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n));
      }
    }

    try {
      // Validate input
      if (mediaType === 'tv' && seasons && !Array.isArray(seasons)) {
        return {
          type: "text",
          text: "Seasons must be an array of numbers"
        };
      }

      // Request the media item
      const requestOptions = {
        seasons: seasons,
      };

      const result = await this.client.requestMedia(
        mediaType as 'movie' | 'tv', 
        mediaId as number, 
        requestOptions
      );

      return {
        type: "text",
        text: JSON.stringify({
          success: true,
          message: `Successfully requested ${mediaType === 'movie' ? 'movie' : 'TV show'} with ID ${mediaId}`,
          requestId: result.id,
          status: result.status,
          mediaInfo: {
            title: result.media?.title || result.media?.name,
            posterUrl: result.media?.posterUrl,
          }
        }, null, 2)
      };
    } catch (error) {
      if (error instanceof Error) {
        // Check if error is due to the media already being requested
        if (error.message.includes('already exists')) {
          return {
            type: "text",
            text: JSON.stringify({
              success: false,
              message: `This ${mediaType} has already been requested or is already available`,
              error: error.message
            }, null, 2)
          };
        }
        
        return {
          type: "text",
          text: `Failed to request media: ${error.message}`
        };
      }
      return {
        type: "text",
        text: 'Failed to request media due to an unknown error'
      };
    }
  }
}

// Create an instance and export it directly
const requestMediaTool = new RequestMediaTool();
export default requestMediaTool; 