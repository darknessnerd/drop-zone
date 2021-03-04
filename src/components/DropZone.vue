<template>
  <div class="dropzone"
       ref="dropzone"
       @drop="onDrop"
       @dragover="handleDragOver">
    <div v-if="ids.length === 0">Drop here</div>
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
        <img v-if="item.thumbnail" style="width:100%; height:auto;" :src="item.thumbnail">
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
  filesize, determineDragAndDropCapable, uuidv4,
} from '@/utils';
import useDragAndDrop from '@/hooks/drag';
import useThumbnail from '@/hooks/thumbnail';
import useUploadQueue from '@/hooks/uploadQueue';
import STATUS from '@/utils/status';

// TODO - retry policy
// TODO - change svg icon
// TODO - upload file chuncked
// TODO - accept file by size, maxfiles, accepted list
// TODO - filter by accepetd type
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
    hiddenInputContainer: {
      default: 'body',
    },
    clickable: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const dropzone = ref();
    const getElement = function (el, name) {
      let element;
      if (typeof el === 'string') {
        element = document.querySelector(el);
      } else if (el.nodeType != null) {
        element = el;
      }
      if (element == null) {
        throw new Error(
          `Invalid \`${name}\` option provided. Please provide a CSS selector or a plain HTML element.`,
        );
      }
      return element;
    };
    let hiddenFileInput;
    let clickableElements = [];
    const dragAndDropCapable = ref(false);
    // Watch on props
    const autoUpload = ref(props.uploadOnDrop);
    const parallelUpload = ref(props.parallelUpload);
    const multipleUpload = ref(props.multipleUpload);
    watch(() => props.uploadOnDrop, (val) => { autoUpload.value = val; });
    watch(() => props.parallelUpload, (val) => { parallelUpload.value = val; });
    watch(() => props.multipleUpload, (val) => { multipleUpload.value = val; });
    const items = reactive({
      ids: [],
      all: {},
    });

    const {
      enqueueThumbnail,
    } = useThumbnail({ items });

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

    const addFile = (id, file) => {
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

    const {
      handleDragOver,
      onDrop,
    } = useDragAndDrop({
      addFile,
    });
    const triggerClickOnHiddenFileInput = (evt) => {
      console.log(evt);
      if (clickableElements.findIndex((el) => el === evt.target) !== -1) {
        hiddenFileInput.click();
      }
    };
    onMounted(() => {
      dragAndDropCapable.value = determineDragAndDropCapable();

      if (props.clickable) {
        clickableElements = [dropzone.value];

        const setupHiddenFileInput = () => {
          if (hiddenFileInput) {
            hiddenFileInput.parentNode.removeChild(hiddenFileInput);
          }
          hiddenFileInput = document.createElement('input');
          hiddenFileInput.setAttribute('type', 'file');
          if (props.maxFiles === null || props.maxFiles > 1) {
            hiddenFileInput.setAttribute('multiple', 'multiple');
          }
          // TODO - accepted files
          // TODO - caputure
          // Make sure that no one can tab in this input field.
          hiddenFileInput.setAttribute('tabindex', '-1');
          hiddenFileInput.style.visibility = 'hidden';
          hiddenFileInput.style.position = 'absolute';
          hiddenFileInput.style.top = '0';
          hiddenFileInput.style.left = '0';
          hiddenFileInput.style.height = '0';
          hiddenFileInput.style.width = '0';
          getElement(props.hiddenInputContainer, 'hiddenInputContainer')
            .appendChild(hiddenFileInput);
          hiddenFileInput.addEventListener('change', () => {
            const { files } = hiddenFileInput;
            files.forEach((file) => {
              addFile(uuidv4(), file);
            });
            setupHiddenFileInput();
          });
        };
        setupHiddenFileInput();
        clickableElements.forEach((el) => {
          el.classList.add('dropzone-clickable');
          el.addEventListener('click', triggerClickOnHiddenFileInput);
        });
      }
    });
    onUnmounted(() => {
      // Remove all events
      clickableElements.forEach((el) => {
        el.removeEventListener('click', triggerClickOnHiddenFileInput);
      });
      // Delete the hidden input file
      if (hiddenFileInput) {
        hiddenFileInput.parentElement.removeChild(hiddenFileInput);
        hiddenFileInput = null;
      }
    });
    const accepts = ref(
      [...mineTypes.data.filter((mineType) => mineType.ext && mineType.ext === 'pdf')
        .map((mediaType) => mediaType.mime_type),
      ],
    );

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
