# Overseerr MCP Server

A Model Context Protocol (MCP) server that allows Claude to interact with Overseerr, a request management and media discovery tool for Plex.

## Features

- Search for movies and TV shows
- Get detailed information about media
- Request media to be added to your library
- View and manage existing requests

## Setup

### 1. Configuration

Create a `.env` file in the root directory with the following variables:

```
# Overseerr instance URL
OVERSEERR_URL=http://your-overseerr-instance:5055

# Overseerr API key (from your Overseerr settings)
OVERSEERR_API_KEY=your_api_key_here
```

### 2. Build the Server

```bash
npm install
npm run build
```

### 3. Set Up Claude Desktop

To use this server with Claude Desktop:

1. Open your Claude Desktop configuration file:
   - **MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

2. Add this server to the configuration:

```json
{
  "mcpServers": {
    "overseerr-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/overseerr-mcp-server/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/overseerr-mcp-server` with the actual absolute path to this directory.

### 4. Using with Claude

Once configured, you can ask Claude to use the tools:

- "Search for Breaking Bad using the search_media tool"
- "Show me details about The Matrix"
- "Request the show Stranger Things"
- "Show me my pending media requests"

## Available Tools

- `search_media` - Search for TV shows and movies
- `get_media_details` - Get detailed information about media
- `request_media` - Request media to be added to your library
- `get_requests` - List existing media requests

## Development

To modify or extend this server:

1. Make your changes to the source files in `src/`
2. Rebuild the server:
   ```bash
   npm run build
   ```
3. Restart Claude Desktop to use the updated server

## Troubleshooting

- Ensure your Overseerr instance is running and accessible
- Verify your API key has the necessary permissions
- Check that the path in Claude Desktop's configuration is correct
