import { z } from "zod";
import { OverseerrClient } from "../services/OverseerrClient.js";
import config from "../config.js";
import { sessionManager } from "../services/SessionManager.js";
import { BaseTool } from "./BaseTool.js";

interface SearchMediaInput {
  query: string;
  page?: number | string; // Keep in interface for internal use
}

/**
 * Tool for searching media (movies, TV shows) via Overseerr
 */
class SearchMediaTool extends BaseTool<SearchMediaInput> {
  name = "search_media";
  description = "Search for movies and TV shows in Overseerr";
  
  private client: OverseerrClient;

  /**
   * Create a new SearchMediaTool
   */
  constructor() {
    super();
    this.client = new OverseerrClient(config.baseUrl, config.apiKey);
  }

  schema = {
    query: {
      type: z.string(),
      description: "Search query for movies or TV shows",
    },
    // Page parameter removed from schema to simplify user experience
  };

  async executeWithContext(input: SearchMediaInput, ctx?: any) {
    const query = input.query;
    // Always default to page 1 if not specified
    const page = input.page ? (typeof input.page === 'string' ? parseInt(input.page, 10) : input.page) : 1;
    
    if (!query.trim()) {
      return {
        type: "text",
        text: "Search query cannot be empty"
      };
    }
    
    try {
      const results = await this.client.search(query, page);
      
      // Process results to include image URLs for posters/banners
      const processedResults = results.results.map((result: any) => {
        // Construct image URLs based on TMDB ID
        const posterPath = result.posterPath;
        const backdropPath = result.backdropPath;
        
        return {
          ...result,
          mediaType: result.mediaType,
          id: result.id,
          tmdbId: result.id, // Alias for clarity
          title: result.mediaType === 'movie' ? result.title : result.name,
          releaseDate: result.mediaType === 'movie' ? result.releaseDate : result.firstAirDate,
          overview: result.overview || 'No overview available',
          // Include full image URLs if available
          posterUrl: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null,
          backdropUrl: backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null,
        };
      });
      
      // Store the processed results in the session if we have a session ID
      if (ctx?.sessionId) {
        sessionManager.setSessionData(ctx.sessionId, 'searchResults', processedResults);
      }
      
      // Format the response according to MCP protocol
      return {
        type: "text",
        text: JSON.stringify({
          pageInfo: {
            page: results.page,
            totalPages: results.totalPages,
            totalResults: results.totalResults
          },
          results: processedResults
        }, null, 2)
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          type: "text",
          text: `Failed to search media: ${error.message}`
        };
      }
      return {
        type: "text",
        text: "Failed to search media due to an unknown error"
      };
    }
  }
}

export default SearchMediaTool; 