# System Patterns

## Architecture
1. **Monorepo Structure**
   - Uses pnpm workspaces
   - Packages organized by functionality
   - Shared configuration and types

2. **Package Organization**
   ```
   packages/
   ├── config/      # Configuration management
   ├── overseerr/   # Overseerr API client
   ├── server/      # MCP server implementation
   └── shared/      # Shared types and utilities
   ```

## Key Technical Decisions
1. **Transport Layer**
   - Using stdio for Claude Desktop integration
   - Simple, reliable communication channel
   - No need for network configuration

2. **Configuration Management**
   - Environment variables for service configuration
   - Minimal required configuration
   - Defaults provided where possible

3. **Type Safety**
   - TypeScript throughout
   - Zod for runtime validation
   - Shared type definitions

4. **Tool Design**
   - Simple, focused tools
   - Clear input/output contracts
   - Error handling with meaningful messages

5. **Image Handling** (In Progress)
   - Poster paths from Overseerr API
   - Relative URL resolution
   - MCP image content type support

## Development Patterns
1. **Package Dependencies**
   - Workspace dependencies for internal packages
   - Explicit versioning for external dependencies
   - Minimal external dependencies

2. **Code Organization**
   - Service-based separation
   - Clear module boundaries
   - Shared utilities where appropriate

3. **Response Formatting**
   - Structured text responses
   - Image content support (planned)
   - Error handling with context 