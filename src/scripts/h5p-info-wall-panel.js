import './h5p-info-wall-panel.scss';

import Util from '@services/util';

export default class InfoWallPanel {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   */
  constructor(params = {}) {
    this.params = params;

    this.visible = true;

    // Panel
    this.panel = document.createElement('div');
    this.panel.classList.add('h5p-info-wall-panel');

    const entriesWrapper = document.createElement('div');
    entriesWrapper.classList.add('h5p-info-wall-panel-entries-wrapper');

    // Entries
    const entries = document.createElement('div');
    entries.classList.add('h5p-info-wall-panel-entries');
    entriesWrapper.appendChild(entries);

    params.entries.forEach((entry) => {
      if (Util.htmlDecode(entry.text).trim() === '') {
        return; // No entry
      }

      // Label
      if (entry.label) {
        const entryLabel = document.createElement('div');
        entryLabel.classList.add('h5p-info-wall-panel-entry-label');
        // Styling
        if (entry.styling.bold) {
          entryLabel.classList.add('bold');
        }
        if (entry.styling.italic) {
          entryLabel.classList.add('italic');
        }
        entryLabel.innerHTML = entry.label;
        entries.appendChild(entryLabel);
      }

      // Text
      const entryText = document.createElement('div');
      if (!entry.label) {
        entryText.style.gridColumnStart = 1;
        entryText.style.gridColumnEnd = 'span 2';
      }
      // Styling
      if (entry.styling.bold) {
        entryText.classList.add('bold');
      }
      if (entry.styling.italic) {
        entryText.classList.add('italic');
      }
      entryText.classList.add('h5p-info-wall-panel-entry-text');
      entryText.innerHTML = entry.text;
      entries.appendChild(entryText);

      this.panel.appendChild(entriesWrapper);
    });

    // Image wrapper, always set to keep uniform layout
    this.imageWrapper = document.createElement('div');
    this.imageWrapper.classList.add('h5p-info-wall-panel-image-wrapper-outer');
    this.imageWrapper.style.width = `${params.imageSize.width}px`;
    this.imageWrapper.style.height = `${params.imageSize.height}px`;
    this.panel.appendChild(this.imageWrapper);

    // Image
    if (params.image) {
      // Blurred background image filling background
      this.backgroundImage = document.createElement('img');
      this.backgroundImage.classList.add('h5p-info-wall-panel-image-background');
      this.backgroundImage.setAttribute('aria-hidden', 'true');
      this.backgroundImage.src = H5P.getPath(params.image.params.file.path, params.contentId);
      this.backgroundImage.style.width = `${params.imageSize.width}px`;
      this.backgroundImage.style.height = `${params.imageSize.height}px`;
      this.imageWrapper.appendChild(this.backgroundImage);

      // Image centered relative to outer wrapper
      this.imageWrapperInner = document.createElement('div');
      this.imageWrapperInner.classList.add('h5p-info-wall-panel-image-wrapper-inner');
      this.imageWrapper.appendChild(this.imageWrapperInner);

      const image = document.createElement('img');
      image.classList.add('h5p-info-wall-panel-image');
      image.addEventListener('load', () => {
        this.handleImageLoaded(image);
      });
      image.src = H5P.getPath(params.image.params.file.path, params.contentId);
      if (params.image.params.alt) {
        image.alt = params.image.params.alt;
      }
      if (params.image.params.title) {
        image.title = params.image.params.title;
      }
      this.imageWrapperInner.appendChild(image);
    }
  }

  /**
   * Get panel DOM element.
   * @returns {HTMLElement} Panel DOM element.
   */
  getDOM() {
    return this.panel;
  }

  /**
   * Check whether searchable panel content contains some query word.
   * @param {string} query Query string.
   * @returns {boolean} True, if searchable panel content contains query word.
   */
  contains(query) {
    query = query.toLowerCase();

    const plainText = this.params.entries
      .filter((entry) => entry.searchable)
      .reduce((plainText, entry) => {
        return `${plainText}${Util.htmlDecode(entry.text).toLowerCase()}`;
      }, this.params.keywords || '');

    const words = query.split(' ').filter((word) => word.trim() !== '');

    // Check for exact matches
    const searchMethod = this.params.modeFilterField === 'and' ?
      'every' :
      'some';

    if (words[searchMethod]((word) => plainText.indexOf(word) !== -1)) {
      return true;
    }

    // Check for fuzzy matches
    return words[searchMethod]((word) => {
      return H5P.TextUtilities.fuzzyFind(
        word,
        plainText
      ).contains;
    });
  }

  /**
   * Show panel.
   */
  show() {
    this.panel.classList.remove('h5p-info-wall-display-none');
    this.visible = true;
  }

  /**
   * Hide panel.
   */
  hide() {
    this.visible = false;
    this.panel.classList.add('h5p-info-wall-display-none');
  }

  /**
   * Set background color.
   * @param {boolean} state If true, sets background. If false, removes it.
   */
  setBackground(state) {
    if (typeof state !== 'boolean') {
      return;
    }

    if (state) {
      this.panel.classList.add('h5p-info-wall-background');
    }
    else {
      this.panel.classList.remove('h5p-info-wall-background');
    }
  }

  /**
   * Determine whether the panel is visible.
   * @returns {boolean} True, if panel is visible. Else false.
   */
  isVisible() {
    return this.visible;
  }

  /**
   * Handle image loaded.
   * @param {HTMLElement} image Image element.
   */
  handleImageLoaded(image) {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const wrapperRatio = this.imageWrapper.offsetWidth / this.imageWrapper.offsetHeight;

    // Scale image and background according to settings
    if (imageRatio > wrapperRatio) {
      this.imageWrapperInner.style.width = `${this.imageWrapper.offsetWidth}px`;
      this.imageWrapperInner.style.height = `${image.naturalHeight * this.imageWrapper.offsetWidth / image.naturalWidth}px`;

      this.backgroundImage.style.height = `${this.imageWrapper.offsetHeight}px`;
    }
    else {
      this.imageWrapperInner.style.height = `${this.imageWrapper.offsetHeight}px`;
      this.imageWrapperInner.style.width = `${image.naturalWidth * this.imageWrapper.offsetHeight / image.naturalHeight}px`;

      this.backgroundImage.style.width = `${this.imageWrapper.offsetWidth}px`;
    }
  }
}
