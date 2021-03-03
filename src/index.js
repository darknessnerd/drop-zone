import '@/assets/basic.scss';
import DropZone from '@/components/DropZone.vue';

const install = (Vue) => {
  Vue.component(DropZone.name, DropZone);
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

DropZone.install = install;

export default DropZone;
