import DropZone from '@/index';
import './assets/custom.scss';
import { ref } from 'vue';
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
    const uploadOnDrop = ref(false);
    const parallelUpload = ref(1);
    const multipleUpload = ref(true);
    return {
      args, uploadOnDrop, multipleUpload, parallelUpload,
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
    + ':uploadOnDrop="uploadOnDrop" '
    + ':parallelUpload="Number(parallelUpload)" '
    + ':multipleUpload="multipleUpload" '
    + ':acceptedFiles="[\'pdf\', \'image\', \'doc\']"'
    + '/>'
    + '<div> '
    + '<div> auto upload on drop: <input type="checkbox" v-model="uploadOnDrop"></div>'
    + '<div> parallel upload: <input type="number" v-model="parallelUpload"></div>'
    + '<div> multiple upload: <input type="checkbox" v-model="multipleUpload"></div>'
    + '</div>',
};
