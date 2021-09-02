
<template>
  <div class="w-full flex flex-col">

    <div class="w-full flex flex-col">
      <h3 class="text-center mb-2">关于“GifSuper 屏幕录制”功能</h3>
      <ul class="list-disc list-inside">
        <li>该功能需要浏览器提供相关接口支持，建议在高版本现代浏览器下操作，以获得最佳体验。</li>
        <li>该功能与本站其他功能一样，录制全程不包含任何网络活动，不必担心隐私问题。（可断网录制）</li>
        <li>首次使用时，浏览器会向您获取相关权限。</li>
        <li>该功能属于实验性功能，期待您的使用与反馈。</li>
      </ul>

      <h3 class="text-center mt-4 mb-2">使用方法</h3>
      <ol class="list-decimal list-inside">
        <li>点击下方“开始录制”按钮，即可开始录制屏幕。</li>
        <li>浏览器会要求您选择需要进行录制的窗口（选择录制屏幕时，可任意切换窗口。），选择完毕后即可开始录制。</li>
        <li>当需要停止录制时，点击下方的“停止录制”按钮，或点击由浏览器提供的“停止分享”按钮。</li>
        <li>完成录制后，即可生成一份可下载的视频。</li>
      </ol>

      <hr class="my-4 md:mb-6">
    </div>

    <template v-if="isRecordEnable">

      <template v-if="!isRecording">
        <div class="flex flex-row items-center mb-4">
          <span>录制麦克风：</span><s-btn :type="recordAudio ? 'success' : 'info'" @click="recordAudio = !recordAudio">{{ recordAudio ? '开启' : '关闭' }}</s-btn>
        </div>
        <s-btn @click="doCapture">{{isRecordDone ? "重新录制" : "开始录制"}}</s-btn>
      </template>
      <template v-else>
        <p class="mb-4 md:mb-6 w-full text-center">正在录制中...</p>
        <s-btn v-if="isRecording" type="error" @click="stopCapture">停止录制</s-btn>
      </template>

      <template v-if="isRecordDone">
        <hr class="my-4 md:mb-6">

        <label for="" class="hidden md:inline">录制结果：（保存视频：右击视频->视频另存为 或 点击下方按钮下载）</label>
        <label for="" class="inline md:hidden">录制结果：（保存视频：长按视频->视频另存为 或 点击下方按钮下载）</label>

        <div class="mb-4"></div>

        <video controls autoplay>
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
  public videoType: string = "webm";

  public recordAudio: boolean = false;

  // public stream: MediaStream = null;
  public tracks: MediaStreamTrack[] = [];

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
    this.tracks = [];

    const stream: MediaStream = await this.startCapture({
      video: true,
      audio: this.recordAudio,
    });
    this.tracks = stream.getTracks();

    const options = { mimeType: `video/${this.videoType}; codecs=vp9` };
    // @ts-ignore
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
        this.isRecordDone = true;
        this.isRecording = false;
      } else {
        // ...
      }
    }
    mediaRecorder.start();
  }

  public stopCapture() {
    if (!this.tracks?.length) {
      return;
    }

    this.tracks.forEach(track => {
      console.error(track);
      track.stop();
    })
  }

  public async startCapture(displayMediaOptions: MediaStreamConstraints = null) {
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
    a.download = `屏幕录制.${this.videoType}`;
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