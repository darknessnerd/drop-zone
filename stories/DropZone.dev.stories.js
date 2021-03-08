import DropZone from '@/index';
import './assets/custom.scss';
import { reactive, toRefs } from 'vue';
import controls from './controls';

export default {
  title: 'DropZone/dev',
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
    const config = reactive(
      {
        dropZone: {
          uploadOnDrop: true,
          parallelUpload: 1,
          multipleUpload: true,
          maxFiles: 10,
          chunking: true,
          numberOfChunks: 2,
          customHeaders: { 'x-test': 'value', 'x-number': 5 },
        },
      },
    );
    const onUpdateConfig = (newConfig) => {
      config.dropZone = { ...config.dropZone, ...newConfig };
    };
    return {
      args, ...toRefs(config), onUpdateConfig,
    };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: args.template,
});

export const DevStory = Template.bind({});
DevStory.argTypes = {
  ...controls,
};
DevStory.args = {
  template: '<DropZone '
    + 'v-on:configUpdate="onUpdateConfig" '
    + ':uploadOnDrop="dropZone.uploadOnDrop" '
    + ':parallelUpload="Number(dropZone.parallelUpload)" '
    + ':multipleUpload="dropZone.multipleUpload" '
    + ':chunking="dropZone.chunking" '
    + ':numberOfChunks="dropZone.numberOfChunks" '
    + ' url="http://localhost:5000/item" '
    + ':maxFiles="Number(dropZone.maxFiles)" '
    + ' :withCredentials="false" '
    + ' :xhrTimeout="2000" '
    + ' :headers="dropZone.customHeaders" '
    + ':acceptedFiles="[\'pdf\', \'image\', \'exe\', \'zip\']" '
    + '/>'
    + '<div> '
    + '<div> auto upload on drop: <input type="checkbox" v-model="dropZone.uploadOnDrop"></div>'
    + '<div> parallel upload: <input type="number" v-model="dropZone.parallelUpload"></div>'
    + '<div> multiple upload: <input type="checkbox" v-model="dropZone.multipleUpload"></div>'
    + '<div> chunking: <input type="checkbox" v-model="dropZone.chunking"></div>'
    + '<div> maxFiles: <input type="number" v-model="dropZone.maxFiles"></div>'
    + '</div>',
};
