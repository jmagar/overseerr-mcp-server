import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file with explicit path
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

/**
 * Configuration for the Overseerr MCP server
 */
const config = {
  // Overseerr instance URL
  baseUrl: process.env.OVERSEERR_URL || "http://localhost:5055",
  
  // Overseerr API key
  apiKey: process.env.OVERSEERR_API_KEY || "",
  
  // MCP server port (default: 3200)
  serverPort: process.env.MCP_SERVER_PORT ? parseInt(process.env.MCP_SERVER_PORT, 10) : 3200
};

// Log configuration for debugging
console.log('Configuration loaded:');
console.log(`- OVERSEERR_URL: ${config.baseUrl}`);
console.log(`- OVERSEERR_API_KEY: ${config.apiKey ? '[SET]' : '[NOT SET]'}`);
console.log(`- MCP_SERVER_PORT: ${config.serverPort}`);

export default config; 