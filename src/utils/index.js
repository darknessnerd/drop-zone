// eslint-disable-next-line no-bitwise
const uuidv4 = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g,
  // eslint-disable-next-line no-mixed-operators,no-bitwise
  (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

const getWindowUrl = () => (window.URL !== null ? window.URL : window.webkitURL);
/**
 *
 * Return  element if it's provided a query string or an Element
 *
 * @param el
 * @param name
 * @returns HTMLElement
 * @throws Error - if the element was not found
 */
const getElement = (el, name) => {
  let element;
  if (typeof el === 'string') {
    element = document.querySelector(el);
  } else if (el.nodeType != null) {
    element = el;
  }
  if (element == null) {
    throw new Error(
      `Invalid \`${name}\` option provided. Please provide a CSS selector or a plain HTML element.`,
    );
  }
  return element;
};
const getAllDescendants = (el) => {
  const elements = [];
  console.log(el.children);
  if (el.nodeType !== null) {
    Object.values(el.children).forEach((node) => {
      elements.push(node);
      const children = getAllDescendants(node);
      if (children.length > 0) {
        elements.push(...children);
      }
    });
  }
  return elements;
};
const determineDragAndDropCapable = () => {
  /*
    Create a test element to see if certain events
    are present that let us do drag and drop.
  */
  const div = document.createElement('div');

  /*
    Check to see if the `draggable` event is in the element
    or the `ondragstart` and `ondrop` events are in the element. If
    they are, then we have what we need for dragging and dropping files.

    We also check to see if the window has `FormData` and `FileReader` objects
    present so we can do our AJAX uploading
  */
  return (('draggable' in div)
    || ('ondragstart' in div && 'ondrop' in div))
    && 'FormData' in window
    && 'FileReader' in window;
};
const containsFiles = (e) => {
  if (e.dataTransfer.types) {
    // Because e.dataTransfer.types is an Object in
    // IE, we need to iterate like this instead of
    // using e.dataTransfer.types.some()
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < e.dataTransfer.types.length; i++) {
      if (e.dataTransfer.types[i] === 'Files') return true;
    }
  }
  return false;
};

/**
 *
 * @param e
 */
const noPropagation = (e) => {
  // If there are no files, we don't want to stop
  // propagation so we don't interfere with other
  // drag and drop behaviour.
  if (!containsFiles(e)) {
    return;
  }
  e.stopPropagation();
  if (e.preventDefault) {
    e.preventDefault();
    return;
  }
  e.returnValue = false;
};

/**
 *
 * Convert bytes to string
 *
 * @param size
 * @returns {string}
 */
const fileSizeBase = 1024;
const dictFileSizeUnits = {
  tb: 'TB', gb: 'GB', mb: 'MB', kb: 'KB', b: 'b',
};

const filesize = (size) => {
  let selectedSize = 0;
  let selectedUnit = 'b';
  if (size > 0) {
    const units = ['tb', 'gb', 'mb', 'kb', 'b'];
    for (let i = 0; i < units.length; i += 1) {
      const unit = units[i];
      const cutoff = (fileSizeBase ** (4 - i)) / 10;
      if (size >= cutoff) {
        selectedSize = size / (fileSizeBase ** (4 - i));
        selectedUnit = unit;
        break;
      }
    }
    selectedSize = Math.round(10 * selectedSize) / 10; // Cutting of digits
  }
  return `<strong>${selectedSize}</strong> ${dictFileSizeUnits[selectedUnit]}`;
};
export {
  getWindowUrl,
  uuidv4,
  filesize,
  noPropagation,
  determineDragAndDropCapable,
  getElement,
  getAllDescendants,
};
