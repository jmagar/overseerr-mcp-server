# Overseerr MCP

A Model Context Protocol (MCP) integration for Overseerr that enables natural language interaction with your media request system through Claude AI. This server allows you to search for movies and TV shows, make media requests, and manage your Overseerr instance using conversational language.

## Example Conversations

Here are some example conversations you can have with Claude using this server:

```
You: Can you find any recent sci-fi movies?
Claude: Let me search for recent science fiction films...
[Uses overseerr:search to find recent sci-fi movies]

You: That looks good! Can you request the second one?
Claude: I'll request that movie for you...
[Uses overseerr:request to submit the media request]

You: What TV shows are available about cooking?
Claude: I'll search for cooking-related TV shows...
[Uses overseerr:search with type='tv' to find cooking shows]
```

## Features

### Media Search
- Search across movies, TV shows, and people
- Get detailed information about media including:
  - Title and release date
  - Plot overview
  - Availability status
  - Request status
- Filter by media type (movie/TV/person)
- Natural language queries (e.g., "find recent sci-fi movies" or "search for shows like Breaking Bad")

### Media Requests
- Request movies and TV shows
- Specify individual seasons for TV shows
- Track request status
- Get notifications about request updates
- Natural language requests (e.g., "request the latest Batman movie" or "add Succession to my watchlist")

### Integration
- Seamless Claude AI integration through stdio transport
- Real-time interaction with your Overseerr instance
- Secure API key handling
- Rate limiting and error handling
- Easy configuration through environment variables

## Setup

### Prerequisites
- Node.js
- pnpm
- Claude Desktop
- Overseerr instance

### Quick Start

1. Install dependencies:
```bash
pnpm install
```

2. Build the project:
```bash
pnpm build
```

3. Configure environment:
```bash
# Copy template
cp .env.template .env

# Edit .env with your values
OVERSEERR_URL=your_overseerr_url
OVERSEERR_API_KEY=your_api_key
```

4. Configure Claude Desktop:

Linux/Mac:
```json
{
  "overseerr": {
    "command": "node",
    "args": ["/path/to/overseerr/packages/server/dist/index.js"],
    "cwd": "/path/to/overseerr",
    "transport": {
      "type": "stdio"
    },
    "env": {
      "OVERSEERR_URL": "your_overseerr_url",
      "OVERSEERR_API_KEY": "your_api_key"
    }
  }
}
```

Windows (note the double backslashes):
```json
{
  "overseerr": {
    "command": "node",
    "args": ["C:\\path\\to\\overseerr\\packages\\server\\dist\\index.js"],
    "cwd": "C:\\path\\to\\overseerr",
    "transport": {
      "type": "stdio"
    },
    "env": {
      "OVERSEERR_URL": "your_overseerr_url",
      "OVERSEERR_API_KEY": "your_api_key"
    }
  }
}
```

5. Start the server:
```bash
pnpm start
```

## Technical Details

### Project Structure
```
packages/
├── config/      # Configuration management
├── overseerr/   # Overseerr API client
├── server/      # MCP server implementation
└── shared/      # Shared types and utilities
```

### Available Tools

#### Search Media (`overseerr:search`)
Search for movies, TV shows, and people in the Overseerr database.

```typescript
{
  // The search query - can be a title, person, or general description
  query: string,
  
  // Optional: Filter by type
  // - 'movie': Only search movies
  // - 'tv': Only search TV shows
  // - 'person': Only search people
  type?: 'movie' | 'tv' | 'person'
}
```

Example queries:
- "Search for Inception"
- "Find TV shows from 2023"
- "Look for movies with Tom Hanks"

#### Request Media (`overseerr:request`)
Request movies or TV shows to be added to your media library.

```typescript
{
  // The TMDB ID of the media to request
  mediaId: number,
  
  // Type of media being requested
  // - 'movie': Request a movie
  // - 'tv': Request a TV show
  mediaType: 'movie' | 'tv',
  
  // Optional: For TV shows, specify which seasons to request
  // If not provided, requests all available seasons
  seasons?: number[]
}
```

Example requests:
- Request a movie: "Request The Matrix"
- Request specific seasons: "Add seasons 1-3 of The Office"
- Request all seasons: "Request the complete series of Breaking Bad"

### Configuration

#### Environment Variables
- `OVERSEERR_URL`: Your Overseerr instance URL
- `OVERSEERR_API_KEY`: Your Overseerr API key

### Error Handling
The server implements robust error handling:
- API errors with meaningful messages
- Rate limiting protection
- Request validation
- Connection error recovery

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 