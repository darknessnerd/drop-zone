export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}
import Dropdown from '@/index'
import { app } from '@storybook/vue3';

app.use(Dropdown)
