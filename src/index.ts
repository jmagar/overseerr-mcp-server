import { MCPServer } from "mcp-framework";
import { logger } from "mcp-framework";
import config from './config.js';

// Import our tools (not needed for instantiation, but helps with TypeScript)
import './tools/SearchMediaTool.js';
import './tools/GetMediaDetailsTool.js';
import './tools/RequestMediaTool.js';
import './tools/GetRequestsTool.js';

/**
 * Main entry point for the Overseerr MCP server
 */
async function main() {
  try {
    logger.info("Starting Overseerr MCP server...");
    logger.info(`Using Overseerr instance at ${config.baseUrl}`);
    
    // Validate configuration
    if (!config.apiKey) {
      logger.error("No API key provided. Please set the OVERSEERR_API_KEY environment variable.");
      process.exit(1);
    }
    
    // Create server with STDIO transport
    const server = new MCPServer({
      transport: {
        type: "stdio"
      }
    });

    // Note: Tools will be automatically discovered by the server
    // from the dist/tools directory after build
    
    // Start server
    await server.start();
    
    logger.info(`Overseerr MCP server running with STDIO transport`);
    
    // Handle shutdown gracefully
    process.on("SIGINT", async () => {
      logger.info("Shutting down server...");
      await server.stop();
      process.exit(0);
    });
    
    process.on("SIGTERM", async () => {
      logger.info("Shutting down server...");
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Server failed to start: ${error.message}`);
    } else {
      logger.error("Server failed to start with an unknown error");
    }
    process.exit(1);
  }
}

// Start the server
main();