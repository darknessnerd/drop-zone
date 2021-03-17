export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}
import Dropdown from '@/index'
import { app } from '@storybook/vue3';

app.use(Dropdown);

if (typeof global.process === 'undefined') {
  const { worker } = require('../mocks/browser')
  worker.start({
    serviceWorker: {
      // Points to the custom location of the Service Worker file.
      url: 'https://darknessnerd.github.io/drop-zone/mockServiceWorker.js'
    }
  })
}
