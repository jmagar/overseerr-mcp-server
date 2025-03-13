# Product Context

## Purpose
The Overseerr MCP (Model Context Protocol) project exists to provide a bridge between Claude AI and the Overseerr media request system. It enables Claude to interact with Overseerr through a standardized protocol, allowing users to search for and request media using natural language.

## Problems Solved
1. **AI Integration Gap**: Bridges the gap between AI language models and media management systems
2. **Accessibility**: Makes Overseerr's functionality accessible through natural language conversations
3. **Standardization**: Provides a consistent interface for AI interactions with Overseerr
4. **Visual Context**: Enhances search results with media posters for better decision making (in progress)

## How It Works
1. **Server Component**:
   - Runs as a stdio-based MCP server
   - Connects to Overseerr's API using provided credentials
   - Exposes Overseerr functionality through MCP tools
   - Handles media poster paths from API responses

2. **Tools Available**:
   - `overseerr:search`: Search for movies and TV shows (with poster support planned)
   - `overseerr:request`: Request media for addition to the library

3. **Configuration**:
   - Uses environment variables for Overseerr connection details
   - Integrates with Claude Desktop through stdio transport
   - Minimal setup required (just URL and API key)

4. **Image Integration** (In Progress):
   - Receives poster paths from Overseerr API
   - Will convert to full URLs for display
   - Will enhance search results with visual context 