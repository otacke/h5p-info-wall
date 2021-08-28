import "./h5p-info-wall-content.scss";

import InfoWallPanel from './h5p-info-wall-panel';
import InfoWallTitlebar from './h5p-info-wall-titlebar';
import Dictionary from './h5p-info-wall-dictionary';

export default class InfoWallContent {
  /**
   * @constructor
   * @param {object} params Parameters passed by the editor.
   */
  constructor(params = {}) {
    this.params = params;

    this.content = document.createElement('div');
    this.content.classList.add('h5p-info-wall-content');

    // Determine searchable ids according to properties
    const searchablePropertyIds = this.params.properties
      .reduce((ids, property, index) => {
        return property.showLabel ? [...ids, index] : ids;
      }, []);

    // Determine if filter field shold be set
    const offerFilterField = params.offerFilterField &&
      searchablePropertyIds.length &&
      this.params.properties.length &&
      this.params.panels.length;

    // Append header
    if (params.headerText || offerFilterField) {
      const titlebar = new InfoWallTitlebar(
        {
          headerText: this.params.headerText,
          searchBox: offerFilterField
        },
        {
          onSearchChange: (query) => {
            this.handleSearchChange(query);
          }
        }
      );

      this.content.appendChild(titlebar.getDOM());
    }

    // Message field
    this.message = document.createElement('div');
    this.message.classList.add('h5p-info-wall-message');
    this.message.classList.add('h5p-info-wall-display-none');
    this.content.appendChild(this.message);

    if (!this.params.properties.length || !this.params.panels.length) {
      this.message.innerText = Dictionary.get('noEntriesError');
      this.message.classList.remove('h5p-info-wall-display-none');
      return; // No content to display
    }

    // Append panels
    this.panels = [];
    this.params.panels.forEach(panelParams => {
      const image = panelParams.image.params.file && panelParams.image.params.file.path ?
        panelParams.image :
        this.params.fallbackImage;

      // Prepare entries
      const entries = panelParams.entries.map((entry, index) => {
        return {
          label: this.params.properties[index].showLabel ?
            this.params.properties[index].label :
            null,
          text: entry,
          searchable: this.params.properties[index].searchInProperty,
          styling: {
            bold: this.params.properties[index].styling.bold,
            italic: this.params.properties[index].styling.italic
          }
        };
      });

      // Create panel
      const panel = new InfoWallPanel({
        image: image,
        imageSize: this.params.imageSize,
        entries: entries,
        contentId: this.params.contentId
      });
      this.panels.push(panel);
      this.content.appendChild(panel.getDOM());
    });

  }

  /**
   * Get content DOM element.
   * @return {HTMLElement} Content DOM element.
   */
  getDOM() {
    return this.content;
  }

  /**
   * Handle search query changed in search box.
   * @param {string} query Query text.
   */
  handleSearchChange(query) {
    let visible = 0;

    // Query box emptied
    if (query === '') {
      visible = this.panels.length;
      this.message.classList.add('h5p-info-wall-display-none');

      this.panels.forEach(panel => {
        panel.show();
      });
      return;
    }

    // Hide panels if they don't contain the query
    this.panels.forEach(panel => {
      if (panel.contains(query)) {
        visible++;
        panel.show();
      }
      else {
        panel.hide();
      }
    });

    // Display no matches message
    if (visible === 0) {
      this.message.classList.remove('h5p-info-wall-display-none');
      this.message.innerHTML = Dictionary
        .get('noMatchesForFilter')
        .replace(/@query/g, `<span class="h5p-info-wall-query-text">${query}</span>`);
    }
    else {
      this.message.classList.add('h5p-info-wall-display-none');
    }
  }
}
