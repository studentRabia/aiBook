/**
 * ToggleButton Web Component (T039)
 * Chat toggle button with state management for isOpen.
 */

class ToggleButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.state = {
      isOpen: false
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
        }

        .toggle-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .toggle-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .toggle-button:active {
          transform: scale(0.95);
        }

        .toggle-button svg {
          width: 28px;
          height: 28px;
          fill: white;
        }

        /* Tablet */
        @media (max-width: 768px) {
          .toggle-button {
            width: 56px;
            height: 56px;
            bottom: 20px;
            right: 20px;
          }

          .toggle-button svg {
            width: 24px;
            height: 24px;
          }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .toggle-button {
            width: 50px;
            height: 50px;
            bottom: 16px;
            right: 16px;
          }

          .toggle-button svg {
            width: 22px;
            height: 22px;
          }
        }
      </style>

      <button class="toggle-button" aria-label="Toggle chatbot" title="Ask a question">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <!-- Chat bubble icon -->
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          <circle cx="12" cy="10" r="1.5"/>
          <circle cx="8" cy="10" r="1.5"/>
          <circle cx="16" cy="10" r="1.5"/>
        </svg>
      </button>
    `;
  }

  attachEventListeners() {
    const button = this.shadowRoot.querySelector('.toggle-button');
    button.addEventListener('click', () => {
      this.state.isOpen = !this.state.isOpen;
      this.dispatchEvent(new CustomEvent('toggle', {
        detail: { isOpen: this.state.isOpen },
        bubbles: true,
        composed: true
      }));
    });
  }

  /**
   * Update button state (called by parent ChatWidget)
   * @param {boolean} isOpen - Whether chat is open
   */
  setOpen(isOpen) {
    this.state.isOpen = isOpen;
  }
}

customElements.define('toggle-button', ToggleButton);

export default ToggleButton;
