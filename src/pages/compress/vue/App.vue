<template>
  <div class="wrapper p-4 sm:p-4 md:p-8 lg:p-8 max:w-screen w-full">

    <div v-if="false && !getNotification(1)" data-n-ver="1" class="w-full py-2 px-4 mb-8 rounded-md border border-color-info flex justify-between items-center">
      <div> 新功能：现在可以实时预览各项编辑操作啦！ </div>
      <div class="color-link transform rotate-45 text-2xl cursor-pointer" @click="clearNotification(1);"> + </div>
    </div>

    <div v-if="!getNotification(2)" data-n-ver="2" class="w-full py-2 px-4 mb-8 rounded-md border border-color-info flex justify-between items-center">
      <div> 新功能：更新了滤镜功能！ </div>
      <div class="color-link transform rotate-45 text-2xl cursor-pointer" @click="clearNotification(2);"> + </div>
    </div>

    <!-- todo 严重bug 长度过大的gif上传后存在内存爆栈 导致标签页假死 -->
    <div class="top mb-6" v-if="!canEdit">
      <upload class="uploader mx-auto" :before-upload="upload" accept=".gif">上传GIF</upload>
    </div>

    <fieldset v-if="!canEdit" class="pb-4">
      <h2 class="font-normal text-lg color-info"> 提示： 上传Gif后可在下方进行编辑 </h2>
    </fieldset>

    <sbtn @click="onCompressFuzz">压缩Fuzz</sbtn>
    <sbtn @click="onCompressColor">压缩Color</sbtn>

    <img :src="nImg" alt="">
  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, } from 'vue-property-decorator';

import Upload from '@/components/widget/s-upload.vue';
import sbtn from '@/components/widget/s-btn.vue';
import sInput from '@/components/widget/s-input.vue';

import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

import { Chrome as ColorPicker } from 'vue-color';

import { parseSrcGif, dataUrlToFile, GifGenerator, GifFrameList, GifFrame, getFileInfo } from '@/js/gif';

import { fabric } from 'fabric';

const FrameIndex = 1;
const TextZIndex = 10;

interface GenerateOption {
  baseInterval: number;

  generateRange: [number, number];
  removeRange?: [number, number];
}

import { Toasted } from '../js/type';

import axios from 'axios';

@Component({
  components: {
    'upload': Upload,
    sbtn,
    's-input': sInput,
    slider: VueSlider,
    'color-picker': ColorPicker,
  },
})
export default class extends Vue implements Toasted {
  // 上传的Gif
  public rawFile: File = null;
  public oriImageSrc: string = '';

  public oriWidth: number = 0;
  public oriHeight: number = 0;

  public canEdit: boolean = false;

  public nImg: string = '';

  public mounted() {
    document.getElementById('loading-ph')?.remove();
  }

  public toast(msg: string, type: string = 'info', duration: number = 3000) {
    // @ts-ignore
    this.$message(msg, { type, duration})
  }

  public async upload(e: FileList) {
    const gifFile = e[0];

    if (gifFile.type !== 'image/gif') {
      this.toast('只支持上传Gif文件', 'error');
      return;
    }

    this.rawFile = gifFile;

    this.canEdit = true;
  }

  public clearNotification(ver: number) {
    localStorage.setItem(`notification-update-${ver}`, '1');

    const notificationDOM = document.querySelector(`[data-n-ver="${ver}"]`);

    if (notificationDOM) {
      notificationDOM.remove();
    }
  }
  public getNotification(ver: number): boolean {
    return !!localStorage.getItem(`notification-update-${ver}`);
  }

  public async onCompressFuzz() {
    const formData = new FormData();
    formData.append('img', this.rawFile);
    formData.append('fuzz', '7');
    const res = await axios.post('http://localhost:3000/compress/fuzz', formData);
    const rawResponse = res.data;


    const blob = new Blob([rawResponse], { type: res.headers["content-type"] });
    const url = URL.createObjectURL(blob);

    console.log(res);

    console.log(blob);

    // convert to Base64
    // toData

    // // create an image
    var outputImg = document.createElement('img');
    outputImg.src = url;

    // append it to your page
    document.body.appendChild(outputImg);
  }
  public async onCompressColor() {
    const formData = new FormData();
    formData.append('img', this.rawFile);
    formData.append('color', '64');
    const res = await axios.post('http://localhost:3000/compress/color', formData);
    const rawResponse = res.data;

    console.log(res);

    // convert to Base64
    var b64Response = btoa(unescape(encodeURIComponent(rawResponse)))

    // create an image
    var outputImg = document.createElement('img');
    outputImg.src = 'data:image/png;base64,'+b64Response;

    // append it to your page
    document.body.appendChild(outputImg);
  }
}
</script>

<style lang="scss" scoped>
  .wrapper {
    .uploader {
      max-width: calc(100vw - 2rem);
    }

    & /deep/ .canvas-container {
      margin: 0 auto;
    }
  }

  .vc-chrome {
    box-shadow: none;
    & /deep/ .vc-chrome-fields-wrap {
      display: none;
    }
  }

  @media screen and (min-width: 768px) {
    .md-auto-sticky {
      position: sticky;
      top: -90px;
    }
    .md-auto-sticky.md\:top-0 {
      top: 0;
    }
  }
  @media screen and (max-width: 767px) {
    .md-preview-sticky {
      position: sticky;
      top: -90px;
    }
  }
</style>