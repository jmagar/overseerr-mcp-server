import * as dotenv from 'dotenv';
import { ConfigurationError } from '@overseerr-mcp/shared';
import { z } from 'zod';
dotenv.config();

// Define validation schema for Overseerr only
const configSchema = z.object({
  overseerr: z.object({
    url: z.string().url().default('http://localhost:5055'),
    apiKey: z.string().min(1, 'OVERSEERR_API_KEY is required')
  }),
  core: z.object({
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    retryAttempts: z.number().int().positive().default(3),
    requestTimeout: z.number().int().positive().default(30000),
    rateLimitPerSecond: z.number().positive().default(2)
  })
});

// Raw config data from environment variables
const rawConfig = {
  overseerr: {
    url: process.env.OVERSEERR_URL,
    apiKey: process.env.OVERSEERR_API_KEY
  },
  core: {
    logLevel: process.env.LOG_LEVEL,
    retryAttempts: process.env.RETRY_ATTEMPTS ? parseInt(process.env.RETRY_ATTEMPTS) : undefined,
    requestTimeout: process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT) : undefined,
    rateLimitPerSecond: process.env.RATE_LIMIT_PER_SECOND ? parseFloat(process.env.RATE_LIMIT_PER_SECOND) : undefined
  }
};

// Parse and validate config
let config: z.infer<typeof configSchema>;
try {
  config = configSchema.parse(rawConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    const issues = error.issues.map(issue => 
      `${issue.path.join('.')}: ${issue.message}`
    ).join('\n');
    throw new ConfigurationError(`Configuration validation failed:\n${issues}`);
  }
  throw error;
}

// Export the validated config
export { config };

// Helper function to check if a service is enabled (has required config)
export function isServiceEnabled(service: keyof typeof config): boolean {
  switch (service) {
    case 'overseerr':
      return !!config[service]?.apiKey;
    case 'core':
      return true;
    default:
      return false;
  }
} 