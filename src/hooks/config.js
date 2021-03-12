import { getWindowUrl } from '@/utils';
import {
  reactive, watch,
} from 'vue';
import mineTypes from '@/utils/minetypes';

export default function useConfig({ props, context, setMultiple }) {
  // Dropbox reactive config
  const config = reactive({
    headers: props.headers,
    xhrTimeout: props.xhrTimeout,
    withCredentials: props.withCredentials,
    url: props.url ? props.url : getWindowUrl(),
    method: props.method,
    maxFiles: props.maxFiles,
    maxFileSize: props.maxFileSize,
    autoUpload: props.uploadOnDrop,
    parallelUpload: props.parallelUpload,
    hiddenInputContainer: props.hiddenInputContainer,
    clickable: props.clickable,
    acceptedFiles: props.acceptedFiles,
    retryOnError: props.retryOnError,
    maxRetryError: 3,
    chunking: props.chunking,
    numberOfChunks: props.numberOfChunks,
    multipleUpload: props.chunking ? false : props.multipleUpload,
    accepts: [],
  });
  const createAcceptsArray = () => {
    const acceptsTmp = [];
    // CREATE THE ACCEPTS ARRAY
    if (props.acceptedFiles !== null) {
      props.acceptedFiles.forEach((accept) => {
        mineTypes.data
          .filter((mt) => (
            mt.ext && !!mt.ext.split(/\s/).find((extension) => accept === extension)
          ) || mt.mime_type.startsWith(accept))
          .forEach((mdType) => {
            acceptsTmp.push(mdType.mime_type);
            if (mdType.ext) {
              acceptsTmp.push(...mdType.ext.split(/\s/).map((e) => `.${e}`));
            }
          });
      });
    }
    config.accepts = [...acceptsTmp];
  };

  const emitConfigUpdate = () => {
    context.emit('config-update', { ...config });
  };

  createAcceptsArray();
  emitConfigUpdate();
  // Watch on props changes
  watch(() => props.acceptedFiles, (val) => {
    if (!config.acceptedFiles.every((accept) => val.includes(accept))) {
      config.acceptedFiles = [...val];
      createAcceptsArray();
      emitConfigUpdate();
    }
  });
  watch(() => props.headers, (val) => {
    if (config.headers !== val) {
      config.headers = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.xhrTimeout, (val) => {
    if (config.xhrTimeout !== val) {
      config.xhrTimeout = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.withCredentials, (val) => {
    if (config.withCredentials !== val) {
      config.withCredentials = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.method, (val) => {
    if (config.method !== val) {
      config.method = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.maxFiles, (val) => {
    if (config.maxFiles !== val) {
      config.maxFiles = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.maxFileSize, (val) => {
    if (config.maxFileSize !== val) {
      config.maxFileSize = val;
      emitConfigUpdate();
      if (config.maxFileSize > 1) {
        setMultiple(true);
      } else {
        setMultiple(false);
      }
    }
  });
  watch(() => props.hiddenInputContainer, (val) => {
    if (config.hiddenInputContainer !== val) {
      config.hiddenInputContainer = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.clickable, (val) => {
    if (config.hiddenInputContainer !== val) {
      config.clickable = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.uploadOnDrop, (val) => {
    if (config.uploadOnDrop !== val) {
      config.autoUpload = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.parallelUpload, (val) => {
    if (config.parallelUpload !== val) {
      config.parallelUpload = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.retryOnError, (val) => {
    if (config.retryOnError !== val) {
      config.retryOnError = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.maxRetryError, (val) => {
    if (config.maxRetryError !== val) {
      config.maxRetryError = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.multipleUpload, (val) => {
    if (config.multipleUpload !== val) {
      config.multipleUpload = config.chunking ? false : val;
      emitConfigUpdate();
    }
  });
  watch(() => props.numberOfChunks, (val) => {
    if (config.numberOfChunks !== val) {
      config.numberOfChunks = val;
      emitConfigUpdate();
    }
  });
  watch(() => props.chunking, (val) => {
    if (config.chunking !== val) {
      config.chunking = val;
      config.multipleUpload = val ? false : config.multipleUpload;
      emitConfigUpdate();
    }
  });
  return { config };
}
