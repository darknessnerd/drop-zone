import { shallowMount } from '@vue/test-utils';
import DropZone from '@/DropZone.vue';

describe('DropZone.vue', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  it('renders correctly', () => {
    const wrapper = shallowMount(DropZone,
      {
        attachTo: document.body,
      });
    expect(wrapper).toMatchSnapshot();
    wrapper.unmount();
  });
});
