import { z } from "zod";
import { MCPTool } from "mcp-framework";
import { logger } from "mcp-framework";

interface TreasuryData {
  record_date: string;
  account_type: string;
  close_today_bal: string;
}

interface DateInput {
  date: string;
}

/**
 * Tool for fetching daily treasury statements from the US Treasury Fiscal Data API
 */
class GetDailyTreasuryStatementTool extends MCPTool<DateInput> {
  name = "get_daily_treasury_statement";
  description = "Get the daily treasury statement for a specific day";
  
  schema = {
    date: {
      type: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
      description: "Date of the statement in YYYY-MM-DD format",
    },
  };

  /**
   * Constructor with detailed logging
   */
  constructor() {
    super();
    logger.info(`Constructing GetDailyTreasuryStatementTool instance`);
  }

  /**
   * Fetches treasury data for the specified date
   * @param param0 Object containing the date to fetch
   * @returns Treasury data for the specified date
   */
  async execute({ date }: DateInput) {
    logger.info(`GetDailyTreasuryStatementTool.execute called with date: ${date}`);
    try {
      const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance?filter=record_date:eq:${date}`;
      
      // Fetch data from the treasury API
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return formatted data
      return {
        type: "text",
        text: JSON.stringify(data.data, null, 2)
      };
    } catch (error) {
      // Handle errors gracefully
      return {
        type: "text",
        text: `Error fetching treasury data: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

// Create an instance and register it with global registry
logger.info("Creating GetDailyTreasuryStatementTool instance");
const instance = new GetDailyTreasuryStatementTool();

// Register with global registry
logger.info("Registering GetDailyTreasuryStatementTool with global registry");
if (typeof (global as any).__MCP_TOOLS !== 'undefined') {
  (global as any).__MCP_TOOLS.push(instance);
  logger.info(`Added to existing global registry, now has ${(global as any).__MCP_TOOLS.length} tools`);
} else {
  (global as any).__MCP_TOOLS = [instance];
  logger.info("Created new global registry with this tool");
}

// Export the instance as the default export
export default GetDailyTreasuryStatementTool; 