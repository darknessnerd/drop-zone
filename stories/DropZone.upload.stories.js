import DropZone from '@/index';
import './assets/custom.scss';
import { rest } from 'msw';
import { ref } from 'vue';
import controls from './controls';
import { worker } from '../mocks/browser';

export default {
  title: 'DropZone/upload',
  component: DropZone,
  decorators: [() => {
    worker.use(
      rest.post('http://localhost:5000/item', (req, res, ctx) =>
        // Mock an infinite loading state.
        res(
          ctx.status(200),
          ctx.delay(100),
        )),
    );
    return { template: '<div style="flex-grow: 1;"><story/></div>' };
  }],
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { DropZone },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    const dropZoneRef = ref();
    const uploadAction = () => {
      dropZoneRef.value.processQueue();
    };
    return { args, uploadAction, dropZoneRef };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: args.template,
});

export const BasicUpload = Template.bind({});
BasicUpload.argTypes = {
  ...controls,
};
BasicUpload.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};
export const ParallelUpload = Template.bind({});

ParallelUpload.argTypes = {
  ...controls,
  ...{ parallelUpload: { control: { type: 'number' } } },
};

ParallelUpload.args = {
  parallelUpload: 3,
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="args.parallelUpload" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const MultiUpload = Template.bind({});
MultiUpload.argTypes = {
  ...controls,
};
MultiUpload.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :multipleUpload="true"'
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message><p>Drop here one request with multiple files!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const Accepts = Template.bind({});
Accepts.argTypes = {
  ...controls,
  accepts: {
    control: {
      type: 'multi-select',
      multiple: true,
      options: ['image', 'video', 'exe', 'gif', 'png', 'doc', 'pdf'],
    },
  },
};
Accepts.args = {
  accepts: [],
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :acceptedFiles="args.accepts" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};
export const AutoRetryOnError = Template.bind({});
AutoRetryOnError.argTypes = {
  ...controls,
  ...{ retryOnError: { control: { type: 'boolean' } } },
};
AutoRetryOnError.args = {
  retryOnError: true,
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :retryOnError="args.retryOnError" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const AutoUploadOnDrop = Template.bind({});
AutoUploadOnDrop.argTypes = {
  ...controls,
  ...{ uploadOnDrop: { control: { type: 'boolean' } } },
};
AutoUploadOnDrop.args = {
  uploadOnDrop: true,
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="args.uploadOnDrop" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const Clickable = Template.bind({});
Clickable.argTypes = {
  ...controls,
  ...{ clickable: { control: { type: 'boolean' } } },
};
Clickable.args = {
  clickable: true,
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :clickable="args.clickable" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const MaxFileNumberAndSize = Template.bind({});
MaxFileNumberAndSize.argTypes = {
  ...controls,
  ...{ maxFileSize: { control: { type: 'number' } } },
  ...{ maxFiles: { control: { type: 'number' } } },
};
MaxFileNumberAndSize.args = {
  maxFileSize: 60000000,
  maxFiles: 2,
  template: '<DropZone '
    + ' url="http://localhost:5000/item" '
    + ' :maxFileSize="args.maxFileSize" '
    + ' :maxFiles="args.maxFiles" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const Chuncking = Template.bind({});
Chuncking.argTypes = {
  ...controls,
  ...{ chunking: { control: { type: 'boolean' } } },
  ...{ numberOfChunks: { control: { type: 'number' } } },
};
Chuncking.args = {
  chunking: true,
  numberOfChunks: 2,
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :chunking="args.chunking" '
    + ' :numberOfChunks="args.numberOfChunks" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const TriggerUploadManually = Template.bind({});
TriggerUploadManually.argTypes = {
  ...controls,
};
TriggerUploadManually.args = {
  template: '<DropZone ref="dropZoneRef" :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="false" '
    + ' :multipleUpload="true"'
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message><p>Drop here one request with multiple files!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>'
    + '<button @click="uploadAction">upload</button>',
};
