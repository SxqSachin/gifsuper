import '@babel/polyfill'

import '@/assets/css/base.css'
import '@/assets/css/base.scss'
import '@/assets/css/normalize.scss';


import Vue from 'vue';

import App from './vue/App.vue';


new Vue({
  render: h => h(App),
}).$mount('#app');