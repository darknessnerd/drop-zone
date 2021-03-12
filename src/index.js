import '@/assets/main.scss';
import DropZone from '@/DropZone.vue';

const install = (Vue) => {
  Vue.component(DropZone.name, DropZone);
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

DropZone.install = install;

export default DropZone;
