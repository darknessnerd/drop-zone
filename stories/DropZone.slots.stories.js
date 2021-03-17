import DropZone from '@/index';
import './assets/custom.scss';
import { rest } from 'msw';
import { ref } from 'vue';
import controls from './controls';
import { worker } from '../mocks/browser';
import { SuccessEmitsFlow } from './DropZone.emits.stories';

export default {
  title: 'DropZone/slots',
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

export const DropMessage = Template.bind({});
DropMessage.argTypes = {
  ...controls,
};
DropMessage.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message><p>Custom Drop message!!!</p>'
    + '<img src="./abduction.svg" style="height: 48px; width: 48px;" />'
    + '<br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '</DropZone>',
};

export const RemoveIcon = Template.bind({});
RemoveIcon.argTypes = {
  ...controls,
};
RemoveIcon.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message><p>Custom Drop message!!!</p>'
    + '<br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '<template v-slot:remove>'
    + '<img src="./apocalypse.svg" style="color: red; cursor: pointer; height: 18px; width: 18px;" />'
    + '</template>'
    + '</DropZone>',
};


export const SuccessIcon = Template.bind({});
SuccessIcon.argTypes = {
  ...controls,
};
SuccessIcon.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message><p>Custom Drop message!!!</p>'
    + '<br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '<template v-slot:success>'
    + '<img src="./apocalypse.svg" style="background-color: greenyellow; cursor: pointer; height: 18px; width: 18px;" />'
    + '</template>'
    + '</DropZone>',
};

export const ErrorIcon = Template.bind({});
ErrorIcon.argTypes = {
  ...controls,
};
ErrorIcon.decorators = [
  () => {
    worker.use(
      rest.post('http://localhost:5000/item', (req, res, ctx) =>
        // Mock an infinite loading state.
        res(
          ctx.status(500),
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
ErrorIcon.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message><p>Custom Drop message!!!</p>'
    + '<br>Selected files are <b>not uploaded</b>.'
    + '<br>(This is just a demo!)</template>'
    + '<template v-slot:error>'
    + '<img src="./apocalypse.svg" cursor: pointer; height: 18px; width: 18px;" />'
    + '</template>'
    + '</DropZone>',
};
