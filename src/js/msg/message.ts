import messageComp from '@/components/msg/message-box.vue';
import Vue from 'vue';

const MessageBox = Vue.extend(messageComp);

export interface MessageBoxOptions {
  duration?: number;
  type?: 'info' | 'success' | 'warn' | 'error';
}

const defOptions: MessageBoxOptions = {
  duration: 3000,
  type: 'info',
};

function message(msg: string, options?: MessageBoxOptions): void {
  options = Object.assign(defOptions, options);

  const msgbox = new MessageBox({
    data: {
      msg,
      duration: options.duration,
      type: options.type,
    },
  });

  const vm = msgbox.$mount();

  document.body.appendChild(vm.$el);
}


export default message;
