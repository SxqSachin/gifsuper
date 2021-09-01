
<template>
  <div class="w-full flex flex-col">

    <h2 class="text-center mb-4">关于“GifSuper 屏幕录制”功能</h2>
    <ul class="list-disc list-inside">
      <li>该功能需要浏览器提供相关接口支持，建议在高版本现代浏览器下操作，以获得最佳体验。</li>
      <li>该功能与本站其他功能一样，录制全程不包含任何网络活动，不必担心隐私问题。（可断网录制）</li>
      <li>点击下方“开始录制”按钮，即可开始录制屏幕。浏览器弹出窗口后，可选择需要进行屏幕录制的窗口。</li>
      <li>完成录制后，会生成一份可下载的视频。</li>
      <li>该功能属于实验性功能，期待您的使用与反馈。</li>
    </ul>

    <hr class="my-4 md:mb-6">

    <template v-if="isRecordEnable">
      <s-btn v-if="!isRecording" @click="doCapture">{{isRecordDone ? "重新录制" : "开始录制"}}</s-btn>
      <s-btn v-if="isRecording" :disabled="true">正在录制中</s-btn>

      <template v-if="isRecordDone">
        <hr class="my-4 md:mb-6">

        <label for="" class="hidden md:inline">录制结果：（保存视频：右击视频->视频另存为 或 点击下方按钮下载）</label>
        <label for="" class="inline md:hidden">录制结果：（保存视频：长按视频->视频另存为 或 点击下方按钮下载）</label>

        <div class="mb-4"></div>

        <video controls>
          <source :src="videoUrl" type="video/webm">
        </video>

        <s-btn class="mt-4" :disabled="!isRecordDone" @click="download">下载视频</s-btn>
      </template>
    </template>
    <template v-else>
      <div>您的浏览器暂时不支持“屏幕录制”功能，请更换浏览器后重试。</div>
    </template>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, } from 'vue-property-decorator';

import sBtn from '@/components/widget/s-btn.vue';

import { AbstractPanel } from '@/pages/index/js/panel';

@Component({
  components: {
    's-btn': sBtn,
  }
})
export default class extends AbstractPanel {
  public isRecordDone: boolean = false;
  public isRecording: boolean = false;
  public recordedChunks: any[] = [];

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
    this.isRecordDone = false;
    this.isRecording = true;
    this.recordedChunks = [];

    const stream = await this.startCapture();

    const options = { mimeType: "video/webm; codecs=vp9" };
    // @ts-ignore
    const mediaRecorder = new MediaRecorder(stream, options);
    const handleDataAvailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
        this.isRecordDone = true;
        this.isRecording = false;
      } else {
        // ...
      }
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

  public download() {
    if (!this.recordedChunks.length) {
      this.toast("当前没有可供生成视频的数据，请先录制屏幕。", 'warn');
      return;
    }

    const blob = this.generateBlob();
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

  public generateBlob() {
    return new Blob(this.recordedChunks, {
      type: "video/webm"
    });
  }

  get videoUrl() {
    const blob = this.generateBlob();
    return URL.createObjectURL(blob);
  }

  get isRecordEnable() {
    // @ts-ignore
    return navigator?.mediaDevices?.getDisplayMedia && typeof MediaRecorder !== "undefined";
  }
}
</script>

<style lang="scss" scoped>
</style>
<style lang="scss" scoped>
#timeline, #action-panel {
  display: none;
}
</style>