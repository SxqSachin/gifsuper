import '@babel/polyfill'

import '@/assets/css/base.css'
import '@/assets/css/base.scss'
import '@/assets/css/normalize.scss';

import Vue from 'vue';
import App from './vue/App.vue';

import message from '@/js/msg/message.ts';

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";


Vue.prototype.$message = message;
Vue.config.ignoredElements = [/^ion-/];

new Vue({
  render: h => h(App),
}).$mount('#app');

Sentry.init({
  dsn: "https://079ceae1879746eea587dae7303ef7ff@o495295.ingest.sentry.io/5567856",
  autoSessionTracking: true,
  integrations: [
    new Integrations.BrowserTracing(),
  ],

  tracesSampleRate: 1.0,
});


window.onerror = (e) => {
  Sentry.captureException(err);
}