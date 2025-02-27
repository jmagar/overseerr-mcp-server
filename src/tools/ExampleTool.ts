import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface ExampleInput {
  message: string;
}

class ExampleTool extends MCPTool<ExampleInput> {
  name = "example_tool";
  description = "An example tool that processes messages";

  schema = {
    message: {
      type: z.string(),
      description: "Message to process",
    },
  };

  async execute(input: ExampleInput) {
    return `Processed: ${input.message}`;
  }
}

// Create an instance and register it with global registry
const instance = new ExampleTool();
if (typeof (global as any).__MCP_TOOLS !== 'undefined') {
  (global as any).__MCP_TOOLS.push(instance);
} else {
  (global as any).__MCP_TOOLS = [instance];
}

// Also export the class for compatibility
export default ExampleTool;