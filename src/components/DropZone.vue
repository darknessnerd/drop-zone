<template>
  <div class="dropzone"
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
  </div>
  <button @click="processQueue">upload</button>
</template>
<script>
import {
  defineComponent, ref, onMounted, reactive, toRefs, watch, onUnmounted,
} from 'vue';
import mineTypes from '@/utils/minetypes';
import {
  filesize, determineDragAndDropCapable,
} from '@/utils';
import useDragAndDrop from '@/hooks/drag';
import useThumbnail from '@/hooks/thumbnail';
import useUploadQueue from '@/hooks/uploadQueue';
import STATUS from '@/utils/status';
import useHiddenInputFile from '@/hooks/hiddenIpuntFile';

// TODO - retry policy
// TODO - upload file chuncked
// TODO - accept file by size, maxfiles
// TODO - disable
export default defineComponent({
  name: 'DropZone',
  props: {
    uploadOnDrop: {
      type: Boolean,
      default: false,
    },
    retryOnError: {
      type: Boolean,
      default: false,
    },
    multipleUpload: {
      type: Boolean,
      default: false,
    },
    parallelUpload: {
      type: Number,
      default: 3,
    },
    maxFiles: {
      type: Number,
      default: null,
    },
    // Bytes value for the max upload size allowed
    maxFileSize: {
      type: Number,
      default: 1000000,
    },
    hiddenInputContainer: {
      default: 'body',
    },
    clickable: {
      type: Boolean,
      default: true,
    },
    acceptedFiles: {
      type: Array,
      default: null,
    },
  },
  setup(props) {
    const dropzone = ref();
    const dragAndDropCapable = ref(false);
    const accepts = reactive([]);
    // Watch on props
    // TODO - convert to reactive object config {}
    const autoUpload = ref(props.uploadOnDrop);
    const parallelUpload = ref(props.parallelUpload);
    const multipleUpload = ref(props.multipleUpload);
    const maxFiles = ref(props.maxFiles);
    const hiddenInputContainer = ref(props.hiddenInputContainer);
    const clickable = ref(props.clickable);
    const acceptedFiles = ref(props.acceptedFiles);
    const config = reactive({
      maxFileSize: props.maxFileSize,
    });
    // Watch on props changes
    watch(() => props.maxFileSize, (val) => { config.maxFileSize = val; });
    watch(() => props.acceptedFiles, (val) => { acceptedFiles.value = val; });
    watch(() => props.maxFiles, (val) => { maxFiles.value = val; });
    watch(() => props.hiddenInputContainer, (val) => { hiddenInputContainer.value = val; });
    watch(() => props.clickable, (val) => { clickable.value = val; });
    watch(() => props.uploadOnDrop, (val) => { autoUpload.value = val; });
    watch(() => props.parallelUpload, (val) => { parallelUpload.value = val; });
    watch(() => props.multipleUpload, (val) => { multipleUpload.value = val; });

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
      retryOnError: props.retryOnError,
      parallelUpload,
      autoUpload,
      multipleUpload,
      items,
    });

    // CREATE THE ACCEPTS ARRAY
    if (props.acceptedFiles !== null) {
      props.acceptedFiles.forEach((accept) => {
        const mineType = mineTypes.data
          .filter((mt) => (mt.ext && mt.ext === accept) || mt.mime_type.startsWith(accept))
          .map((mediaType) => mediaType.mime_type);
        accepts.push(...mineType);
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
      if (!isValid) {
        // Retrieve the extension from the file if it exist
        const splitFileName = file.name.split('.');
        if (splitFileName.length > 1) {
          const ext = splitFileName[splitFileName.length - 1];
          // Retrieve mine-type from extension
          const extMineTypes = mineTypes.data
            .filter((mt) => (mt.ext && !!mt.ext.split(/\s/)
              .find((extension) => ext === extension)))
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
      console.debug(config.maxFileSize, file.size);
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
      maxFiles,
      hiddenInputContainer,
      clickable,
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
