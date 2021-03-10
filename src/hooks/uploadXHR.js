import { uuidv4 } from '@/utils';
import STATUS from '@/utils/status';

export default function useUploadXHR({ config, items }) {
  const error = (uploadId, e, onError) => {
    Object.values(items.all)
      .filter((item) => item.upload && item.upload.id === uploadId)
      .forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.status = STATUS.ERROR;
      });
    console.error(`xhr onerror: ${e.type}`);
    onError();
  };
  const uploadChunck = (chunkStart, sliceSize, item, reader, onFinish, onError, uploadId) => {
    const nextSlice = chunkStart + sliceSize + 1;
    const blob = item.file.webkitSlice
      ? item.file.webkitSlice(chunkStart, nextSlice)
      : item.file.slice(chunkStart, nextSlice);
    // eslint-disable-next-line no-param-reassign
    reader.onloadend = (event) => {
      if (event.target.readyState !== FileReader.DONE) {
        return;
      }
      // eslint-disable-next-line no-param-reassign
      item.upload.blob = blob;
      // eslint-disable-next-line no-param-reassign
      item.upload.chunkIndex = Math.floor(nextSlice / sliceSize);
      // eslint-disable-next-line no-param-reassign
      item.upload.nextSlice = nextSlice;
      // eslint-disable-next-line no-param-reassign
      item.upload.chunkStart = chunkStart;
      // eslint-disable-next-line no-param-reassign
      item.upload.sliceSize = sliceSize;
      // eslint-disable-next-line no-param-reassign
      item.upload.reader = reader;
      // eslint-disable-next-line no-use-before-define
      makeRequest(uploadId, [item], onFinish, onError);
    };
    reader.readAsDataURL(blob);
  };
  // Invoked when there is new progress information about given files.
  // If e is not provided, it is assumed that the upload is finished.
  const updateFilesUploadProgress = (uploadId, e) => {
    let progress;
    if (typeof e !== 'undefined') {
      Object.values(items.all)
        .filter((item) => item.upload.id === uploadId)
        .forEach((item) => {
          if (!item.upload.chunking) {
            progress = (100 * e.loaded) / e.total;
            // eslint-disable-next-line no-param-reassign
            item.upload.progress = progress;
          } else {
            // eslint-disable-next-line no-param-reassign
            item.upload.loadedBytes += e.loaded;
            // eslint-disable-next-line no-param-reassign
            item.upload.progress = (100 * item.upload.loadedBytes) / item.file.size;
          }
        });
    }
  };
  const makeRequest = (uploadId, files, onFinish, onError) => {
    const xhr = new XMLHttpRequest();
    xhr.open(config.method, config.url, true);
    xhr.timeout = config.xhrTimeout;
    xhr.withCredentials = config.withCredentials;
    // Async callbacks
    xhr.ontimeout = (e) => { error(uploadId, e, onError); };
    xhr.onerror = (e) => { error(uploadId, e, onError); };
    // Defaults headers
    const headers = {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
    };
    // Custom headers from config
    let headersName = Object.keys(headers);
    for (let i = 0; i < headersName.length; i += 1) {
      const headerName = headersName[i];
      xhr.setRequestHeader(headerName, headers[headerName]);
    }
    if (config.headers) {
      headersName = Object.keys(config.headers);
      for (let i = 0; i < headersName.length; i += 1) {
        const headerName = headersName[i];
        const val = config.headers[headerName];
        if (typeof val === 'string' || typeof val === 'number') {
          xhr.setRequestHeader(headerName, val);
        }
      }
    }
    // Some browsers do not have the .upload property
    const progressObj = xhr.upload != null ? xhr.upload : xhr;
    progressObj.onprogress = (e) => updateFilesUploadProgress(uploadId, e);

    // Append to formData
    const formData = new FormData();
    // TODO - add input values from the form
    for (let i = 0; i < files.length; i += 1) {
      const item = files[i];
      if (item.upload.id === uploadId) {
        if (!item.upload.chunking) {
          formData.append('file', item.file, item.file.name);
        } else {
          formData.set('fileName', item.file.name);
          // 1 based chunk order index
          formData.set('chunkIndex', item.upload.chunkIndex);
          formData.set('file', item.upload.blob, item.file.name);
        }
        // eslint-disable-next-line no-param-reassign
        item.status = STATUS.UPLOADING;
      }
    }

    xhr.onload = (e) => {
      let response;
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.responseType !== 'arraybuffer' && xhr.responseType !== 'blob') {
        response = xhr.responseText;
        if (
          xhr.getResponseHeader('content-type')
          // eslint-disable-next-line no-bitwise
          && ~xhr.getResponseHeader('content-type').indexOf('application/json')
        ) {
          try {
            response = JSON.parse(response);
          } catch (errorCatch) {
            console.error(errorCatch);
            response = 'Invalid JSON response from server.';
          }
        }
        console.debug(response);
      }
      if (!(xhr.status >= 200 && xhr.status < 300)) {
        error(uploadId, e, onError);
      } else {
        let allDone = true;
        Object.values(files)
          .filter((item) => item.upload.id === uploadId)
          .forEach((item) => {
            if (item.upload.chunking) {
              if (item.upload.nextSlice < item.file.size) {
                allDone = false;
                uploadChunck(
                  item.upload.nextSlice,
                  item.upload.sliceSize,
                  item,
                  item.upload.reader, onFinish, onError,
                  item.upload.id,
                );
              } else {
                console.debug(`file upload finished ${item.file.name}`);
                // eslint-disable-next-line no-param-reassign
                item.status = STATUS.DONE;
                // eslint-disable-next-line no-param-reassign
                item.upload.progress = 100.00;
              }
            } else {
              // eslint-disable-next-line no-param-reassign
              item.status = STATUS.DONE;
              console.debug(`file upload finished ${item.file.name}`);
            }
          });
        if (allDone === true) {
          onFinish();
        }
      }
    };
    xhr.send(formData);
  };
  const uploadWithChunking = (item, onFinish, onError) => {
    const uploadId = uuidv4();
    console.log(`try to uploadWithChunking ${uploadId}`);
    // eslint-disable-next-line no-param-reassign
    item.upload.id = uploadId;
    // eslint-disable-next-line no-param-reassign
    item.upload.chunking = true;
    // eslint-disable-next-line no-param-reassign
    item.upload.loadedBytes = 0;
    const reader = new FileReader();
    // TODO - define the size of the chunks
    const sliceSize = (item.file.size / config.numberOfChunks);
    uploadChunck(0, sliceSize, item, reader, onFinish, onError, uploadId);
  };

  const upload = (files, onFinish, onError) => {
    const uploadId = uuidv4();
    console.log(`try to upload ${uploadId}`);
    let needUpload = false;
    for (let i = 0; i < files.length; i += 1) {
      const item = files[i];
      if (item.status === STATUS.QUEUED || (config.retryOnError && item.status === STATUS.ERROR)) {
        item.upload.id = uploadId;
        needUpload = true;
      }
    }
    if (!needUpload) {
      console.warn('Nothing to upload !');
      return;
    }
    makeRequest(uploadId, files, onFinish, onError);
  };
  return { upload, uploadWithChunking };
}
