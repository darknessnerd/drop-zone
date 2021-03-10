import { getElement, uuidv4 } from '@/utils';

/**
 * Create and hidden input file in order to click on the dropzone clickable area
 * and trigger the file selection
 *
 * @returns {{
 *      initHiddenFileInput: initHiddenFileInput,
 *      destroyHiddenFileInput: destroyHiddenFileInput
 * }}
 */
export default function useHiddenInputFile() {
  let hiddenFileInput;
  let clickableElements = [];
  const triggerClickOnHiddenFileInput = (evt) => {
    if (clickableElements.findIndex((el) => el === evt.target) !== -1) {
      hiddenFileInput.click();
    }
  };
  const setMultiple = (multiple) => {
    if (hiddenFileInput && multiple) {
      hiddenFileInput.setAttribute('multiple', 'multiple');
    } else if (hiddenFileInput && !multiple) {
      hiddenFileInput.removeAttribute('multiple');
    }
  };
  const setupHiddenFileInput = ({ config, addFile, accepts }) => {
    if (hiddenFileInput) {
      hiddenFileInput.parentNode.removeChild(hiddenFileInput);
    }
    hiddenFileInput = document.createElement('input');
    hiddenFileInput.setAttribute('type', 'file');
    if (config.maxFiles === null || config.maxFiles > 1) {
      setMultiple(true);
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
      setupHiddenFileInput({ config, addFile, accepts });
    });
  };
  /**
   *
   * Create the hidden input file
   *
   * @param config - dropzone props
   * @param dropzone - element ref
   * @param addFile - callback that add a new file
   * @param accepts - mine-types array, can be null or empty
   */
  const initHiddenFileInput = ({
    config, dropzone, addFile, accepts,
  }) => {
    console.debug('initHiddenFileInput');
    if (config.clickable) {
      const message = getElement('.dropzone__message', 'dropzone__message');
      clickableElements = [dropzone.value];
      clickableElements.push(message);
      setupHiddenFileInput({ config, addFile, accepts });
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
  return { initHiddenFileInput, destroyHiddenFileInput, setMultiple };
}
