/**
 * InputBox Web Component (T041)
 * Text input with send button, enter key handler, loading state per FR-013.
 */

class InputBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.state = {
      disabled: false,
      value: ''
    };
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 12px 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .input-container {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .textarea-wrapper {
          flex: 1;
          position: relative;
        }

        textarea {
          width: 100%;
          min-height: 40px;
          max-height: 120px;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 20px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          resize: none;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        textarea:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }

        textarea::placeholder {
          color: #9ca3af;
        }

        .char-count {
          position: absolute;
          bottom: -18px;
          right: 8px;
          font-size: 11px;
          color: #9ca3af;
        }

        .char-count.warning {
          color: #f59e0b;
        }

        .char-count.error {
          color: #ef4444;
        }

        .send-button {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .send-button:active:not(:disabled) {
          transform: scale(0.95);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-button svg {
          width: 20px;
          height: 20px;
          fill: white;
        }

        /* Query mode selector */
        .mode-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .mode-option {
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }

        .mode-option:hover {
          border-color: #667eea;
        }

        .mode-option.selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .mode-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          :host {
            padding: 10px 12px;
          }

          textarea {
            font-size: 16px; /* Prevent iOS zoom */
          }

          .send-button {
            width: 38px;
            height: 38px;
          }
        }
      </style>

      <div class="mode-selector">
        <label class="mode-option selected" data-mode="general">
          📖 General Question
        </label>
        <label class="mode-option ${this.hasSelectedText() ? '' : 'disabled'}" data-mode="selected_text">
          🔍 About Selection
        </label>
      </div>

      <div class="input-container">
        <div class="textarea-wrapper">
          <textarea
            placeholder="Ask a question about the textbook..."
            maxlength="2000"
            rows="1"
            ${this.state.disabled ? 'disabled' : ''}
          ></textarea>
          <div class="char-count">0 / 2000</div>
        </div>

        <button class="send-button" aria-label="Send message" ${this.state.disabled ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    `;
  }

  attachEventListeners() {
    const textarea = this.shadowRoot.querySelector('textarea');
    const sendButton = this.shadowRoot.querySelector('.send-button');
    const charCount = this.shadowRoot.querySelector('.char-count');
    const modeOptions = this.shadowRoot.querySelectorAll('.mode-option');

    // Auto-resize textarea on input
    textarea.addEventListener('input', () => {
      this.autoResize(textarea);
      this.updateCharCount(textarea.value.length);
    });

    // Send on Enter (Shift+Enter for newline)
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Send button click
    sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    // Mode selection
    modeOptions.forEach(option => {
      option.addEventListener('click', () => {
        if (!option.classList.contains('disabled')) {
          this.selectMode(option.dataset.mode);
        }
      });
    });
  }

  /**
   * Auto-resize textarea based on content
   * @param {HTMLTextAreaElement} textarea
   */
  autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  /**
   * Update character count display
   * @param {number} count - Current character count
   */
  updateCharCount(count) {
    const charCount = this.shadowRoot.querySelector('.char-count');
    charCount.textContent = `${count} / 2000`;

    // Change color based on count
    charCount.classList.remove('warning', 'error');
    if (count > 1800) {
      charCount.classList.add('error');
    } else if (count > 1500) {
      charCount.classList.add('warning');
    }
  }

  /**
   * Select query mode
   * @param {string} mode - "general" or "selected_text"
   */
  selectMode(mode) {
    const options = this.shadowRoot.querySelectorAll('.mode-option');
    options.forEach(opt => {
      if (opt.dataset.mode === mode) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });
  }

  /**
   * Get selected query mode
   * @returns {string} Current mode
   */
  getSelectedMode() {
    const selected = this.shadowRoot.querySelector('.mode-option.selected');
    return selected ? selected.dataset.mode : 'general';
  }

  /**
   * Send message
   */
  sendMessage() {
    const textarea = this.shadowRoot.querySelector('textarea');
    const message = textarea.value.trim();

    if (!message || this.state.disabled) {
      return;
    }

    const mode = this.getSelectedMode();

    // Validate selected text mode
    if (mode === 'selected_text' && !this.hasSelectedText()) {
      alert('Please select text from the textbook first.');
      return;
    }

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('send-message', {
      detail: {
        message,
        queryMode: mode
      },
      bubbles: true,
      composed: true
    }));

    // Clear input
    textarea.value = '';
    textarea.style.height = 'auto';
    this.updateCharCount(0);
    textarea.focus();
  }

  /**
   * Check if text is selected in parent document
   * @returns {boolean}
   */
  hasSelectedText() {
    // This will be implemented by parent ChatWidget via setSelectedText
    // For now, check if ChatWidget has selectedText
    return false; // Placeholder
  }

  /**
   * Focus the input
   */
  focus() {
    const textarea = this.shadowRoot.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  }

  /**
   * Set disabled state
   * @param {boolean} disabled
   */
  set disabled(disabled) {
    this.state.disabled = disabled;
    const textarea = this.shadowRoot.querySelector('textarea');
    const sendButton = this.shadowRoot.querySelector('.send-button');

    if (textarea) {
      textarea.disabled = disabled;
    }
    if (sendButton) {
      sendButton.disabled = disabled;
    }
  }

  get disabled() {
    return this.state.disabled;
  }
}

customElements.define('input-box', InputBox);

export default InputBox;
