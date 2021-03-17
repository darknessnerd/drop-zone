import DropZone from '@/index';
import './assets/custom.scss';
import { reactive, toRefs, ref } from 'vue';
import { rest } from 'msw';
import controls from './controls';
import { worker } from '../mocks/browser';

export default {
  title: 'DropZone/emits',
  component: DropZone,
  decorators: [() => (
    {
      template: '<div style="flex-grow: 1;">'
        + '<story/>'
        + '</div>',
    }
  )],
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { DropZone },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    const dropZoneRef = ref();
    const config = reactive(
      {
        dropZone: {
          uploadOnDrop: true,
          parallelUpload: 1,
          multipleUpload: false,
          maxFiles: 10,
          chunking: false,
          numberOfChunks: 2,
          retryOnError: false,
          customHeaders: { 'x-test': 'value', 'x-number': 5 },
        },
      },
    );
    const onUpdateConfig = (newConfig) => {
      config.dropZone = { ...config.dropZone, ...newConfig };
    };

    return {
      args,
      ...toRefs(config),
      onUpdateConfig,
      dropZoneRef,
    };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: args.template,
});

export const SuccessEmitsFlow = Template.bind({});
SuccessEmitsFlow.argTypes = {
  ...controls,
  'added-file': { action: 'added-file' },
  'removed-file': { action: 'removed-file' },
  'error-upload': { action: 'error-upload' },
  sending: { action: 'sending' },
  uploaded: { action: 'uploaded' },
};
SuccessEmitsFlow.decorators = [
  () => {
    worker.use(
      rest.post('http://localhost:5000/item', (req, res, ctx) =>
        // Mock an infinite loading state.
        res(
          ctx.status(200),
          ctx.delay(0),
        )),
    );
    return {
      template: '<div style="flex-grow: 1;">'
    + '<story/>'
    + '</div>',
    };
  },
];

SuccessEmitsFlow.args = {
  template: '<DropZone '
    + ' ref="dropZoneRef" '
    + ':uploadOnDrop="dropZone.uploadOnDrop" '
    + 'v-on:addedFile="args[\'added-file\']" '
    + 'v-on:removedFile="args[\'removed-file\']" '
    + 'v-on:errorUpload="args[\'error-upload\']" '
    + 'v-on:sending="args.sending" '
    + 'v-on:uploaded="args.uploaded" '
    + 'v-on:configUpdate="onUpdateConfig" '
    + ':parallelUpload="Number(dropZone.parallelUpload)" '
    + ':multipleUpload="dropZone.multipleUpload" '
    + ':retryOnError="dropZone.retryOnError" '
    + ':chunking="dropZone.chunking" '
    + ':numberOfChunks="dropZone.numberOfChunks" '
    + ' url="http://localhost:5000/item" '
    + ' :maxFiles="Number(dropZone.maxFiles)" '
    + ' :withCredentials="false" '
    + ' :xhrTimeout="60000" '
    + ' :headers="dropZone.customHeaders" '
    + '> '
    + ' <template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>. <br>(This is just a demo!)</template>'
  //    + ' <template v-slot:remove>x</template>'
  //  + ' <template v-slot:error><div>ERRORE</div></template>'
  //  + ' <template v-slot:success><div>ok</div></template>'
    + '</DropZone>'
    + ''
    + '<div> '
    + '<div> auto upload on drop: <input type="checkbox" v-model="dropZone.uploadOnDrop"></div>'
    + '<div> parallel upload: <input type="number" v-model="dropZone.parallelUpload"></div>'
    + '<div> multiple upload: <input type="checkbox" v-model="dropZone.multipleUpload"></div>'
    + '<div> chunking: <input type="checkbox" v-model="dropZone.chunking"></div>'
    + '<div> retryOnError: <input type="checkbox" v-model="dropZone.retryOnError"></div>'
    + '<div> maxFiles: <input type="number" v-model="dropZone.maxFiles"></div>'
    + '</div>',
};

export const ErrorEmitsFlow = Template.bind({});
ErrorEmitsFlow.argTypes = {
  ...controls,
  'added-file': { action: 'added-file' },
  'removed-file': { action: 'removed-file' },
  'error-upload': { action: 'error-upload' },
  sending: { action: 'sending' },
  uploaded: { action: 'uploaded' },
};
ErrorEmitsFlow.decorators = [
  () => {
    worker.use(
      rest.post('http://localhost:5000/item', (req, res, ctx) =>
        // Mock an infinite loading state.
        res(
          ctx.status(500),
          ctx.delay(1000),
        )),
    );
    return {
      template: '<div style="flex-grow: 1;">'
        + '<story/>'
        + '</div>',
    };
  },
];

ErrorEmitsFlow.args = {
  template: '<DropZone '
    + ' ref="dropZoneRef" '
    + ':uploadOnDrop="dropZone.uploadOnDrop" '
    + 'v-on:addedFile="args[\'added-file\']" '
    + 'v-on:removedFile="args[\'removed-file\']" '
    + 'v-on:errorUpload="args[\'error-upload\']" '
    + 'v-on:sending="args.sending" '
    + 'v-on:uploaded="args.uploaded" '
    + 'v-on:configUpdate="onUpdateConfig" '
    + ':parallelUpload="Number(dropZone.parallelUpload)" '
    + ':multipleUpload="dropZone.multipleUpload" '
    + ':retryOnError="dropZone.retryOnError" '
    + ':chunking="dropZone.chunking" '
    + ':numberOfChunks="dropZone.numberOfChunks" '
    + ' url="http://localhost:5000/item" '
    + ' :maxFiles="Number(dropZone.maxFiles)" '
    + ' :withCredentials="false" '
    + ' :xhrTimeout="60000" '
    + ' :headers="dropZone.customHeaders" '
    + '> '
    + ' <template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>. <br>(This is just a demo!)</template>'
    //    + ' <template v-slot:remove>x</template>'
    //  + ' <template v-slot:error><div>ERRORE</div></template>'
    //  + ' <template v-slot:success><div>ok</div></template>'
    + '</DropZone>'
    + ''
    + '<div> '
    + '<div> auto upload on drop: <input type="checkbox" v-model="dropZone.uploadOnDrop"></div>'
    + '<div> parallel upload: <input type="number" v-model="dropZone.parallelUpload"></div>'
    + '<div> multiple upload: <input type="checkbox" v-model="dropZone.multipleUpload"></div>'
    + '<div> chunking: <input type="checkbox" v-model="dropZone.chunking"></div>'
    + '<div> retryOnError: <input type="checkbox" v-model="dropZone.retryOnError"></div>'
    + '<div> maxFiles: <input type="number" v-model="dropZone.maxFiles"></div>'
    + '</div>',
};
