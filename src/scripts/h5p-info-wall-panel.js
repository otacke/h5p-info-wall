import "./h5p-info-wall-panel.scss";

import Dictionary from './h5p-info-wall-dictionary';
import Util from './h5p-info-wall-util';

export default class InfoWallPanel {
  /**
   * @constructor
   * @param {object} params Parameters passed by the editor.
   */
  constructor(params = {}) {
    this.params = params;

    this.visible = true;

    // Panel
    this.panel = document.createElement('div');
    this.panel.classList.add('h5p-info-wall-panel');
    this.panel.setAttribute('aria-hidden', true);

    const entriesWrapper = document.createElement('div');
    entriesWrapper.classList.add('h5p-info-wall-panel-entries-wrapper');
    this.panel.appendChild(entriesWrapper);

    // Entries
    const entries = document.createElement('table');
    entries.classList.add('h5p-info-wall-panel-entries');
    entriesWrapper.appendChild(entries);

    let a11yEntrySegment = [];

    params.entries.forEach(entry => {
      if (Util.htmlDecode(entry.text).trim() === '') {
        return; // No entry
      }

      const entryWrapper = document.createElement('tr');
      entryWrapper.classList.add('h5p-info-wall-panel-entry');

      // Styling
      if (entry.styling.bold) {
        entryWrapper.classList.add('bold');
      }
      if (entry.styling.italic) {
        entryWrapper.classList.add('italic');
      }

      // Label
      if (entry.label) {
        const entryLabel = document.createElement('td');
        entryLabel.classList.add('h5p-info-wall-panel-entry-label');
        entryLabel.innerText = entry.label;
        entryWrapper.appendChild(entryLabel);

        a11yEntrySegment.push(`${Util.stripHTML(entry.label.replace(/\n/g, ''))}:`);
      }

      // Text
      const entryText = document.createElement('td');
      if (!entry.label) {
        entryText.setAttribute('colspan', 2);
      }
      entryText.classList.add('h5p-info-wall-panel-entry-text');
      entryText.innerHTML = entry.text;
      entryWrapper.appendChild(entryText);

      entries.appendChild(entryWrapper);

      a11yEntrySegment.push(`${Util.stripHTML(entry.text.replace(/\n/g, ''))}.`);
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
        a11yEntrySegment.push(`${Dictionary.get('image')}: ${image.alt}.`);
      }
      if (params.image.params.title) {
        image.title = params.image.params.title;
      }
      this.imageWrapperInner.appendChild(image);
    }

    this.a11yListItem = document.createElement('li');
    this.a11yListItem.classList.add('h5p-info-wall-panel-a11y-list-item');
    this.a11yListItem.innerText = a11yEntrySegment.join(' ');
  }

  /**
   * Get panel DOM element.
   * @return {HTMLElement} Panel DOM element.
   */
  getDOM() {
    return this.panel;
  }

  /**
   * Get a11y List Item.
   * @return {HTMLElement} List item for a11y representation.
   */
  getListItem() {
    return this.a11yListItem;
  }

  /**
   * Check whether searchable panel content contains query.
   * @param {string} Query.
   * @return {boolean} True, if searchable panel content contains query.
   */
  contains(query) {
    return this.params.entries
      .filter(entry => entry.searchable)
      .some(entry => {
        const plainText = Util.htmlDecode(entry.text).toLowerCase();
        return plainText.indexOf(query.toLowerCase()) !== -1;
      });
  }

  /**
   * Show panel.
   */
  show() {
    this.panel.classList.remove('h5p-info-wall-display-none');
    this.a11yListItem.classList.remove('h5p-info-wall-display-none');
    this.visible = true;
  }

  /**
   * Hide panel.
   */
  hide() {
    this.visible = false;
    this.panel.classList.add('h5p-info-wall-display-none');
    this.a11yListItem.classList.add('h5p-info-wall-display-none');
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
   * @return {boolean} True, if panel is visible. Else false.
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
