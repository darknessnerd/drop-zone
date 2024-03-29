<template>
  <form :ref="dropzoneRef"
        class="dropzone"
        :class="[dropzoneClassName]"
        @drop="onDrop"
        @dragover="handleDragOver">
    <div v-if="ids.length === 0" class="dropzone__message" :class="[dropzoneMessageClassName]">
      <slot name="message">Drop here</slot>
    </div>
    <div class="dropzone__item"
         v-for="(item, itemId) in all" :key="itemId"
         :class="[{
            'dropzone--has-thumbnail': !!item.thumbnail,
            'dropzone--added': item.status === 'ADDED',
            'dropzone--processing': item.status === 'UPLOADING',
            'dropzone--success': item.status === 'DONE',
            'dropzone--has-error': item.status === 'ERROR',
            }, dropzoneItemClassName]">
      <div class="dropzone__item-thumbnail" >
        <img v-if="item.thumbnail"  :src="item.thumbnail">
      </div>
      <div class="dropzone__item-controls">
        <div class="dropzone__item-control" @click="removeFile(itemId)">
          <slot name="remove"><i class="gg-close"></i></slot>
        </div>
      </div>
      <div class="dropzone__progress">
        <progress class="dropzone__progress-bar" max="100" :value.prop="item.upload.progress"/>
      </div>
      <div class="dropzone__success-mark">
        <slot name="success"><i class="gg-check-o"></i></slot>
      </div>
      <div class="dropzone__error-mark">
        <slot name="error"><i class="gg-danger"></i></slot>
      </div>
      <div class="dropzone__details" :class="[dropzoneDetailsClassName]">
        <div class="dropzone__file-size" >
          <span v-html="filesize(item.file.size)"></span>
        </div>
        <div class="dropzone__filename">
          <span>{{item.file.name}}</span>
        </div>
      </div>
    </div>
  </form>
</template>
<script>
import {
  defineComponent, onMounted, onUnmounted, ref, toRefs, watch, nextTick,
} from 'vue';
import { determineDragAndDropCapable, filesize } from '@/utils';
import useDragAndDrop from '@/hooks/drag';
import useHiddenInputFile from '@/hooks/hiddenIpuntFile';
import dropzoneProps from '@/props';
import useConfig from '@/hooks/config';
import useItemManager from '@/hooks/itemManager';

// TODO - custom style for progress bar
// TODO - custom style for name and size
// TODO - disable
// TODO - Understand capture
export default defineComponent({
  name: 'DropZone',
  emits: [
    'config-update',
    'added-file',
    'removed-file',
    'error-upload',
    'uploaded',
    'sending',
    'error-add',
  ],
  props: {
    ...dropzoneProps,
    dropzoneRef: {
      default: "dropzone",
    },
    dropzoneClassName: {
      default: 'dropzone__box',
    },
    dropzoneMessageClassName: {
      default: 'dropzone__message--style',
    },
    dropzoneItemClassName: {
      default: 'dropzone__item--style',
    },
    dropzoneDetailsClassName: {
      default: 'dropzone__details--style',
    },
  },
  setup(props, context) {
    const dropzone = ref();
    const dragAndDropCapable = ref(false);
    // --------------- Hidden input file feature
    const {
      // Create the hidden input file
      initHiddenFileInput,
      // Destroy from the dom the hidden input file
      destroyHiddenFileInput,
      // set multiple attribute
      setMultiple,
    } = useHiddenInputFile();
    // --------------- End hidden input file feature

    // DropZone configuration reactive object
    const {
      config,
    } = useConfig({ props, context, setMultiple });

    const {
      itemManager,
    } = useItemManager({ config, context });

    // Drag and drop file feature
    const {
      handleDragOver,
      onDrop,
    } = useDragAndDrop({
      itemManager,
    });

    // If the items list is empty we need to re-create the hidden file input.
    watch(
      () => itemManager.getItems(),
      (val) => {
        if (val.ids.length === 0) {
          nextTick(() => {
            destroyHiddenFileInput();
            initHiddenFileInput({
              config, dropzone, itemManager,
            });
          });
        }
      },
      { deep: true },
    );
    watch(
      () => props.clickable,
      (val) => {
        if (!val) {
          nextTick(() => {
            destroyHiddenFileInput();
          });
        }
      },
      { deep: true },
    );
    onMounted(() => {
      dragAndDropCapable.value = determineDragAndDropCapable();
      initHiddenFileInput({
        config, dropzone, itemManager,
      });
    });
    onUnmounted(() => {
      destroyHiddenFileInput();
    });
    return {
      ...toRefs(itemManager.getItems()),
      accepts: config.accepts,
      onDrop,
      handleDragOver,
      removeFile: itemManager.removeFile,
      filesize,
      processQueue: itemManager.processQueue,
      dropzone,
    };
  },
});
</script>
