# Technical Context

## Technologies Used
1. **Core Technologies**
   - Node.js
   - TypeScript
   - pnpm (package management)

2. **Key Libraries**
   - @modelcontextprotocol/sdk
   - zod (schema validation)

3. **Development Tools**
   - ESLint
   - TypeScript Compiler
   - VS Code (recommended)

## Development Setup
1. **Prerequisites**
   - Node.js installed
   - pnpm installed
   - Claude Desktop installed

2. **Installation**
   ```bash
   pnpm install
   pnpm build
   ```

3. **Configuration**
   - Copy `.env.template` to `.env`
   - Set Overseerr URL and API key
   - Configure Claude Desktop with stdio transport

## Technical Constraints
1. **Runtime**
   - Node.js environment
   - stdio-based communication
   - Synchronous startup required

2. **Integration**
   - Must conform to MCP protocol
   - Must handle stdio gracefully
   - Must validate all inputs/outputs

3. **Configuration**
   - Environment-based configuration
   - Minimal required setup
   - Secure credential handling 