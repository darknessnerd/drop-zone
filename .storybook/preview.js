export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}
import Dropdown from '@/index'
import { app } from '@storybook/vue3';

if (typeof global.process === 'undefined') {
  const { worker } = require('../mocks/browser')
  worker.start({
    onUnhandledRequest(req) {
      console.warn(req);
      console.error(
        'Found an unhandled %s request to %s',
        req.method,
        req.url.href,
      )
    },
  })
}

app.use(Dropdown)
