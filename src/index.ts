import { App, Plugin } from 'vue'
import VueDateRangePicker from './lib/wrapper.vue'

const plugin: Plugin = {
  install: (app: App, options: any) => {
    app.component('daterange-picker', VueDateRangePicker)
  },
}

export default plugin
