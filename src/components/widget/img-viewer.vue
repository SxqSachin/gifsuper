<template>
  <div class="img-viewer-wrapper p-8 w-screen h-screen fixed top-0 left-0 flex flex-col justify-center items-center"
    @click.self="onMaskClick"
    :style="viewerVariableStyle"
    v-show="isShow">

    <div class="mb-4 text-white text-xl fixed h-6 top-0 mt-8">
      {{ curImgIndex + 1 }} / {{ imgList.length }}
    </div>
    <div class="mb-4 text-white text-xl h-6 w-1 invisible">
    </div>

    <div class="img-wrapper" :class="imgWrapperClass">
      <img :src="curImg" alt="img">
    </div>

    <div class="action-wrapper action-wrapper-ph pointer-events-none"></div>
    <div class="action-wrapper fixed flex justify-center items-center">
      <button 
        class="prev h-full flex justify-center" 
        :class="{'text-white': curImgIndex > 0}"
        @click="showPrevImg">
        <arrow-back w="48" h="48"></arrow-back>
      </button>

      <button class="rotate h-full flex justify-center text-white ml-4" @click="rotateImg">
        <icon-rotate w="38" h="38"></icon-rotate>
      </button>

      <button 
        class="next h-full flex justify-center ml-4" 
        :class="{'text-white': curImgIndex < imgList.length - 1}"
        @click="showNextImg">
        <arrow-forward w="48" h="48"></arrow-forward>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Model, Component, Prop, Watch} from 'vue-property-decorator';

import IosArrowBackIcon from 'vue-ionicons/dist/ios-arrow-back.vue';
import IosArrowForwardIcon from 'vue-ionicons/dist/ios-arrow-forward.vue';
import IosRefreshIcon from 'vue-ionicons/dist/ios-refresh.vue';

const bodyDOM: HTMLBodyElement = document.querySelector('body') as HTMLBodyElement;

@Component({
  components: {
    'arrow-back': IosArrowBackIcon,
    'arrow-forward': IosArrowForwardIcon,
    'icon-rotate': IosRefreshIcon,
  },
})
export default class extends Vue {
  @Prop({type: String, default: ''})
  public container?: string;

  public rotateDegree: number = 0;

  public curImg: string | null = null;

  public imgList: string[] = [];
  public curImgIndex: number = 0;

  public mounted() {
    document.addEventListener('click', this.onImgClick, false);
  }

  public beforeDestroy() {
    document.removeEventListener('click', this.onImgClick);
  }

  public onImgClick(e: MouseEvent) {
    // @ts-ignore
    for (let target = e.target as HTMLElement; target && target !== this; target = target.parentNode) {
      if (!target) {
        continue;
      }

      if (!target.matches) {
        continue;
      }

      if (target.matches(`${this.container} img`)) {
        const imgDOM = e.target as HTMLImageElement;

        this.curImg = imgDOM.getAttribute('src');
      }
    }
  }

  @Watch('curImg')
  public onSrcChanged(val: string, oldVal: string) {
    const isShow = !!val;

    if (isShow) {
      // bodyDOM.classList.add('fixed-body');
    } else {
      // bodyDOM.classList.remove('fixed-body');
    }

    if (!val) {
      return;
    }

    this.refreshImgList();
  }

  public refreshImgList() {
    this.imgList = [];
    document.querySelectorAll(`${this.container} img`).forEach((elem, index) => {
      const imgSrc = elem.getAttribute('src');

      if (!imgSrc) {
        return;
      }

      this.imgList.push(imgSrc);

      if (imgSrc === this.curImg) {
        this.curImgIndex = index;
      }
    });
  }

  public onMaskClick() {
    this.curImg = null;
  }

  public rotateImg() {
    this.rotateDegree += 90;

    if (this.rotateDegree >= 360) {
      this.rotateDegree = 0;
    }
  }

  public showPrevImg() {
    if (this.curImgIndex <= 0) {
      return;
    }

    this.curImg = this.imgList[--this.curImgIndex];
  }

  public showNextImg() {
    if (this.curImgIndex >= this.imgList.length - 1) {
      return;
    }
    this.curImg = this.imgList[++this.curImgIndex];
  }

  get isShow(): boolean {
    return !!this.curImg;
  }

  get viewerVariableStyle(): {[variable: string]: any} {
    const style = {
      '--rotate-degree': `${this.rotateDegree}deg`,
    };

    return style;
  }

  get imgWrapperClass(): {[cls: string]: boolean} {
    const cls = {
      vertical: this.rotateDegree === 90 || this.rotateDegree === 270,
    };

    return cls;
  }
}
</script>

<style lang="scss">
  body.fixed-body {
    overflow: hidden;
  }
</style>

<style lang="scss" scoped>
  .img-viewer-wrapper {
    background-color: #000000a3;

    z-index: 10000;

    .img-wrapper {
      max-height: 80%;

      user-select: none;

      transform: rotateZ(var(--rotate-degree));

      &.vertical {
        max-width: 80vh;
      }

      img {
        max-width: 100%;
        max-height: 100%;
      }
    }

    .action-wrapper {
      height: 4rem;
      width: calc(100% - 2rem);

      bottom: 3rem;

      background: #00000066;

      &.action-wrapper-ph {
        visibility: hidden;
        height: calc(100% - 4rem - 80%);
      }
    }
  }
</style>