import InfoWallPanel from '@scripts/h5p-info-wall-panel.js';
import InfoWallTitlebar from '@scripts/h5p-info-wall-titlebar.js';
import './h5p-info-wall-content.scss';

export default class InfoWallContent {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   */
  constructor(params = {}) {
    this.params = params;

    this.content = document.createElement('div');
    this.content.classList.add('h5p-info-wall-content');

    // Determine searchable ids according to properties
    const searchablePropertyIds = this.params.properties
      .reduce((ids, property, index) => {
        return property.searchInProperty ? [...ids, index] : ids;
      }, []);

    const hasKeywords = this.params.panels.some((panel) => {
      return panel.keywords && panel.keywords !== '';
    });

    // Determine if filter field shold be set
    const offerFilterField = params.offerFilterField &&
      (searchablePropertyIds.length || hasKeywords) &&
      this.params.properties.length &&
      this.params.panels.length;

    // Append header
    if (params.headerText || offerFilterField) {
      const titlebar = new InfoWallTitlebar(
        {
          headerText: this.params.headerText,
          searchBox: offerFilterField,
          dictionary: this.params.dictionary
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
      this.message.innerText = this.params.dictionary.get('noEntriesError');
      this.message.classList.remove('h5p-info-wall-display-none');
      return; // No content to display
    }

    // Set image size to 0/0 if no images are set
    const imageSize = (this.params.panels.some((panel) => panel?.image?.params?.file?.path)) ?
      this.params.imageSize :
      { width: 0, height: 0 };

    const panelsWrapper = document.createElement('div');
    panelsWrapper.classList.add('h5p-info-wall-panels-wrapper');

    // Append panels
    this.panels = [];
    this.params.panels.forEach((panelParams) => {
      const image = panelParams?.image?.params?.file?.path ?
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
        imageSize: imageSize,
        entries: entries,
        keywords: panelParams.keywords,
        contentId: this.params.contentId,
        modeFilterField: this.params.modeFilterField
      });
      this.panels.push(panel);
      panelsWrapper.appendChild(panel.getDOM());
    });

    this.visiblePanels = this.panels.length;
    this.visiblePanelsBefore = this.panels.length;

    this.content.appendChild(panelsWrapper);

    // Field for reading to screenreader
    this.readField = document.createElement('div');
    this.readField.setAttribute('aria-live', 'polite');
    this.readField.classList.add('h5p-info-wall-hidden-read');
    this.content.appendChild(this.readField);

    this.handlePanelsFiltered();
  }

  /**
   * Get content DOM element.
   * @returns {HTMLElement} Content DOM element.
   */
  getDOM() {
    return this.content;
  }

  /**
   * Read text to screenreader.
   * @param {string} text Text to read (politely).
   */
  read(text) {
    if (this.readText) {
      const fullstop = this.readText.substr(-1, 1) === '.' ? '' : '.';
      this.readText = `${this.readText}${fullstop} ${text}`;
    }
    else {
      this.readText = text;
    }

    this.readField.innerHTML = this.readText;

    setTimeout(() => {
      // Stop combining when done reading
      this.readText = null;
      this.readField.innerHTML = '';
    }, 100);
  }

  /**
   * Announce change of number of visible panels.
   */
  announceChange() {
    if (this.visiblePanelsBefore !== this.visiblePanels) {
      clearTimeout(this.readTimeout);
      this.readTimeout = setTimeout(() => {
        this.read(
          this.params.dictionary.get('listChanged')
            .replace('@visible', this.visiblePanels)
            .replace('@total', this.panels.length)
        );
      }, 500);
    }
    this.visiblePanelsBefore = this.visiblePanels;
  }

  /**
   * Handle panel filtered.
   */
  handlePanelsFiltered() {
    if (this.params.alternateBackground) {
      let background = false;

      this.panels.forEach((panel) => {
        if (panel.isVisible()) {
          panel.setBackground(background);
          background = !background;
        }
      });
    }
  }

  /**
   * Handle search query changed in search box.
   * @param {string} query Query text.
   */
  handleSearchChange(query) {
    this.visiblePanels = 0;

    // Query box emptied
    if (query === '') {
      this.visiblePanels = this.panels.length;
      this.message.classList.add('h5p-info-wall-display-none');

      this.panels.forEach((panel) => {
        panel.show();
      });

      this.handlePanelsFiltered();
      this.announceChange();

      return;
    }

    // Hide panels if they don't contain the query
    this.panels.forEach((panel) => {
      if (panel.contains(query)) {
        this.visiblePanels++;
        panel.show();
      }
      else {
        panel.hide();
      }
    });

    // Display no matches message
    if (this.visiblePanels === 0) {
      this.message.classList.remove('h5p-info-wall-display-none');
      this.message.innerHTML = this.params.dictionary
        .get('noMatchesForFilter')
        .replace(/@query/g, `<span class="h5p-info-wall-query-text">${query}</span>`);
    }
    else {
      this.message.classList.add('h5p-info-wall-display-none');
      this.handlePanelsFiltered();
    }

    this.announceChange();
  }
}
