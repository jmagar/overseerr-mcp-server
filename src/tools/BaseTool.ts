import { MCPTool } from "mcp-framework";

/**
 * Base tool class that extends MCPTool and adds context support
 * This handles the TypeScript issue with context parameter
 */
export abstract class BaseTool<T extends Record<string, any>> extends MCPTool<T> {
  /**
   * Abstract method that will be implemented by child classes
   * This allows tools to access session context
   */
  abstract executeWithContext(input: T, ctx?: any): Promise<unknown>;
  
  /**
   * Implementation of the execute method required by MCPTool
   * This delegates to executeWithContext, passing along the context
   */
  async execute(input: T): Promise<unknown> {
    // The framework actually passes context as a second parameter
    // even though TypeScript definition doesn't show it
    // @ts-ignore - Ignore the TypeScript error since we know context is actually passed
    return this.executeWithContext(input, arguments[1]);
  }
} 