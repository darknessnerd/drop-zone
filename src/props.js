export default {
  /**
   * Upload url, if null it will set the window location
   */
  url: {
    type: String,
    default: null,
    validator: (val) => {
      if (val === null) return true;
      try {
        return new URL(val) !== undefined;
      } catch {
        return false;
      }
    },
  },
  /**
   * Upload xhr method can be post or put
   */
  method: {
    type: String,
    default: 'POST',
    validator: (val) => val.toUpperCase() === 'POST' || val.toUpperCase() === 'PUT',
  },
  paramName: {
    type: String,
    default: 'file',
  },
  headers: {
    type: Object,
    default: null,
    validator: (val) => {
      const foundNonValid = Object
        .values(val)
        .find((k) => typeof k !== 'string' && typeof k !== 'number');
      return !foundNonValid;
    },
  },
  xhrTimeout: {
    type: Number,
    default: 60000,
    validator: (val) => val >= 0,
  },
  withCredentials: {
    type: Boolean,
    default: false,
  },
  /**
   * Auto upload on drop item or select items form hiddent input
   */
  uploadOnDrop: {
    type: Boolean,
    default: true,
  },
  /**
   * Retry an upload if it fail
   */
  retryOnError: {
    type: Boolean,
    default: false,
  },
  /**
   * Send more items in one request, this is disabled in case of the prop chunking is
   * active
   */
  multipleUpload: {
    type: Boolean,
    default: false,
  },
  /**
   * Parallel files upload to be process
   */
  parallelUpload: {
    type: Number,
    default: 3,
  },
  /**
   * Max files number accepted by the Dropzone
   */
  maxFiles: {
    type: Number,
    default: null,
  },
  /**
   * Bytes value for the max upload size allowed
   */
  maxFileSize: {
    type: Number,
    default: 1000000,
  },
  /**
   * Element or query selector where the hidden Input it's placed
   */
  hiddenInputContainer: {
    default: 'body',
  },
  /**
   * If active enable the dropzone to be clickable and show the files selection
   */
  clickable: {
    type: Boolean,
    default: true,
  },
  /**
   * Array that contain the accepted files, possibile values:
   * ['image', 'doc', 'video', 'png', ... , 'audio' ]
   * for a full list see: TODO - place a link with the full accepted
   */
  acceptedFiles: {
    type: Array,
    default: null,
  },
  /**
   * Enable the upload chunking feature, if this is active the multipleUpload for request is
   * disabled.
   */
  chunking: {
    type: Boolean,
    default: false,
  },
  /**
   * If the chunking mode is active this property represents the number of
   * chunks with which the file will be split
   */
  numberOfChunks: {
    type: Number,
    default: 10,
  },
};
