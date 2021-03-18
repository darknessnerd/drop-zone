import {
  reactive,
} from 'vue';
import mineTypes from '@/utils/minetypes';
import STATUS from '@/utils/status';
import useUploadQueue from '@/hooks/uploadQueue';
import useThumbnail from '@/hooks/thumbnail';

export default function useItemManager({ config, context }) {
  const items = reactive({
    ids: [],
    all: {},
  });
  /**
   * callback for thumbnail generation
   *
   * @param itemId - item id
   * @param thumbnail - generated thumbnail
   */
  const thumbnailGenerated = (itemId, thumbnail) => {
    items.all[itemId].thumbnail = thumbnail;
  };
  const {
    enqueueThumbnail,
  } = useThumbnail(thumbnailGenerated);
  // File upload queue feature
  const {
    enqueueFile,
    processQueue,
  } = useUploadQueue({
    config,
    items,
    context,
  });
  /**
   * Remove an uploaded file
   *
   * @param id - file id
   */
  const removeFile = (id) => {
    const index = items.ids.findIndex((idItem) => idItem === id);
    if (index < 0) {
      return;
    }
    items.ids.splice(index, 1);
    const deletedFile = items.all[id];
    delete items.all[id];
    context.emit('removed-file', { file: deletedFile.file, status: deletedFile.status, id });
  };
  /**
   *
   * Check if the file is an accepted
   *
   * @param file
   * @returns {boolean}
   */
  const isValidFile = (file) => {
    if (config.accepts === null || config.accepts.length === 0) {
      return true;
    }
    const fileMineType = file.type;
    let isValid = config.accepts
      .findIndex((validType) => validType.trim() === fileMineType.trim()) !== -1;
    if (!isValid) {
      // Retrieve the extension from the file if it exist
      const splitFileName = file.name.split('.');
      if (splitFileName.length > 1) {
        const ext = splitFileName[splitFileName.length - 1];
        // Retrieve mine-type from extension
        const extMineTypes = mineTypes.data
          .filter((mt) => (
            mt.ext && !!mt.ext.split(/\s/).find((extension) => ext === extension)
          ))
          .map((mediaType) => mediaType.mime_type);
        isValid = !!config.accepts.find((mt) => extMineTypes.find((extMt) => extMt === mt));
      }
    }
    return isValid;
  };
  const addFile = (id, file) => {
    console.debug('addFile', file);
    // Check the size
    console.debug(config.accepts);
    if (config.maxFileSize && file.size > config.maxFileSize) {
      console
        .warn(`ignored file: ${file.name} with size ~= ${(file.size / 1024 / 1024)
          .toPrecision(3)} mb`);
      context.emit('error-add', { files: [file], error: 'MAX_FILE_SIZE' });
      return;
    }
    // Filter invalid type
    if (!isValidFile(file)) {
      context.emit('error-add', { files: [file], error: 'INVALID_TYPE' });
      console.warn(`ignored file: ${file.name}`);
      return;
    }
    if (config.maxFiles && (items.ids.length + 1 > config.maxFiles)) {
      context.emit('error-add', { files: [file], error: 'MAX_FILE' });
      console.warn('Max file reached');
      return;
    }
    // Add the id
    items.ids.push(id);
    // eslint-disable-next-line no-param-reassign
    items.all[id] = {
      file,
      thumbnail: null,
      upload: { progress: 0 },
      status: STATUS.ADDED,
      accepted: true,
      id,
    };
    enqueueThumbnail(id, file);
    enqueueFile(id);
    context.emit('added-file', { file: items.all[id].file, id });
  };

  const itemManager = {
    getItems: () => items,
    removeFile,
    addFile,
    processQueue,
  };
  return { itemManager };
}
