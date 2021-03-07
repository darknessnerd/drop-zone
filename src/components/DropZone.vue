<template>
  <form class="dropzone"
       ref="dropzone"
       @drop="onDrop"
       @dragover="handleDragOver">
    <div v-if="ids.length === 0" class="dropzone__message">Drop here</div>
    <div class="dropzone__preview"
         :class="{
            'dropzone__preview-file': !item.thumbnail,
            'dropzone__preview-image': item.thumbnail,
            'dropzone--added': item.status === 'ADDED',
            'dropzone--processing': item.status === 'UPLOADING',
            'dropzone--success': item.status === 'DONE',
            'dropzone--error': item.status === 'ERROR',
            }"
         v-for="(item, itemId) in all"
         :key="itemId">
      <div class="dropzone-image" >
        <img v-if="item.thumbnail"
             style="width:100%; height:auto;"
             :src="item.thumbnail">
      </div>
      <div class="dropzone__progress">
        <progress class="dropzone__progress-bar"
          max="100" :value.prop="item.upload.progress">
        </progress>
      </div>
      <div class="dropzone__success-mark">
        <i class="gg-check-o"></i>
      </div>
      <div class="dropzone__error-mark">
        <i class="gg-danger"></i>
      </div>
      <div class="dropzone__controls">
        <button @click="removeFile(itemId)">x</button>
      </div>
      <div class="dropzone__details">
        <div class="dropzone__file-size" >
          <span v-html="filesize(item.file.size)"></span>
        </div>
        <div class="dropzone__filename">
          <span>{{item.file.name}}</span>
        </div>
      </div>
    </div>
  </form>
  <button @click="processQueue">upload</button>
</template>
<script>
import {
  defineComponent, onMounted, onUnmounted, reactive, ref, toRefs, watch,
} from 'vue';
import mineTypes from '@/utils/minetypes';
import { determineDragAndDropCapable, filesize } from '@/utils';
import useDragAndDrop from '@/hooks/drag';
import useThumbnail from '@/hooks/thumbnail';
import useUploadQueue from '@/hooks/uploadQueue';
import STATUS from '@/utils/status';
import useHiddenInputFile from '@/hooks/hiddenIpuntFile';

// TODO - XHR request configurable, url method and auth
// TODO - move all function into the file manager
// TODO - emit some events. add, upload complete, upload error
// TODO - retry policy
// TODO - upload file chuncked
// TODO - disable
// TODO - Understand capture
// TODO - add slot for inputs to be sent with the request
export default defineComponent({
  name: 'DropZone',
  emits: ['config-update'],
  props: {
    /**
     * Auto upload on drop item or select items form hiddent input
     */
    uploadOnDrop: {
      type: Boolean,
      default: false,
    },
    /**
     * Retry an upload if it fail, TODO - the policy need to be implemented
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
      // default: 1000000, 1mb
      default: 67157309,
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
  },
  setup(props, context) {
    const dropzone = ref();
    const dragAndDropCapable = ref(false);
    const accepts = reactive([]);
    // Dropbox reactive config
    const config = reactive({
      maxFiles: props.maxFiles,
      maxFileSize: props.maxFileSize,
      autoUpload: props.uploadOnDrop,
      parallelUpload: props.parallelUpload,
      hiddenInputContainer: props.hiddenInputContainer,
      clickable: props.clickable,
      acceptedFiles: props.acceptedFiles,
      retryOnError: props.retryOnError,
      chunking: props.chunking,
      multipleUpload: props.chunking ? false : props.multipleUpload,
    });
    const emitConfigUpdate = () => {
      context.emit('config-update', { ...config });
    };
    emitConfigUpdate();
    const items = reactive({
      ids: [],
      all: {},
    });

    // Add the thumbnail generator feature
    const {
      enqueueThumbnail,
    } = useThumbnail({ items });

    // File upload queue feature
    const {
      enqueueFile,
      processQueue,
    } = useUploadQueue({
      config,
      items,
    });

    // CREATE THE ACCEPTS ARRAY
    if (props.acceptedFiles !== null) {
      props.acceptedFiles.forEach((accept) => {
        mineTypes.data
          .filter((mt) => (
            mt.ext && !!mt.ext.split(/\s/).find((extension) => accept === extension)
          ) || mt.mime_type.startsWith(accept))
          .forEach((mdType) => {
            accepts.push(mdType.mime_type);
            if (mdType.ext) {
              accepts.push(...mdType.ext.split(/\s/).map((e) => `.${e}`));
            }
          });
      });
    }
    /*
      Removes a select file the user has uploaded
    */
    const removeFile = (fileId) => {
      const index = items.ids.findIndex((id) => id === fileId);
      if (index < 0) {
        return;
      }
      items.ids.splice(index, 1);
      delete items.all[fileId];
    };
    const isValidFile = (file) => {
      if (accepts === null || accepts.length === 0) {
        return true;
      }
      const fileMineType = file.type;
      let isValid = accepts
        .findIndex((validType) => validType.trim() === fileMineType.trim()) !== -1;
      console.debug(fileMineType, isValid);
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
          isValid = !!accepts.find((mt) => extMineTypes.find((extMt) => extMt === mt));
        }
      }
      if (!isValid) {
        // TODO - last check what can be ??
      }
      return isValid;
    };
    const addFile = (id, file) => {
      console.debug('addFile', file);
      // Check the size
      console.debug(accepts);
      if (config.maxFileSize && file.size > config.maxFileSize) {
        console
          .warn(`ignored file: ${file.name} with size ~= ${(file.size / 1024 / 1024)
            .toPrecision(3)} mb`);
        return;
      }
      // Filter invalid type
      if (!isValidFile(file)) {
        console.warn(`ignored file: ${file.name}`);
        return;
      }
      if (items.ids.length + 1 > config.maxFiles) {
        // TODO ADD VISUAL EFFECT AND Emit some event
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
      };
      enqueueThumbnail(id, file);
      enqueueFile(id);
    };
    // Hidden input file feature
    const {
      initHiddenFileInput,
      destroyHiddenFileInput,
    } = useHiddenInputFile({
      addFile,
      accepts,
      dropzone,
      config,
    });

    // Drag and drop file feature
    const {
      handleDragOver,
      onDrop,
    } = useDragAndDrop({
      addFile,
    });

    onMounted(() => {
      console.debug('onMounted');
      dragAndDropCapable.value = determineDragAndDropCapable();
      initHiddenFileInput();
    });
    onUnmounted(() => {
      console.debug('onUnmounted');
      destroyHiddenFileInput();
    });
    // Watch on props changes
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
        destroyHiddenFileInput();
        initHiddenFileInput();
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
    watch(() => props.chunking, (val) => {
      if (config.chunking !== val) {
        config.chunking = val;
        config.multipleUpload = val ? false : config.multipleUpload;
        emitConfigUpdate();
      }
    });
    return {
      ...toRefs(items),
      accepts,
      onDrop,
      handleDragOver,
      removeFile,
      filesize,
      processQueue,
      dropzone,
    };
  },
});
</script>
