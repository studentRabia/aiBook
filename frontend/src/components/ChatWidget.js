/**
 * ChatWidget Web Component (T038)
 * Main chatbot widget using Shadow DOM for encapsulation.
 * Per research.md Decision 1: Vanilla JS Web Components with Shadow DOM.
 */

class ChatWidget extends HTMLElement {
  constructor() {
    super();

    // Attach Shadow DOM for style encapsulation
    this.attachShadow({ mode: 'open' });

    // Component state
    this.state = {
      isOpen: false,
      sessionId: null,
      messages: [],
      isLoading: false,
      selectedText: null,
      currentPage: null,
      currentChapter: null
    };
  }

  /**
   * Called when element is added to DOM
   * Per T044: Initialize session on widget load
   */
  async connectedCallback() {
    this.render();
    await this.initializeSession();
  }

  /**
   * Initialize conversation session with backend
   * T044: Call POST /api/v1/sessions on initialization
   */
  async initializeSession() {
    try {
      const textbookId = this.getAttribute('textbook-id') || 'robotics-101';

      // Import API service dynamically
      const { apiService } = await import('../services/api.js');

      const session = await apiService.createSession(textbookId);
      this.state.sessionId = session.session_id;

      console.log('[ChatWidget] Session initialized:', this.state.sessionId);
    } catch (error) {
      console.error('[ChatWidget] Failed to initialize session:', error);
      this.showError('Failed to connect to chatbot. Please refresh the page.');
    }
  }

  /**
   * Render component structure
   */
  render() {
    // Import CSS (will be created in T047)
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/src/styles/chat.css';

    // Component HTML structure
    this.shadowRoot.innerHTML = `
      <div class="chatbot-container ${this.state.isOpen ? 'open' : 'closed'}">
        <!-- Toggle Button (T039) -->
        <toggle-button class="chat-toggle"></toggle-button>

        <!-- Chat Panel -->
        <div class="chat-panel" style="display: ${this.state.isOpen ? 'flex' : 'none'}">
          <!-- Header -->
          <div class="chat-header">
            <h3>Robotics Textbook Assistant</h3>
            <button class="close-button" aria-label="Close chat">×</button>
          </div>

          <!-- Message List (T040) -->
          <message-list class="chat-messages"></message-list>

          <!-- Input Box (T041) -->
          <input-box class="chat-input"></input-box>

          <!-- Loading Indicator (T048) -->
          <div class="loading-indicator" style="display: none">
            <div class="spinner"></div>
            <span>Thinking...</span>
          </div>
        </div>
      </div>
    `;

    // Append styles
    this.shadowRoot.appendChild(style);

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Attach event listeners to child components
   */
  attachEventListeners() {
    // Toggle button click (T046)
    const toggleButton = this.shadowRoot.querySelector('toggle-button');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.toggleChat());
    }

    // Close button click
    const closeButton = this.shadowRoot.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.toggleChat());
    }

    // Input box message send (T045)
    const inputBox = this.shadowRoot.querySelector('input-box');
    if (inputBox) {
      inputBox.addEventListener('send-message', (event) => {
        this.handleSendMessage(event.detail);
      });
    }
  }

  /**
   * Toggle chat panel open/close (T046)
   * Per FR-012: Preserve scroll position in textbook
   */
  toggleChat() {
    this.state.isOpen = !this.state.isOpen;

    const container = this.shadowRoot.querySelector('.chatbot-container');
    const panel = this.shadowRoot.querySelector('.chat-panel');

    if (this.state.isOpen) {
      container.classList.add('open');
      container.classList.remove('closed');
      panel.style.display = 'flex';

      // Focus input when opening
      const inputBox = this.shadowRoot.querySelector('input-box');
      if (inputBox) {
        inputBox.focus();
      }
    } else {
      container.classList.add('closed');
      container.classList.remove('open');
      panel.style.display = 'none';
    }
  }

  /**
   * Handle message send from input box (T045)
   * @param {Object} detail - { message, queryMode }
   */
  async handleSendMessage(detail) {
    if (!this.state.sessionId) {
      this.showError('Session not initialized. Please refresh the page.');
      return;
    }

    const { message, queryMode } = detail;

    // Add user message to list
    this.addMessage({
      type: 'user',
      text: message,
      timestamp: new Date()
    });

    // Show loading indicator
    this.setLoading(true);

    try {
      // Import API service
      const { apiService } = await import('../services/api.js');

      // Prepare request
      const request = {
        session_id: this.state.sessionId,
        message: message,
        query_mode: queryMode || 'general',
        context: {
          current_page: this.state.currentPage,
          current_chapter: this.state.currentChapter
        }
      };

      // Add selected text if in SELECTED_TEXT mode
      if (queryMode === 'selected_text' && this.state.selectedText) {
        request.selected_text = this.state.selectedText;
      }

      // Send message to backend
      const response = await apiService.sendMessage(request);

      // Add chatbot response to list
      this.addMessage({
        type: 'chatbot',
        text: response.response,
        sources: response.sources,
        isOutOfScope: response.is_out_of_scope,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('[ChatWidget] Failed to send message:', error);
      this.showError('Failed to get response. Please try again.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Add message to message list
   * @param {Object} message - Message data
   */
  addMessage(message) {
    this.state.messages.push(message);

    const messageList = this.shadowRoot.querySelector('message-list');
    if (messageList) {
      messageList.addMessage(message);
    }
  }

  /**
   * Set loading state (T048)
   * @param {boolean} isLoading - Loading state
   */
  setLoading(isLoading) {
    this.state.isLoading = isLoading;

    const loadingIndicator = this.shadowRoot.querySelector('.loading-indicator');
    const inputBox = this.shadowRoot.querySelector('input-box');

    if (loadingIndicator) {
      loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    }

    if (inputBox) {
      inputBox.disabled = isLoading;
    }
  }

  /**
   * Show error message
   * @param {string} errorText - Error message
   */
  showError(errorText) {
    this.addMessage({
      type: 'error',
      text: errorText,
      timestamp: new Date()
    });
  }

  /**
   * Set selected text from textbook (T043)
   * @param {string} text - Selected text
   */
  setSelectedText(text) {
    this.state.selectedText = text;
  }

  /**
   * Set current reading context
   * @param {Object} context - { page, chapter }
   */
  setContext(context) {
    this.state.currentPage = context.page;
    this.state.currentChapter = context.chapter;
  }
}

// Register custom element
customElements.define('chatbot-widget', ChatWidget);

export default ChatWidget;
