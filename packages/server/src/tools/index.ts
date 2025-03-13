import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config, isServiceEnabled } from "@overseerr-mcp/config";
import { registerOverseerrTools } from "./overseerr.js";

// Set up logging
const logLevel = config.core.logLevel;
const logger = {
  debug: (...args: any[]) => logLevel === 'debug' && console.error('[DEBUG]', ...args),
  info: (...args: any[]) => (logLevel === 'debug' || logLevel === 'info') && console.error('[INFO]', ...args),
  warn: (...args: any[]) => (logLevel !== 'error') && console.error('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args)
};

export function registerTools(server: McpServer) {
  // Only register Overseerr tools
  if (isServiceEnabled('overseerr')) {
    logger.info('Registering Overseerr tools...');
    registerOverseerrTools(server);
  } else {
    logger.warn('Overseerr is not enabled. No tools will be registered.');
  }
} 