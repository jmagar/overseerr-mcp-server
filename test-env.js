import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log the current directory
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
console.log('.env file path:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

// Try to read the file directly
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\nDirect file read:');
  console.log(envContent);
} catch (err) {
  console.error('Error reading .env file:', err);
}

// Load with dotenv
const result = dotenv.config();
console.log('\nDotenv config result:', result);

// Check loaded environment variables
console.log('\nLoaded environment variables:');
console.log('OVERSEERR_URL:', process.env.OVERSEERR_URL);
console.log('OVERSEERR_API_KEY:', process.env.OVERSEERR_API_KEY);
console.log('MCP_SERVER_PORT:', process.env.MCP_SERVER_PORT); 