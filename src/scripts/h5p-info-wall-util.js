/** Class for utility functions */
export default class Util {
  /**
   * Extend an array just like JQuery's extend.
   * @param {object} arguments Objects to be merged.
   * @return {object} Merged objects.
   */
  static extend() {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
            this.extend(arguments[0][key], arguments[i][key]);
          }
          else {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
    }
    return arguments[0];
  }

  /**
   * Retrieve true string from HTML encoded string.
   * @param {string} input Input string.
   * @return {string} Output string.
   */
  static htmlDecode(input) {
    const dparser = new DOMParser().parseFromString(input, 'text/html');
    return dparser.documentElement.textContent;
  }

  /**
   * Retrieve string without HTML tags.
   * @param {string} input Input string.
   * @param {string[]} deleteTags Tags to delete. Rest will be kept.
   * @return {string} Output string.
   */
  static stripHTML(html, deleteTags = []) {
    const div = document.createElement('div');
    div.innerHTML = html;

    if (!Array.isArray(deleteTags)) {
      deleteTags = (typeof deleteTags === 'string') ? [deleteTags] : [];
    }

    if (!deleteTags.length) {
      return div.textContent || div.innerText || '';
    }

    // Delete specified tags only
    deleteTags.forEach(tag => {
      const elements = div.getElementsByTagName(tag);
      let i = elements.length;
      while (i--) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    });

    return div.innerHTML;
  }
}
