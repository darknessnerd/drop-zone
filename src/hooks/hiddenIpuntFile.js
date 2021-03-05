import { getElement, uuidv4 } from '@/utils';

/**
 * Create and hidden input file in order to click on the dropzone clickable area
 * and trigger the file selection
 *
 * @param addFile - addFile callback that
 * @param accepts - mine-types array, can be null or empty
 * @param dropzone - root element for the dropzone
 * @param maxFiles - max number of file that can accept the file selection
 * @param hiddenInputContainer - where is create he input hidden field,
 *        can be an element or a valid query string
 * @param clickable - True if the hiddenIputFile need to be created
 * @returns {{}}
 */
export default function useHiddenInputFile({
  addFile,
  accepts,
  dropzone,
  config,
}) {
  let hiddenFileInput;
  let clickableElements = [];
  const triggerClickOnHiddenFileInput = (evt) => {
    if (clickableElements.findIndex((el) => el === evt.target) !== -1) {
      hiddenFileInput.click();
    }
  };
  const setupHiddenFileInput = () => {
    if (hiddenFileInput) {
      hiddenFileInput.parentNode.removeChild(hiddenFileInput);
    }
    hiddenFileInput = document.createElement('input');
    hiddenFileInput.setAttribute('type', 'file');
    if (config.maxFiles === null || config.maxFiles > 1) {
      hiddenFileInput.setAttribute('multiple', 'multiple');
    }
    if (accepts.length > 0) {
      hiddenFileInput.setAttribute('accept', accepts.join(','));
    }
    // TODO - caputure
    // Make sure that no one can tab in this input field.
    hiddenFileInput.setAttribute('tabindex', '-1');
    hiddenFileInput.style.visibility = 'hidden';
    hiddenFileInput.style.position = 'absolute';
    hiddenFileInput.style.top = '0';
    hiddenFileInput.style.left = '0';
    hiddenFileInput.style.height = '0';
    hiddenFileInput.style.width = '0';
    getElement(config.hiddenInputContainer, 'hiddenInputContainer')
      .appendChild(hiddenFileInput);
    hiddenFileInput.addEventListener('change', () => {
      const { files } = hiddenFileInput;
      files.forEach((file) => {
        addFile(uuidv4(), file);
      });
      setupHiddenFileInput();
    });
  };
  const initHiddenFileInput = () => {
    console.debug('initHiddenFileInput');
    if (config.clickable) {
      const message = getElement('.dropzone__message', 'dropzone__message');
      clickableElements = [dropzone.value];
      clickableElements.push(message);
      setupHiddenFileInput();
      clickableElements.forEach((el) => {
        el.classList.add('dropzone-clickable');
        el.addEventListener('click', triggerClickOnHiddenFileInput);
      });
    }
  };
  const destroyHiddenFileInput = () => {
    console.debug('destroyHiddenFileInput');
    // Remove all events
    clickableElements.forEach((el) => {
      el.removeEventListener('click', triggerClickOnHiddenFileInput);
    });
    // Delete the hidden input file
    if (hiddenFileInput) {
      hiddenFileInput.parentElement.removeChild(hiddenFileInput);
      hiddenFileInput = null;
    }
  };
  return { initHiddenFileInput, destroyHiddenFileInput };
}
