import InfoWallContent from '@scripts/h5p-info-wall-content.js';
import Dictionary from '@services/dictionary.js';
import Util from '@services/util.js';
import '@styles/h5p-info-wall.scss';

export default class InfoWall extends H5P.EventDispatcher {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   */
  constructor(params, contentId) {
    super();

    // Defaults
    this.params = Util.extend({
      propertiesGroup: {
        properties: [],
      },
      panels: [],
      behaviour: {
        useFallbackImage: false,
        imageWidth: 150,
        imageHeight: 150,
        offerFilterField: true,
        modeFilterField: 'or',
        alternateBackground: true,
      },
      l10n: {
        'noEntriesError': 'The author did not enter anything.',
        'noMatchesForFilter': 'There are not matches for @query.',
        'enterToFilter': 'Enter a query to filter the content for relevant entries.',
        'listChanged': 'List changed. Showing @visible of @total items.',
      },
    }, params.infoWall);

    this.contentId = contentId;

    // Fill dictionary
    this.dictionary = new Dictionary();
    this.dictionary.fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    // Remove empty panels
    this.params.panels = this.params.panels.filter((panel) => {
      return panel.entries.some((entry) => entry.trim() !== '');
    });

    // Set fallback image
    const fallbackImage = (
      this.params.behaviour.useFallbackImage &&
      this.params.behaviour.fallbackImage?.params?.file?.path
    ) ?
      this.params.behaviour.fallbackImage :
      null;

    // Create content
    this.content = new InfoWallContent(
      {
        dictionary: this.dictionary,
        headerText: this.params.header,
        fallbackImage: fallbackImage,
        offerFilterField: this.params.behaviour.offerFilterField,
        modeFilterField: this.params.behaviour.modeFilterField,
        panels: this.params.panels,
        properties: this.params.propertiesGroup.properties,
        contentId: this.contentId,
        imageSize: {
          width: this.params.behaviour.imageWidth,
          height: this.params.behaviour.imageHeight,
        },
        alternateBackground: this.params.behaviour.alternateBackground,
      },
      {
        onResized: () => {
          this.trigger('resize');
        },
      },
    );
  }

  /**
   * Attach content to wrapper.
   * @param {H5P.jQuery} $wrapper Content's container.
   */
  attach($wrapper) {
    $wrapper.get(0).classList.add('h5p-info-wall');
    $wrapper.get(0).appendChild(this.content.getDOM());
  }
}
