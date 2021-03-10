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
  defineComponent, onMounted, onUnmounted, reactive, ref, toRefs,
} from 'vue';
import mineTypes from '@/utils/minetypes';
import { determineDragAndDropCapable, filesize } from '@/utils';
import useDragAndDrop from '@/hooks/drag';
import useThumbnail from '@/hooks/thumbnail';
import useUploadQueue from '@/hooks/uploadQueue';
import STATUS from '@/utils/status';
import useHiddenInputFile from '@/hooks/hiddenIpuntFile';
import dropzoneProps from '@/props';
import useConfig from '@/hooks/config';

// TODO - move all function into the file manager
// TODO - emit some events. add, upload complete, upload error
// TODO - retry policy
// TODO - disable
// TODO - Understand capture
// TODO - add slot for inputs to be sent with the request
export default defineComponent({
  name: 'DropZone',
  emits: ['config-update'],
  props: {
    ...dropzoneProps,
  },
  setup(props, context) {
    const dropzone = ref();
    const dragAndDropCapable = ref(false);
    const accepts = reactive([]);

    // Hidden input file feature
    const {
      initHiddenFileInput,
      destroyHiddenFileInput,
      setMultiple,
    } = useHiddenInputFile();

    const {
      config,
    } = useConfig({ props, context, setMultiple });

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
      initHiddenFileInput({
        config, dropzone, addFile, accepts,
      });
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
