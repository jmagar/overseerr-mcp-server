/**
 * Simple session manager to store session-specific data
 */
class SessionManager {
  private sessionData: Map<string, Map<string, any>> = new Map();

  /**
   * Store data for a specific session
   * @param sessionId - Unique session identifier
   * @param key - Key to store the data under
   * @param data - Data to store
   */
  setSessionData(sessionId: string, key: string, data: any): void {
    if (!this.sessionData.has(sessionId)) {
      this.sessionData.set(sessionId, new Map());
    }
    
    const sessionStore = this.sessionData.get(sessionId);
    if (sessionStore) {
      sessionStore.set(key, data);
    }
  }

  /**
   * Retrieve data for a specific session
   * @param sessionId - Unique session identifier
   * @param key - Key to retrieve data for
   * @returns The stored data, or undefined if not found
   */
  getSessionData(sessionId: string, key: string): any {
    const sessionStore = this.sessionData.get(sessionId);
    if (sessionStore) {
      return sessionStore.get(key);
    }
    return undefined;
  }

  /**
   * Clear all data for a specific session
   * @param sessionId - Unique session identifier
   */
  clearSessionData(sessionId: string): void {
    this.sessionData.delete(sessionId);
  }

  /**
   * Clear specific data for a session
   * @param sessionId - Unique session identifier 
   * @param key - Key to clear
   */
  clearSessionKey(sessionId: string, key: string): void {
    const sessionStore = this.sessionData.get(sessionId);
    if (sessionStore) {
      sessionStore.delete(key);
    }
  }
}

// Create a singleton instance
export const sessionManager = new SessionManager(); 