import { getWindowUrl } from '@/utils';
import {
  reactive, watch,
} from 'vue';

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
    chunking: props.chunking,
    numberOfChunks: props.numberOfChunks,
    multipleUpload: props.chunking ? false : props.multipleUpload,
  });
  const emitConfigUpdate = () => {
    context.emit('config-update', { ...config });
  };
  emitConfigUpdate();
  // Watch on props changes
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
  watch(() => props.acceptedFiles, (val) => {
    if (!config.acceptedFiles.every((accept) => val.includes(accept))) {
      config.acceptedFiles = [...val];
      emitConfigUpdate();
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
