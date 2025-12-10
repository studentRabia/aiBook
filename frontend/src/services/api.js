/**
 * API Client Service (T042)
 * Fetch wrappers for backend API communication with error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Create a new conversation session
   * POST /api/v1/sessions
   *
   * @param {string} textbookId - Textbook identifier
   * @param {string} userId - Optional user identifier
   * @returns {Promise<Object>} Session data with session_id
   */
  async createSession(textbookId = 'robotics-101', userId = null) {
    try {
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textbook_id: textbookId,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] Create session failed:', error);
      throw this.wrapError(error, 'Failed to create session');
    }
  }

  /**
   * Send a chat message
   * POST /api/v1/chat
   *
   * @param {Object} request - Chat request
   * @param {string} request.session_id - Session ID
   * @param {string} request.message - User message
   * @param {string} request.query_mode - "general" or "selected_text"
   * @param {string} [request.selected_text] - Selected text (if query_mode=selected_text)
   * @param {Object} [request.context] - User context (page, chapter)
   * @returns {Promise<Object>} Chat response with answer and sources
   */
  async sendMessage(request) {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] Send message failed:', error);
      throw this.wrapError(error, 'Failed to send message');
    }
  }

  /**
   * Get session details
   * GET /api/v1/sessions/{session_id}
   *
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session details with messages
   */
  async getSession(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] Get session failed:', error);
      throw this.wrapError(error, 'Failed to retrieve session');
    }
  }

  /**
   * Get session message history
   * GET /api/v1/sessions/{session_id}/messages
   *
   * @param {string} sessionId - Session ID
   * @param {number} limit - Maximum messages to return
   * @param {number} offset - Pagination offset
   * @returns {Promise<Array>} List of messages
   */
  async getMessages(sessionId, limit = 50, offset = 0) {
    try {
      const url = new URL(`${this.baseURL}/sessions/${sessionId}/messages`);
      url.searchParams.append('limit', limit);
      url.searchParams.append('offset', offset);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] Get messages failed:', error);
      throw this.wrapError(error, 'Failed to retrieve messages');
    }
  }

  /**
   * Delete (deactivate) a session
   * DELETE /api/v1/sessions/{session_id}
   *
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async deleteSession(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      // 204 No Content - no response body
      return;
    } catch (error) {
      console.error('[API] Delete session failed:', error);
      throw this.wrapError(error, 'Failed to delete session');
    }
  }

  /**
   * Check API health
   * GET /api/v1/health
   *
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      console.error('[API] Health check failed:', error);
      throw this.wrapError(error, 'Failed to check API health');
    }
  }

  /**
   * Handle error responses from API
   * @param {Response} response - Fetch response
   * @returns {Promise<Error>} Formatted error
   */
  async handleErrorResponse(response) {
    try {
      const errorData = await response.json();

      return new Error(
        errorData.message ||
        errorData.error ||
        `API error: ${response.status} ${response.statusText}`
      );
    } catch {
      // If response body is not JSON
      return new Error(`API error: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Wrap error with user-friendly message
   * @param {Error} error - Original error
   * @param {string} fallbackMessage - Fallback message
   * @returns {Error} Wrapped error
   */
  wrapError(error, fallbackMessage) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(fallbackMessage);
  }
}

// Export singleton instance
export const apiService = new APIService();

// Export class for testing
export default APIService;
