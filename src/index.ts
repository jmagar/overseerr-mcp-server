import { MCPServer } from "mcp-framework";
import { logger } from "mcp-framework";
import config from './config.js';

// Import tools to ensure they're loaded
import './tools/ExampleTool.js';
import './tools/SearchMediaTool.js';
import './tools/GetMediaDetailsTool.js';
import './tools/RequestMediaTool.js';
import './tools/GetRequestsTool.js';
import './tools/GetDailyTreasuryStatementTool.js';

/**
 * Main entry point for the Overseerr MCP server
 */
async function main() {
  try {
    logger.info("Starting Overseerr MCP server...");
    logger.info(`Using Overseerr instance at ${config.baseUrl}`);
    
    // Log global tools registry for debugging
    logger.info(`Global tools registry contains ${(global as any).__MCP_TOOLS?.length || 0} tools`);
    if ((global as any).__MCP_TOOLS?.length > 0) {
      logger.info(`Tools in registry: ${(global as any).__MCP_TOOLS.map((t: any) => t.name).join(', ')}`);
    }
    
    // Validate configuration
    if (!config.apiKey) {
      logger.error("No API key provided. Please set the OVERSEERR_API_KEY environment variable.");
      process.exit(1);
    }
    
    // Create server
    const server = new MCPServer({
      transport: {
        type: "stdio"
      }
    });
    
    // Add listeners to process events for debugging
    process.on('beforeExit', () => {
      logger.info('Process is about to exit');
    });
    
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
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error(`Uncaught exception: ${error.message}`);
      console.error('Uncaught exception stack trace:', error.stack);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      logger.error(`Unhandled promise rejection at: ${promise}, reason: ${String(reason)}`);
      console.error('Unhandled rejection details:', reason);
    });
    
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Server failed to start: ${error.message}`);
      console.error(`Detailed error info: ${error.stack}`);
    } else {
      logger.error("Server failed to start with an unknown error");
      console.error(`Unknown error details: ${JSON.stringify(error)}`);
    }
    process.exit(1);
  }
}

// Start the server
main();