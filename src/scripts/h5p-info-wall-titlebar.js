import './h5p-info-wall-titlebar.scss';

export default class InfoWallTitlebar {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {object} callbacks Callbacks.
   * @param {function} callbacks.onSearchChange Search changed callback.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = params;

    this.callbacks = callbacks;
    this.callbacks.onSearchChange = this.callbacks.onSearchChange || (() => {});

    // Titlebar
    this.titlebar = document.createElement('div');
    this.titlebar.classList.add('h5p-info-wall-titlebar');

    // Header
    const header = document.createElement('div');
    header.classList.add('h5p-info-wall-header');
    if (params.headerText) {
      const h1 = document.createElement('div');
      h1.classList.add('h5p-info-wall-header-text');
      h1.innerHTML = params.headerText;
      header.appendChild(h1);
    }
    this.titlebar.appendChild(header);

    // Search box
    if (params.searchBox) {
      const icon = document.createElement('div');
      icon.classList.add('h5p-info-wall-searchbox-icon');
      this.titlebar.appendChild(icon);

      const searchBox = document.createElement('input');
      searchBox.classList.add('h5p-info-wall-searchbox');
      searchBox.setAttribute(
        'aria-label', this.params.dictionary.get('l10n.enterToFilter'),
      );
      searchBox.addEventListener('keyup', () => {
        this.callbacks.onSearchChange(searchBox.value);
      });
      this.titlebar.appendChild(searchBox);
    }
  }

  /**
   * Get titlebar DOM element.
   * @returns {HTMLElement} Titlebar DOM element.
   */
  getDOM() {
    return this.titlebar;
  }
}
