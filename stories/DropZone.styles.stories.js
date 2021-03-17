import DropZone from '@/index';
import './assets/custom.scss';
import { rest } from 'msw';
import { ref } from 'vue';
import controls from './controls';
import { worker } from '../mocks/browser';

export default {
  title: 'DropZone/styles',
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
export const DropzoneMessageClassName = Template.bind({});
DropzoneMessageClassName.argTypes = {
  ...controls,
};
DropzoneMessageClassName.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' dropzoneMessageClassName="dropzoneMessageClassName"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message>'
    + '<p>Drop here!!!</p>'
    + 'with <b>dropzoneMessageClassName</b> prop we can provide a custom class for the dropzone, like this one:'
    + '<pre style="text-align: justify; border: 1px black solid">'
    + '.dropzoneMessageClassName{\n'
    + '  background-color: greenyellow;\n'
    + '}'
    + '</pre>'
    + '<br>Selected files are <b>not uploaded</b>.'
    + '<br>'
    + '(This is just a demo!)'
    + '</template>'
    + '</DropZone>',
};
export const DropzoneClass = Template.bind({});
DropzoneClass.argTypes = {
  ...controls,
};
DropzoneClass.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' dropzoneClassName="dropzoneCustomClass"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message>'
    + '<p>Drop here!!!</p>'
    + 'with <b>dropzoneClassName</b> prop we can provide a custom class for the dropzone, like this one:'
    + '<pre style="text-align: justify; border: 1px black solid">'
    + '.dropzoneCustomClass {\n'
    + '  background-color: whitesmoke;\n'
    + '  position: relative;\n'
    + '  display: flex;\n'
    + '  flex-flow: row nowrap;\n'
    + '  border: 4px solid greenyellow;\n'
    + '}'
    + '</pre>'
    + '<br>Selected files are <b>not uploaded</b>.'
    + '<br>'
    + '(This is just a demo!)'
    + '</template>'
    + '</DropZone>',
};

export const DropzoneItemClassName = Template.bind({});
DropzoneItemClassName.argTypes = {
  ...controls,
};
DropzoneItemClassName.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' dropzoneItemClassName="dropzoneItemClassName"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message>'
    + '<p>Drop here!!!</p>'
    + 'with <b>dropzoneItemClassName</b> prop we can provide a custom class for the dropzone, like this one:'
    + '<pre style="text-align: justify; border: 1px black solid">'
    + '.dropzoneItemClassName {\n'
    + '  \n'
    + '}\n'
    + '.dropzoneItemClassName > .dropzone__item-thumbnail {\n'
    + '  background-color: whitesmoke;\n'
    + '  border: 4px solid black;\n'
    + '}\n'
    + '.dropzoneItemClassName:not(.dropzone--has-thumbnail) > .dropzone__item-thumbnail {\n'
    + '  background-color: darkgrey;\n'
    + '  border: 4px solid greenyellow;\n'
    + '}\n'
    + '</pre>'
    + '<br>Selected files are <b>not uploaded</b>.'
    + '<br>'
    + '(This is just a demo!)'
    + '</template>'
    + '</DropZone>',
};

export const DropzoneDetailsClassName = Template.bind({});
DropzoneDetailsClassName.argTypes = {
  ...controls,
};
DropzoneDetailsClassName.args = {
  template: '<DropZone :maxFiles="Number(10000000000)"'
    + ' dropzoneDetailsClassName="dropzoneDetailsClassName"'
    + ' url="http://localhost:5000/item" '
    + ' :uploadOnDrop="true" '
    + ' :parallelUpload="3" '
    + '>'
    + '<template v-slot:message>'
    + '<p>Drop here!!!</p>'
    + 'with <b>dropzoneItemClassName</b> prop we can provide a custom class for the dropzone, like this one:'
    + '<pre style="text-align: justify; border: 1px black solid">'
    + '\n'
    + '.dropzoneDetailsClassName {\n'
    + '  top: 18px;\n'
    + '  background-color: black;\n'
    + '  border: 3px solid whitesmoke;\n'
    + '  margin: 18px;\n'
    + '  color: greenyellow;\n'
    + '  width: 80%;\n'
    + '}\n'
    + '</pre>'
    + '<br>Selected files are <b>not uploaded</b>.'
    + '<br>'
    + '(This is just a demo!)'
    + '</template>'
    + '</DropZone>',
};
