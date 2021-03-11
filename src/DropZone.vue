<template>
  <form class="dropzone" ref="dropzone" @drop="onDrop" @dragover="handleDragOver">
    <div v-if="ids.length === 0" class="dropzone__message">
      <slot name="message">Drop here</slot>
    </div>
    <div v-for="(item, itemId) in all" :key="itemId"
         class="dropzone__preview"
         :class="{
            'dropzone__preview-file': !item.thumbnail,
            'dropzone__preview-image': item.thumbnail,
            'dropzone--added': item.status === 'ADDED',
            'dropzone--processing': item.status === 'UPLOADING',
            'dropzone--success': item.status === 'DONE',
            'dropzone--error': item.status === 'ERROR',
            }">
      <div class="dropzone-image" >
        <img v-if="item.thumbnail" style="width:100%; height:auto;" :src="item.thumbnail">
      </div>
      <div class="dropzone__progress">
        <progress class="dropzone__progress-bar" max="100" :value.prop="item.upload.progress"/>
      </div>
      <div class="dropzone__success-mark"><i class="gg-check-o"></i></div>
      <div class="dropzone__error-mark"><i class="gg-danger"></i></div>
      <div class="dropzone__controls"><i @click="removeFile(itemId)" class="gg-close"></i></div>
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
  defineComponent, onMounted, onUnmounted, ref, toRefs,
} from 'vue';
import { determineDragAndDropCapable, filesize } from '@/utils';
import useDragAndDrop from '@/hooks/drag';
import useHiddenInputFile from '@/hooks/hiddenIpuntFile';
import dropzoneProps from '@/props';
import useConfig from '@/hooks/config';
import useItemManager from '@/hooks/itemManager';

// TODO - retry policy
// TODO - disable
// TODO - Understand capture
// TODO - add slot for inputs to be sent with the request
export default defineComponent({
  name: 'DropZone',
  emits: ['config-update', 'added-file', 'removed-file', 'error-upload', 'uploaded'],
  props: {
    ...dropzoneProps,
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

    onMounted(() => {
      console.debug('onMounted');
      dragAndDropCapable.value = determineDragAndDropCapable();
      initHiddenFileInput({
        config, dropzone, itemManager,
      });
    });
    onUnmounted(() => {
      console.debug('onUnmounted');
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
