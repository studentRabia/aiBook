/**
 * Text Selection Detection Service (T043)
 * Captures selected text from textbook for SELECTED_TEXT query mode per FR-007.
 */

class SelectionService {
  constructor() {
    this.currentSelection = null;
    this.listeners = [];
  }

  /**
   * Initialize selection detection
   * Attaches event listeners to document
   */
  initialize() {
    // Listen for text selection changes
    document.addEventListener('mouseup', () => this.handleSelectionChange());
    document.addEventListener('keyup', () => this.handleSelectionChange());
    document.addEventListener('touchend', () => this.handleSelectionChange());

    console.log('[SelectionService] Initialized');
  }

  /**
   * Handle selection change event
   */
  handleSelectionChange() {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      // Store selection data
      this.currentSelection = {
        text: selectedText,
        range: selection.getRangeAt(0),
        timestamp: new Date()
      };

      console.log('[SelectionService] Text selected:', selectedText.substring(0, 50) + '...');

      // Notify listeners
      this.notifyListeners(this.currentSelection);
    } else if (this.currentSelection) {
      // Selection cleared
      this.currentSelection = null;
      this.notifyListeners(null);
    }
  }

  /**
   * Get current selected text
   * @returns {string|null} Selected text or null
   */
  getSelectedText() {
    return this.currentSelection?.text || null;
  }

  /**
   * Check if text is currently selected
   * @returns {boolean} True if text is selected
   */
  hasSelection() {
    return this.currentSelection !== null;
  }

  /**
   * Clear current selection
   */
  clearSelection() {
    this.currentSelection = null;
    window.getSelection()?.removeAllRanges();
  }

  /**
   * Add selection change listener
   * @param {Function} callback - Callback function(selection)
   */
  onSelectionChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove selection change listener
   * @param {Function} callback - Callback to remove
   */
  offSelectionChange(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners of selection change
   * @param {Object|null} selection - Selection data or null
   */
  notifyListeners(selection) {
    this.listeners.forEach(callback => {
      try {
        callback(selection);
      } catch (error) {
        console.error('[SelectionService] Listener error:', error);
      }
    });
  }

  /**
   * Get selection metadata (for context)
   * @returns {Object|null} Selection metadata
   */
  getSelectionMetadata() {
    if (!this.currentSelection) {
      return null;
    }

    const range = this.currentSelection.range;
    const container = range.commonAncestorContainer;

    // Try to find chapter/section context from DOM
    let element = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container;

    // Look for chapter/section markers in parent elements
    let chapter = null;
    let section = null;

    while (element && element !== document.body) {
      // Check for data attributes
      if (element.dataset?.chapter) {
        chapter = element.dataset.chapter;
      }
      if (element.dataset?.section) {
        section = element.dataset.section;
      }

      // Check for heading elements
      if (!chapter && element.tagName?.match(/^H[1-3]$/)) {
        if (element.tagName === 'H1') {
          chapter = element.textContent.trim();
        } else if (element.tagName === 'H2') {
          section = element.textContent.trim();
        }
      }

      element = element.parentElement;
    }

    return {
      chapter,
      section,
      timestamp: this.currentSelection.timestamp
    };
  }

  /**
   * Highlight selected text (visual feedback)
   * @param {string} color - Highlight color
   */
  highlightSelection(color = '#fff3cd') {
    if (!this.currentSelection) {
      return;
    }

    const range = this.currentSelection.range;
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.classList.add('chatbot-highlight');

    try {
      range.surroundContents(span);
    } catch (error) {
      // Range spans multiple elements, fallback to selection API
      console.warn('[SelectionService] Could not highlight complex selection');
    }
  }

  /**
   * Remove all highlights
   */
  removeHighlights() {
    const highlights = document.querySelectorAll('.chatbot-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    });
  }
}

// Export singleton instance
export const selectionService = new SelectionService();

// Export class for testing
export default SelectionService;
