import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';
import { OverseerrService } from '@overseerr-mcp/overseerr';
import { config } from '@overseerr-mcp/config';

export function registerOverseerrTools(server: McpServer) {
  const overseerr = new OverseerrService();

  // Helper function to format search results in a more readable way
  function formatSearchResults(results: any[]) {
    if (!results || results.length === 0) {
      return "No results found.";
    }

    return results.map((item, index) => {
      const mediaType = item.mediaType === 'movie' ? '🎬 Movie' : item.mediaType === 'tv' ? '📺 TV Show' : '👤 Person';
      const title = item.title || 'Unknown';
      const year = item.releaseDate ? ` (${item.releaseDate.substring(0, 4)})` : '';
      const status = item.mediaInfo?.status === 5 ? ' [Available]' : '';
      
      return `${index + 1}. ${mediaType}: ${title}${year}${status}
   ID: ${item.id}
   Overview: ${item.overview ? item.overview.substring(0, 150) + (item.overview.length > 150 ? '...' : '') : 'No overview available'}
`;
    }).join('\n');
  }

  // Helper function to format request list in a more readable way
  function formatRequests(requests: any[]) {
    if (!requests || requests.length === 0) {
      return "No requests found.";
    }

    return requests.map((request, index) => {
      const status = request.status === 'pending' ? '⏳ Pending' : request.status === 'approved' ? '✅ Approved' : '❌ Declined';
      const mediaType = request.type === 'movie' ? '🎬 Movie' : '📺 TV Show';
      const title = request.media?.title || 'Unknown';
      const date = new Date(request.createdAt).toLocaleDateString();
      
      // Additional data from the API response that might not be in the interface
      const requestedBy = (request as any).requestedBy?.displayName || 'Unknown';
      const seasons = (request as any).seasons;
      
      return `${index + 1}. ${status} | ${mediaType}: ${title}
   Request ID: ${request.id}
   Requested by: ${requestedBy} on ${date}
   ${seasons?.length ? `Seasons: ${seasons.map((s: any) => s.seasonNumber).join(', ')}` : ''}
`;
    }).join('\n');
  }

  server.tool(
    "overseerr:search",
    "Search for movies and TV shows",
    {
      query: z.string().describe("Search query"),
      type: z.enum(['movie', 'tv', 'person']).optional().describe("Type of content to search for")
    },
    async ({ query, type }) => {
      try {
        const results = await overseerr.search(query, type);
        
        return {
          content: [{
            type: "text",
            text: formatSearchResults(results)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "overseerr:request",
    "Request a movie or TV show",
    {
      mediaId: z.number().describe("Media ID to request"),
      mediaType: z.enum(['movie', 'tv']).describe("Type of media"),
      seasons: z.array(z.number()).optional().describe("Season numbers to request (TV only)")
    },
    async ({ mediaId, mediaType, seasons }) => {
      try {
        const request = await overseerr.createRequest({ mediaId, mediaType, seasons });
        
        return {
          content: [{
            type: "text",
            text: `✅ Successfully requested ${mediaType === 'movie' ? 'movie' : 'TV show'} with ID ${mediaId}.
Request ID: ${request.id}
Status: ${request.status}
Media: ${request.media?.title || 'Unknown'}
${seasons ? `Seasons: ${seasons.join(', ')}` : ''}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "overseerr:search_and_request",
    "Search for media and request it in one step",
    {
      query: z.string().describe("Search query"),
      type: z.enum(['movie', 'tv']).describe("Type of media to search for"),
      seasons: z.array(z.number()).optional().describe("Season numbers to request (TV only)")
    },
    async ({ query, type, seasons }) => {
      try {
        // First search for the media
        const results = await overseerr.search(query, type);
        
        if (!results || results.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No results found for "${query}".`
            }]
          };
        }
        
        // Use the first result
        const firstResult = results[0];
        
        if (firstResult.mediaType !== type) {
          return {
            content: [{
              type: "text",
              text: `No ${type} results found for "${query}".`
            }]
          };
        }
        
        // Request the media
        const request = await overseerr.createRequest({ 
          mediaId: firstResult.id, 
          mediaType: firstResult.mediaType as 'movie' | 'tv',
          seasons 
        });
        
        return {
          content: [{
            type: "text",
            text: `✅ Found and requested: ${firstResult.title}
Media ID: ${firstResult.id}
Request ID: ${request.id}
Status: ${request.status}
${seasons ? `Seasons: ${seasons.join(', ')}` : ''}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "overseerr:status",
    "Get request status",
    {
      requestId: z.number().describe("Request ID to check")
    },
    async ({ requestId }) => {
      try {
        const status = await overseerr.getRequestStatus(requestId);
        
        const mediaType = status.type === 'movie' ? 'Movie' : 'TV Show';
        
        // Cast to any to access additional properties that might be in the API response
        const fullStatus = status as any;
        const seasons = fullStatus.seasons;
        
        return {
          content: [{
            type: "text",
            text: `Request ID: ${status.id}
Status: ${status.status}
Type: ${mediaType}
Media: ${status.media?.title || 'Unknown'}
Created: ${new Date(status.createdAt).toLocaleString()}
Updated: ${new Date(status.updatedAt).toLocaleString()}
${seasons?.length ? `Seasons: ${seasons.map((s: any) => s.seasonNumber).join(', ')}` : ''}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "overseerr:requests",
    "List all requests",
    {
      status: z.enum(['pending', 'approved', 'declined']).optional().describe("Filter by request status"),
      take: z.number().min(1).max(100).optional().describe("Number of requests to return"),
      skip: z.number().min(0).optional().describe("Number of requests to skip")
    },
    async ({ status, take, skip }) => {
      try {
        const requests = await overseerr.listRequests({ status, take, skip });
        
        return {
          content: [{
            type: "text",
            text: formatRequests(requests)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "overseerr:approve",
    "Approve a request",
    {
      requestId: z.number().describe("Request ID to approve")
    },
    async ({ requestId }) => {
      try {
        await overseerr.approveRequest(requestId);
        
        return {
          content: [{
            type: "text",
            text: `✅ Request ${requestId} approved successfully`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "overseerr:list_and_approve",
    "List pending requests and approve one",
    {
      take: z.number().min(1).max(100).optional().describe("Number of pending requests to list"),
      requestIndex: z.number().min(1).describe("Index of the request to approve (from the list)")
    },
    async ({ take = 10, requestIndex }) => {
      try {
        // Get pending requests
        const pendingRequests = await overseerr.listRequests({ status: 'pending', take });
        
        if (!pendingRequests || pendingRequests.length === 0) {
          return {
            content: [{
              type: "text",
              text: "No pending requests found."
            }]
          };
        }
        
        // Check if the index is valid
        if (requestIndex > pendingRequests.length) {
          return {
            content: [{
              type: "text",
              text: `Invalid request index. There are only ${pendingRequests.length} pending requests.`
            }],
            isError: true
          };
        }
        
        // Get the request to approve
        const requestToApprove = pendingRequests[requestIndex - 1];
        
        // Cast to any to access additional properties
        const fullRequest = requestToApprove as any;
        const requestedBy = fullRequest.requestedBy?.displayName || 'Unknown';
        
        // Approve the request
        await overseerr.approveRequest(requestToApprove.id);
        
        return {
          content: [{
            type: "text",
            text: `✅ Approved request #${requestIndex}:
Request ID: ${requestToApprove.id}
Media: ${requestToApprove.media?.title || 'Unknown'}
Type: ${requestToApprove.type === 'movie' ? 'Movie' : 'TV Show'}
Requested by: ${requestedBy}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );
}
