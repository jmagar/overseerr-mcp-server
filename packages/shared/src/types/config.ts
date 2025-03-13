/**
 * Base configuration interface for all services
 */
export interface ServiceConfig {
  url: string;
  apiKey: string;
  timeout?: number;
  retryAttempts?: number;
  rateLimitPerSecond?: number;
}

/**
 * Base configuration for download clients
 */
export interface DownloadClientConfig extends ServiceConfig {
  category?: string;
  directory?: string;
}

/**
 * Base configuration for notification services
 */
export interface NotificationConfig extends ServiceConfig {
  priority?: number;
  tags?: string[];
}

/**
 * Base configuration for media servers
 */
export interface MediaServerConfig extends ServiceConfig {
  libraries?: string[];
  transcodeDirectory?: string;
}

/**
 * TMDB configuration
 */
export interface TMDBConfig extends ServiceConfig {
  language?: string;
  region?: string;
  includeAdult?: boolean;
} 