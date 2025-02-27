#!/usr/bin/env node

/**
 * CLI entry point for the Overseerr MCP server
 * Handles initialization and environment variable checking
 */

import { logger } from "mcp-framework";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import the main server
import './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Check for required environment variables and display helpful messages
 */
function checkEnvironment() {
  let missingVars = [];
  
  if (!process.env.OVERSEERR_URL) missingVars.push('OVERSEERR_URL');
  if (!process.env.OVERSEERR_API_KEY) missingVars.push('OVERSEERR_API_KEY');
  
  if (missingVars.length > 0) {
    logger.warn('⚠️  Missing environment variables: ' + missingVars.join(', '));
    logger.info('');
    logger.info('You can set these variables in a .env file in the project root.');
    logger.info('Example:');
    logger.info('-----------');
    
    // Try to read .env.example
    try {
      const examplePath = path.join(__dirname, '..', '.env.example');
      if (fs.existsSync(examplePath)) {
        const exampleContent = fs.readFileSync(examplePath, 'utf8');
        logger.info(exampleContent);
      }
    } catch (err) {
      // If we can't read the example, just show a basic example
      logger.info('OVERSEERR_URL=http://localhost:5055');
      logger.info('OVERSEERR_API_KEY=your-api-key-here');
      logger.info('MCP_SERVER_PORT=3100');
    }
    
    logger.info('-----------');
    logger.info('');
  }
}

// Run environment check and show helpful messages
checkEnvironment(); 