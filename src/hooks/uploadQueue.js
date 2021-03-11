import { readonly } from 'vue';
import useUploadXHR from '@/hooks/uploadXHR';
import STATUS from '@/utils/status';

/**
 * @param retryOnError - retry when an upload call is failed
 * @param autoUpload.value   - autoUpload.valueProcess
 * @param items        - items state
 * @returns {{enqueueFile: enqueueFile, processQueue: (function(): (undefined))}}
 */
export default function useUploadQueue({
  config,
  items,
  context,
}) {
  const processQueue = () => {
    const {
      upload,
      uploadWithChunking,
    } = useUploadXHR({ config, items });
    const currentProcessing = Object
      .values(items.all)
      .filter(((item) => item.status === STATUS.UPLOADING)).length;
    if (currentProcessing >= config.parallelUpload) {
      console.debug('max limit for parallel uploads reached');
      return;
    }

    const queuedFiles = Object
      .values(items.all)
      .filter(((item) => item.status === STATUS.QUEUED));

    if (queuedFiles.length <= 0) {
      console.debug('processQueue is empty');
      return;
    }
    const triggerProcessQueue = (uploadedItems) => {
      if (config.autoUpload) {
        processQueue();
      }
      context.emit('uploaded', readonly(uploadedItems.map((item) => item.file)));
    };
    const onError = (ids, error) => {
      if (config.autoUpload) {
        processQueue();
      }
      context.emit('error-upload', { ids: [...ids], ...error });
    };
    let i = currentProcessing;
    console.debug(`start to processQueue for ${config.parallelUpload - i} items`);
    if (config.chunking) {
      uploadWithChunking(queuedFiles.shift(), triggerProcessQueue, onError);
    } else if (config.multipleUpload) {
      upload(queuedFiles.slice(0, config.parallelUpload - currentProcessing),
        triggerProcessQueue,
        onError);
    } else {
      while (i <= config.parallelUpload) {
        if (queuedFiles.length <= 0) {
          return;
        }
        upload([queuedFiles.shift()], triggerProcessQueue, onError);
        i += 1;
      }
    }
  };

  const enqueueFile = (id) => {
    console.debug(`enqueueFile id=${id}`);
    if (items.ids.findIndex((value) => value === id) === -1) {
      throw new Error(`File with ${id} does not exist `);
    }
    const file = items.all[id];
    if (file.status === STATUS.ADDED && file.accepted === true) {
      file.status = STATUS.QUEUED;
      if (config.autoUpload) {
        setTimeout(() => processQueue(), 0);
      }
    } else {
      throw new Error(`File ${id} already in ${id.status} state`);
    }
  };
  return { enqueueFile, processQueue };
}
