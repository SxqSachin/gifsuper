import '@babel/polyfill'

import './style/index.css';
import './style/index.scss';

import Vue from 'vue';

import App from './vue/App.vue';

new Vue({
  render: h => h(App),
}).$mount('#app');