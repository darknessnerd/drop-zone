import { uuidv4 } from '@/utils';
import STATUS from '@/utils/status';

export default function useUploadXHR({ retryOnError, items }) {
  // Invoked when there is new progress information about given files.
  // If e is not provided, it is assumed that the upload is finished.
  const updateFilesUploadProgress = (uploadId, xhr, e) => {
    let progress;
    if (typeof e !== 'undefined') {
      progress = (100 * e.loaded) / e.total;
      Object.values(items.all)
        .filter((item) => item.upload.id === uploadId)
        .forEach((item) => { // eslint-disable-next-line no-param-reassign
          item.upload.progress = progress;
        });
    } else {
      // Called when the file finished uploading
      console.log('all uploaded');
    }
  };
  const upload = (files, onFinish, onError) => {
    const uploadId = uuidv4();
    console.log(`try to upload ${uploadId}`);
    const xhr = new XMLHttpRequest();
    // TODO - filter all file with error
    // Put the xhr object in the file objects to be able to
    // reference it later.
    let needUpload = false;
    for (let i = 0; i < files.length; i += 1) {
      const item = files[i];
      console.log(item);
      if (item.status === STATUS.QUEUED || (retryOnError && item.status === STATUS.ERROR)) {
        item.xhr = xhr;
        item.upload.id = uploadId;
        needUpload = true;
      }
    }
    if (!needUpload) {
      console.warn('Nothing to upload !');
      return;
    }
    xhr.open('POST', 'http://localhost:5000/item', true);
    xhr.timeout = 6000;
    xhr.withCredentials = false;
    xhr.onload = (e) => {
      console.log(`xhr onload: ${e}`);
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
          } catch (error) {
            console.error(error);
            response = 'Invalid JSON response from server.';
          }
        }
      }
      if (!(xhr.status >= 200 && xhr.status < 300)) {
        console.log('upload error');
      } else {
        Object.values(files)
          .filter((item) => item.upload.id === uploadId)
          .forEach((item) => {
          // eslint-disable-next-line no-param-reassign
            item.status = STATUS.DONE;
          });
        console.log(`file upload finished ${response}`);
        onFinish();
      }
    };
    xhr.ontimeout = (e) => {
      console.log(`xhr ontimeout: ${e}`);
    };
    xhr.onerror = (e) => {
      Object.values(files)
        .filter((item) => item.upload.id === uploadId)
        .forEach((item) => {
        // eslint-disable-next-line no-param-reassign
          item.status = STATUS.ERROR;
        });
      console.error(`xhr onerror: ${e}`);
      onError();
    };
    // Some browsers do not have the .upload property
    const progressObj = xhr.upload != null ? xhr.upload : xhr;
    progressObj.onprogress = (e) => updateFilesUploadProgress(uploadId, xhr, e);
    const headers = {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
    };
    const headerName = Object.keys(headers);
    for (let i = 0; i < headerName.length; i += 1) {
      xhr.setRequestHeader(headerName[i], headers[headerName]);
    }
    const formData = new FormData();
    for (let i = 0; i < files.length; i += 1) {
      const item = files[i];
      console.log(`${item.upload.id} ${item.status}`);
      if (item.upload.id === uploadId) {
        formData.append('file', item.file, item.file.name);
        // eslint-disable-next-line no-param-reassign
        item.status = STATUS.UPLOADING;
      }
    }
    xhr.send(formData);
  };
  return { upload };
}
