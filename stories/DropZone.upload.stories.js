import DropZone from '@/index';
import './assets/custom.scss';
import controls from './controls';

export default {
  title: 'DropZone/upload',
  component: DropZone,
  decorators: [() => (
    { template: '<div style="flex-grow: 1;"><story/></div>' }
  )],
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { DropZone },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: args.template,
});

export const BasicUploadStory = Template.bind({});
BasicUploadStory.argTypes = {
  ...controls,
};
BasicUploadStory.args = {
  template: '<DropZone maxFiles="10000000000"'
    + ' url="http://localhost:5000/item" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const AutoRetryOnErrorStory = Template.bind({});
AutoRetryOnErrorStory.argTypes = {
  ...controls,
  ...{ retryOnError: { control: { type: 'boolean' } } },
};
AutoRetryOnErrorStory.args = {
  uploadOnError: true,
  template: '<DropZone maxFiles="10000000000"'
    + ' url="http://localhost:5000/item" '
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
  template: '<DropZone maxFiles="10000000000"'
    + ' url="http://localhost:5000/item" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};
