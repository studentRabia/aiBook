/**
 * MessageList Web Component (T040)
 * Display user/chatbot messages with scrolling and visual distinction per FR-019.
 */

class MessageList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.messages = [];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
        }

        .messages-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* User messages - align right, blue */
        .message.user {
          align-self: flex-end;
        }

        .message.user .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 18px 18px 4px 18px;
        }

        /* Chatbot messages - align left, white */
        .message.chatbot {
          align-self: flex-start;
        }

        .message.chatbot .message-bubble {
          background: white;
          color: #1f2937;
          border-radius: 18px 18px 18px 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        /* Error messages - red */
        .message.error .message-bubble {
          background: #fee2e2;
          color: #991b1b;
          border-radius: 18px;
          border-left: 4px solid #dc2626;
        }

        .message-bubble {
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message-metadata {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
          padding: 0 8px;
        }

        .message.user .message-metadata {
          text-align: right;
        }

        /* Sources section */
        .sources {
          margin-top: 8px;
          padding: 8px 12px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 12px;
        }

        .sources-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .source {
          margin: 4px 0;
          padding-left: 12px;
          position: relative;
        }

        .source::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #9ca3af;
        }

        .source-link {
          color: #4f46e5;
          text-decoration: none;
        }

        .source-link:hover {
          text-decoration: underline;
        }

        .out-of-scope {
          font-style: italic;
          color: #6b7280;
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #9ca3af;
          padding: 32px;
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .empty-state-text {
          font-size: 14px;
        }

        /* Scrollbar styles */
        :host::-webkit-scrollbar {
          width: 6px;
        }

        :host::-webkit-scrollbar-track {
          background: transparent;
        }

        :host::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        :host::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      </style>

      <div class="messages-container">
        ${this.messages.length === 0 ? this.renderEmptyState() : this.renderMessages()}
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <div class="empty-state-text">
          Ask me anything about the robotics textbook!
        </div>
      </div>
    `;
  }

  renderMessages() {
    return this.messages.map(msg => this.renderMessage(msg)).join('');
  }

  renderMessage(message) {
    const timeStr = this.formatTime(message.timestamp);

    if (message.type === 'user') {
      return `
        <div class="message user">
          <div class="message-bubble">${this.escapeHtml(message.text)}</div>
          <div class="message-metadata">${timeStr}</div>
        </div>
      `;
    }

    if (message.type === 'chatbot') {
      const sourcesHtml = message.sources && message.sources.length > 0
        ? this.renderSources(message.sources)
        : '';

      const outOfScopeClass = message.isOutOfScope ? ' out-of-scope' : '';

      return `
        <div class="message chatbot">
          <div class="message-bubble${outOfScopeClass}">
            ${this.escapeHtml(message.text)}
          </div>
          ${sourcesHtml}
          <div class="message-metadata">${timeStr}</div>
        </div>
      `;
    }

    if (message.type === 'error') {
      return `
        <div class="message error">
          <div class="message-bubble">${this.escapeHtml(message.text)}</div>
          <div class="message-metadata">${timeStr}</div>
        </div>
      `;
    }

    return '';
  }

  renderSources(sources) {
    const sourceItems = sources.map(source => `
      <div class="source">
        <strong>${source.chapter}</strong>
        ${source.section ? ` > ${source.section}` : ''}
        ${source.page_number ? ` (p. ${source.page_number})` : ''}
      </div>
    `).join('');

    return `
      <div class="sources">
        <div class="sources-title">📚 Sources:</div>
        ${sourceItems}
      </div>
    `;
  }

  /**
   * Add new message to list
   * @param {Object} message - Message data
   */
  addMessage(message) {
    this.messages.push(message);
    this.render();
    this.scrollToBottom();
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom() {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      this.scrollTop = this.scrollHeight;
    }, 0);
  }

  /**
   * Format timestamp
   * @param {Date} timestamp - Message timestamp
   * @returns {string} Formatted time string
   */
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('message-list', MessageList);

export default MessageList;
