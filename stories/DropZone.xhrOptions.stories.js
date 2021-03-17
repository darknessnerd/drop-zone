import DropZone from '@/index';
import './assets/custom.scss';
import { rest } from 'msw';
import controls from './controls';
import { worker } from '../mocks/browser';

export default {
  title: 'DropZone/xhr',
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
    worker.use(
      rest.put('http://localhost:5000/item', (req, res, ctx) =>
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
    const sending = (files, xhr, formData) => {
      if (args.formData) {
        Object.entries(args.formData).forEach((k, v) => {
          formData.set(k, v);
        });
      }
    };
    return { args, sending };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: args.template,
});

export const XhrMethodUrl = Template.bind({});
XhrMethodUrl.argTypes = {
  ...controls,
  method: {
    control: {
      type: 'select',
      multiple: true,
      options: ['POST', 'PUT'],
    },
  },
  url: { control: { type: 'text' } },
};
XhrMethodUrl.args = {
  url: 'http://localhost:5000/item',
  method: 'POST',
  template: '<DropZone '
    + ' :maxFiles="Number(10000000000)" '
    + ' :url="args.uploadUrl" '
    + ' :method="args.method" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const AdditionalFormData = Template.bind({});
AdditionalFormData.argTypes = {
  ...controls,
  formData: { control: { type: 'object' } },
};
AdditionalFormData.args = {
  formData: { formData1: 'test', formData2: 'test', formData3: 'test' },
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :headers="args.headers" '
    + ' v-on:sending="sending" '
    + '>'
    + '<template v-slot:message><p>Drop here one request with multiple files!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};
export const CustomHeaders = Template.bind({});
CustomHeaders.argTypes = {
  ...controls,
  headers: { control: { type: 'object' } },
};
CustomHeaders.args = {
  headers: { headerName1: 'test', headerName2: 'test', headerName3: 'test' },
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :headers="args.headers"'
    + '>'
    + '<template v-slot:message><p>Drop here one request with multiple files!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};
export const WithCredentials = Template.bind({});
WithCredentials.argTypes = {
  ...controls,
  withCredentials: { control: { type: 'boolean' } },
};
WithCredentials.args = {
  withCredentials: true,
  template: '<DropZone '
    + ' :maxFiles="Number(10000000000)" '
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :withCredentials="args.withCredentials"'
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const ParamName = Template.bind({});
ParamName.argTypes = {
  ...controls,
  paramName: { control: { type: 'text' } },
};
ParamName.args = {
  paramName: 'file',
  template: '<DropZone '
    + ' :maxFiles="Number(10000000000)" '
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :paramName="args.paramName"'
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const XhrTimeout = Template.bind({});
XhrTimeout.argTypes = {
  ...controls,
  xhrTimeout: { control: { type: 'number' } },
};
XhrTimeout.args = {
  xhrTimeout: 500,
  template: '<DropZone '
    + ' :maxFiles="Number(10000000000)" '
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :xhrTimeout="args.xhrTimeout"'
    + '>'
    + '<template v-slot:message><p>Drop here!!!</p><br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};
