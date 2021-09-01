
<template>
  <div>
    <s-btn @click="doCapture">开始录制</s-btn>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, } from 'vue-property-decorator';

import sBtn from '@/components/widget/s-btn.vue';

import { Toasted } from '../../../js/type';
import { delay } from '@/js/utility';
import { AbstractPanel } from '@/pages/index/js/panel';

@Component({
  components: {
    's-btn': sBtn,
  }
})
export default class extends AbstractPanel {
  public mounted() {
    console.log('capture panel loaded');
  }

  get tabInfo() {
    return { name: 'capture', title: '录屏', icon: '/static/icons/capture.svg', };
  }

  get panelName() {
    return 'capture-panel';
  }

  public async doCapture() {
    const stream = await this.startCapture();

    const options = { mimeType: "video/webm; codecs=vp9" };
    // @ts-ignore
    const mediaRecorder = new MediaRecorder(stream, options);
    const recordedChunks = [];

    const handleDataAvailable = (event) => {
      console.log("data-available");
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        console.log(recordedChunks);
        download();
      } else {
        // ...
      }
    }
    const download = () => {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      //@ts-ignore
      a.style = "display: none";
      a.href = url;
      a.download = "屏幕录制.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    }

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
  }

  public async startCapture(displayMediaOptions = null) {
    let captureStream = null;

    try {
      // @ts-ignore
      captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch(err) {
      console.error("Error: " + err);
    }
    return captureStream;
  }
}
</script>

<style lang="scss" scoped>

</style>