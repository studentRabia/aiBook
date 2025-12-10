/**
 * Frontend Entry Point (T049)
 * Imports and registers all Web Components.
 * Initializes services for text selection detection.
 */

// Import Web Components
import './components/ChatWidget.js';
import './components/ToggleButton.js';
import './components/MessageList.js';
import './components/InputBox.js';

// Import services
import { selectionService } from './services/selection.js';
import { apiService } from './services/api.js';

/**
 * Initialize chatbot widget
 * Call this function when embedding the widget in a page
 */
export function initChatbot(options = {}) {
  const {
    textbookId = 'robotics-101',
    containerId = null,
    autoInit = true
  } = options;

  console.log('[Chatbot] Initializing...', { textbookId });

  // Initialize selection service
  if (autoInit) {
    selectionService.initialize();
  }

  // Create widget element
  const widget = document.createElement('chatbot-widget');
  widget.setAttribute('textbook-id', textbookId);

  // Append to container or body
  const container = containerId
    ? document.getElementById(containerId)
    : document.body;

  if (!container) {
    console.error('[Chatbot] Container not found:', containerId);
    return null;
  }

  container.appendChild(widget);

  // Connect selection service to widget
  selectionService.onSelectionChange((selection) => {
    if (selection) {
      widget.setSelectedText(selection.text);
    } else {
      widget.setSelectedText(null);
    }
  });

  console.log('[Chatbot] Widget initialized successfully');

  return widget;
}

/**
 * Check if API is available
 * @returns {Promise<boolean>} True if API is healthy
 */
export async function checkAPI() {
  try {
    const health = await apiService.checkHealth();
    console.log('[Chatbot] API health:', health);
    return health.status === 'healthy';
  } catch (error) {
    console.error('[Chatbot] API health check failed:', error);
    return false;
  }
}

// Auto-initialize if data-auto-init attribute is present
if (document.currentScript?.hasAttribute('data-auto-init')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initChatbot();
    });
  } else {
    initChatbot();
  }
}

// Export for embedding
export { apiService, selectionService };
