import "./h5p-info-wall.scss";
import Dictionary from './h5p-info-wall-dictionary';
import InfoWallContent from './h5p-info-wall-content';
import Util from './h5p-info-wall-util';

export default class InfoWall extends H5P.EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   */
  constructor(params, contentId) {
    super();

    // Defaults
    this.params = Util.extend({
      propertiesGroup: {
        properties: []
      },
      panels: [],
      behaviour: {
        useFallbackImage: false,
        imageWidth: 150,
        imageHeight: 150,
        offerFilterField: true,
        alternateBackground: true
      },
      l10n: {
        'noEntriesError': 'The author did not enter anything.',
        'noMatchesForFilter': 'There are not matches for @query.',
        'enterToFilter': 'Enter a query to filter the content for relevant entries.',
        'listChanged': 'List changed. Showing @visible of @total items.',
        'image': this.params.panels.length &&
          this.params.panels[0]?.image?.params?.contentName || 'Image'
      }
    }, params.infoWall);

    this.contentId = contentId;

    // Fill dictionary
    Dictionary.fill(this.params.l10n);

    // Remove empty panels
    this.params.panels = this.params.panels.filter(panel => {
      return panel.entries.some(entry => entry.trim() !== '');
    });

    // Set fallback image
    const fallbackImage = (
      this.params.behaviour.useFallbackImage &&
      this.params.behaviour.fallbackImage?.params?.file?.path
    ) ?
      this.params.behaviour.fallbackImage :
      null;

    // Create content
    this.content = new InfoWallContent({
      headerText: this.params.header,
      fallbackImage: fallbackImage,
      offerFilterField: this.params.behaviour.offerFilterField,
      panels: this.params.panels,
      properties: this.params.propertiesGroup.properties,
      contentId: this.contentId,
      imageSize: {
        width: this.params.behaviour.imageWidth,
        height: this.params.behaviour.imageHeight
      },
      alternateBackground: this.params.behaviour.alternateBackground
    });
  }

  /**
   * Attach content to wrapper.
   * @param {jQuery} $wrapper Content's container.
   */
  attach($wrapper) {
    $wrapper.get(0).classList.add('h5p-info-wall');
    $wrapper.get(0).appendChild(this.content.getDOM());
  }
}
