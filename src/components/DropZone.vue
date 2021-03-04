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
        <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
          <!-- Generator: Sketch 3.2.1 (9971) - http://www.bohemiancoding.com/sketch -->
          <title>Check</title>
          <desc>Created with Sketch.</desc>
          <defs></defs>
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
            <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>
          </g>
        </svg>
      </div>
      <div class="dropzone__error-mark">
        <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
          <!-- Generator: Sketch 3.2.1 (9971) - http://www.bohemiancoding.com/sketch -->
          <title>error</title>
          <desc>Created with Sketch.</desc>
          <defs></defs>
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
            <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">
              <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>
            </g>
          </g>
        </svg>
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
    const triggerClickOnHiddenFileIput = () => {
      hiddenFileInput.click();
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
          el.addEventListener('click', triggerClickOnHiddenFileIput);
        });
      }
    });
    onUnmounted(() => {
      // Remove all events
      clickableElements.forEach((el) => {
        el.removeEventListener('click', triggerClickOnHiddenFileIput);
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
