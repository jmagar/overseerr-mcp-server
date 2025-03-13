// Import centralized configuration
import { config, isServiceEnabled } from '@overseerr-mcp/config';

// Set up logging based on configuration
const logLevel = config.core.logLevel;
const logger = {
  debug: (...args: any[]) => logLevel === 'debug' && console.error('[DEBUG]', ...args),
  info: (...args: any[]) => (logLevel === 'debug' || logLevel === 'info') && console.error('[INFO]', ...args),
  warn: (...args: any[]) => (logLevel !== 'error') && console.error('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args)
};

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerOverseerrTools } from "./tools/overseerr.js";

// Log enabled services
logger.info('Starting Overseerr MCP Server');
logger.info('Configuration:');
const overseerrEnabled = isServiceEnabled('overseerr');
logger.info(`- overseerr: ${overseerrEnabled ? 'enabled' : 'disabled'}`);

if (!overseerrEnabled) {
  logger.error('Overseerr is not configured. Please set OVERSEERR_URL and OVERSEERR_API_KEY environment variables.');
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "overseerr-mcp-server",
  version: "1.0.0"
});

// Register tools
logger.info('Registering Overseerr tools...');
registerOverseerrTools(server);

// Start the server
logger.info('Starting MCP server...');
const transport = new StdioServerTransport();
await server.connect(transport); 