import '@babel/polyfill'

import '@/assets/css/base.css'
import '@/assets/css/base.scss'
import '@/assets/css/normalize.scss';

import Vue from 'vue';
import App from './vue/App.vue';

import message from '@/js/msg/message.ts';

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://079ceae1879746eea587dae7303ef7ff@o495295.ingest.sentry.io/5567856",
  autoSessionTracking: true,
  integrations: [
    new Integrations.BrowserTracing(),
  ],
  beforeSend(event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({ eventId: event.event_id });
    }

    return event;
  },

  tracesSampleRate: 1.0,
});

// window.onerror = (e) => {
//   Sentry.captureException(err);
// }

Vue.prototype.$message = message;
Vue.config.ignoredElements = [/^ion-/];

new Vue({
  render: h => h(App),
}).$mount('#app');