import DropZone from '@/index';
import './assets/custom.scss';
import controls from './controls';

export default {
  title: 'DropZone/basic',
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
  template: '<DropZone />',
};

export const AutoRetryOnErrorStory = Template.bind({});
AutoRetryOnErrorStory.argTypes = {
  ...controls,
  ...{ retryOnError: { control: { type: 'boolean' } } },
};
AutoRetryOnErrorStory.args = {
  uploadOnError: true,
  template: '<DropZone :retryOnError="args.retryOnError"/>',
};

export const AutoUploadOnDrop = Template.bind({});
AutoUploadOnDrop.argTypes = {
  ...controls,
  ...{ uploadOnDrop: { control: { type: 'boolean' } } },
};
AutoUploadOnDrop.args = {
  uploadOnDrop: true,
  template: '<DropZone :uploadOnDrop="args.uploadOnDrop"/>',
};
