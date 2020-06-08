<template>
  <div class="wrapper p-4 sm:p-4 md:p-8 lg:p-8 max:w-screen overflow-x-hidden">

    <!-- todo 严重bug 长度过大的gif上传后存在内存爆栈 导致标签页假死 -->
    <div class="top mb-6">
      <upload class="uploader mx-auto" :before-upload="upload" accept=".gif">上传GIF</upload>
    </div>

    <div v-show="!!oriImageSrc" class="srcgif-wrapper flex mb-4 items-center  p-4 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md">
      <div class="src w-full flex-shrink-0">
        <label v-show="canEdit || isGenerating" for="srcgif" class="inline-block mb-4 hidden md:block">原Gif：</label>
        <label v-show="canEdit || isGenerating" for="srcgif" class="inline-block mb-4 block md:hidden">原始Gif：（调整好设置后点击下方“生成”按钮）</label>
        <div id="srcgif" class="flex justify-center items-center hidden"> </div>
        <div v-show="!!oriImageSrc" class="flex flex-col justify-center items-center">
          <img ref="oriImageDom" :src="oriImageSrc" alt="" srcset=""/>
          <div v-show="!!oriImageSrc && oriGifLoadProgress < 1" class="mask w-full h-full float-left absolute flex justify-center items-center bg-opacity-75 bg-gray-800 text-white text-lg text-center" :style="{width: `${showWidth}px`, height: `${showHeight}px`}"> 
            读取数据中： {{ Math.max(0, (oriGifLoadProgress * 100 - 1).toFixed(0)) }} %
          </div>
        </div>
      </div>
    </div>

    <div class="edit-panel w-full p-1 md:p-6 rounded-md border-color-2 flex flex-col">

      <fieldset v-if="!canEdit" class="pb-4 ">
        <h2 class="font-normal text-lg color-info"> 提示： 上传Gif后可在下方进行编辑 </h2>
      </fieldset>

      <div class="flex-1 flex flex-col mr-0 mb-4 w-full">

        <fieldset class="flex items-start flex-col md:flex-row p-4 mb-8 w-full bg-assets shadow hover:shadow-lg rounded-md" v-show="canEdit">
          <h2 class="mb-4 text-lg"> 图片信息 </h2>

          <div class="flex w-full">
            <div class="flex items-center mb-4 mr-0 md:mr-4 w-full md:w-auto">
              <label for="interval" class="whitespace-no-wrap flex-0 inline-block">总帧数：</label>
              <div>{{ this.frameList.length }}</div>
            </div>
            <div class="flex items-center mb-4 mr-0 md:mr-4 w-full md:w-auto">
              <label for="interval" class="whitespace-no-wrap flex-0 inline-block">大小：</label>
              <div>{{ this.rawFile ? +(this.rawFile.size / (1024 * 1024)).toFixed(2) : 0 }}MB</div>
            </div>
          </div>
        </fieldset>

        <fieldset class="flex items-start flex-col md:flex-row p-4 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md">
          <h2 class="mb-4 text-lg"> 基础调整 </h2>

          <div class="flex flex-col justify-center items-start mb-4 pb-8 w-full">
            <label for="">
              <span>帧间隔：</span>
              <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">毫秒单位，帧间隔越小，生成后的Gif就越流畅，同时总时长变短</span>
            </label>

            <slider class="flex-1"
              v-model="interval"
              :min="15"
              :max="300"
              :marks="[15, 300]"
              :lazy="true"
              :disabled="!canEdit"
              :drag-on-click="true"
              :contained="true"
              tooltip="always"
              tooltip-placement="bottom"
              style="width: calc(100% - 14px);"
             ></slider>
          </div>

          <div class="flex flex-col md:flex-row">
            <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" title="开启后生成的Gif将会是原Gif的倒放版" :disabled="!canEdit" type="info" @click="toggleRevert">倒放：{{ revert ? '开' : '关' }}</sbtn>
            <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" title="开启后生成的Gif将会循环播放，关闭后则只会进行1次播放循环" :disabled="!canEdit" @click="toggleRepeat">循环：{{ repeat ? '开' : '关' }}</sbtn>
            <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" title="开启后将会抽去原Gif中一般的帧数，可以减小文件大小，代价是Gif流畅程度将会下降" :disabled="!canEdit" @click="toggleRs">抽帧：{{ rs ? '开' : '关' }}</sbtn>
            <!-- <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" title="重置时间轴" :disabled="!canEdit" type="error" @click="makeTimeline">重置</sbtn> -->
          </div>

        </fieldset>

        <fieldset class="flex items-start flex-col md:flex-row p-4 mt-8 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md">
          <h2 class="mb-4 text-lg">
            <span> 添加文字/图片 </span>
            <span class="inline-block pb-2 text-color-neutral text-sm font-normal border-gray-400">添加后可于下方“时间轴”处调整文字/图片位置</span>
          </h2>
          <div class="w-full flex flex-wrap items-start flex-col">
            <div class="flex justify-center items-center mr-4 mb-4 w-full">
              <label for="" class="whitespace-no-wrap">文字内容：</label>
              <s-input class="w-full" v-model="textContent" placeholder="请输入内容，支持可输入的表情"></s-input>
            </div>

            <div class="flex items-center mb-4">
              <label for="" class="whitespace-no-wrap">文字颜色：</label>
              <color-picker class="z-50 ml-0 border border-gray-500" v-model="textColorObj"></color-picker>
            </div>

            <div class="flex justify-center items-center mb-4 pb-8 w-full">
              <label for="" class="whitespace-no-wrap">文字大小：</label>
              <slider class="flex-1"
                v-model="textSize"
                :marks="[10, 128]"
                :min="10"
                :max="128"
                :lazy="true"
                :disabled="!canEdit"
                :drag-on-click="true"
                tooltip="always"
                tooltip-placement="bottom"
               ></slider>
            </div>

            <sbtn class="mb-4" :disabled="!canEdit" @click="enableTextStroke = !enableTextStroke">文字边线：{{ enableTextStroke ? '开启' : '关闭' }}</sbtn>

            <div class="flex flex-col justify-start mb-4 w-full" v-show="enableTextStroke">
              <div class="flex items-center mb-4">
                <label for="" class="whitespace-no-wrap">字边线色：</label>
                <color-picker class="z-50 ml-0 border border-gray-500" v-model="textStrokeObj"></color-picker>
              </div>

              <div class="flex justify-center items-center mb-4 pb-8 w-full">
                <label for="" class="whitespace-no-wrap">边线粗细：</label>
                <slider class="flex-1"
                  v-model="textStrokeWidth"
                  :marks="[1, 12]"
                  :min="1"
                  :max="12"
                  :lazy="true"
                  :disabled="!canEdit"
                  :drag-on-click="true"
                  tooltip="always"
                  tooltip-placement="bottom"
                 ></slider>
              </div>

            </div>

            <!-- <div class="flex justify-center items-center mb-4">
              <sbtn
                class="mr-4 mb-1"
                @click="addText(textContent, textColor)"
                :disabled="!canEdit">为指定帧添加文字</sbtn>
              <s-input v-model="textRange" placeholder="如:0,1,2,(4-10)"></s-input>
            </div> -->
            <sbtn
              class="mb-1 w-full"
              @click="addTextToAllFrame"
              :disabled="!canEdit">为所有帧添加文字</sbtn>


            <div class="flex flex-col justify-center items-start mt-6 w-full">
              <label for="" class="whitespace-no-wrap mb-1">
                <span> 添加图片 </span>
                <sup class="text-red-300"> 测试 </sup>
                <span>：</span>
              </label>
              <span class="inline-block mb-3 pb-2 text-color-neutral text-sm border-gray-400">图片的宽高暂时不会自动调整，请在外部调整好尺寸再进行上传。</span>
              <upload class="mt-2 uploader w-full" :before-upload="addImage" :disabled="!canEdit">为所有帧添加图片</upload>
            </div>

          </div>
        </fieldset>

        <fieldset class="flex items-start flex-col md:flex-row p-4 mt-8 w-full bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md">
          <h2 class="mb-4 text-lg"> 帧操作 </h2>
          <div class="flex flex-col justify-center items-start mb-4 pb-8 w-full">
            <label for="">
              <span>区间裁剪：</span>
              <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">生成后的Gif仅保留指定区间内的帧图像</span>
            </label>

            <div class="img-wrapper w-full flex justify-center items-center z-50">
              <img class="absolute transform -translate-y-1/2" v-show="!!curFrameSplitFrameImg" :src="curFrameSplitFrameImg" alt=""/>
            </div>

            <slider class="flex-1 py-0"
              v-model="frameSplitRange"
              :disabled="!canEdit"
              :min="1"
              :max="!!this.frameList.length ? this.frameList.length : 10"
              :marks="[1, (!!this.frameList.length ? this.frameList.length : 10)]"
              :contained="true"
              tooltip="always"
              tooltip-placement="bottom"
              @dragging="onFrameSplitRangeDragging"
              @drag-end="onFrameSplitRangeDragEnd"
              style="width: calc(100% - 14px);"
             ></slider>
          </div>

          <div class="flex flex-col justify-center items-start mb-4 pt-4 pb-8 w-full">
            <label for="">
              <span>区间去除：</span>
              <span class="inline-block pb-2 text-color-neutral text-sm border-gray-400">删除指定区间内的帧，受制于区间裁剪数值</span>
            </label>
            <sbtn class="mb-1" :disabled="!canEdit" @click="enableFrameRangeRemove = !enableFrameRangeRemove">区间去除：{{ enableFrameRangeRemove ? '开启' : '关闭' }}</sbtn>

            <div class="img-wrapper w-full flex justify-center items-center z-50">
              <img class="absolute transform -translate-y-1/2" v-show="!!curFrameRemoveFrameImg" :src="curFrameRemoveFrameImg" alt=""/>
            </div>

            <slider class="flex-1 w-full"
              v-show="enableFrameRangeRemove"
              :disabled="!canEdit"
              ref="frameRemoveRange"
              v-model="frameRemoveRange"
              :min="frameSplitRange[0]"
              :max="frameSplitRange[1]"
              :marks="[frameSplitRange[0], frameSplitRange[1]]"
              :contained="true"
              tooltip="always"
              tooltip-placement="bottom"
              @dragging="onFrameRemoveRangeDragging"
              @drag-end="onFrameRemoveRangeDragEnd"
              style="width: calc(100% - 14px);"
             ></slider>
          </div>
        </fieldset>

        <fieldset class="pt-8 ">
          <sbtn type="success" @click="generate" :disabled="isGenerating || !canEdit">生成</sbtn>
          <span class="inline-block py-2 text-color-neutral text-sm border-gray-400">tips: 受原Gif大小影响，点击“生成”按钮后可能会有短暂卡顿，此时耐心等候即可。</span>
        </fieldset>
      </div>

      <div v-show="isGenerating || generateDone" class="flex-0 w-full p-4 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md">
        <label for="" class="hidden md:inline" v-show="generateDone">新图像：（保存图片：右击图片->图片另存为）</label>
        <label for="" class="inline md:hidden" v-show="generateDone">新图像：（长按图片->保存图片）</label>

        <div class="flex justify-center h-full items-center mt-4">
          <div class="my-12 md:my-0" v-show="isGenerating">
            <div class="mb-12 text-center">生成中： {{progress}}%</div>

            <!-- <loading></loading> -->
            <div class="loading-calm-cat"></div>
          </div>

          <div v-show="!isGenerating">
            <div id="dtsgif" class="mt-4 md:mt-0 flex justify-center items-center"> </div>
          </div>
        </div>
      </div>

    </div>

    <div class="timeline mt-4 p-4 bg-assets shadow hover:shadow-lg transition-shadow transition-time-func rounded-md">
      <label class="inline-block pb-4">
        <span> 时间轴</span>
        <sup class="text-red-300"> alpha </sup>
        <span class="hidden md:inline">：（delete键：删除当前选中文字/图片）</span>
      </label>
      <div class="md:hidden my-2 flex justify-start flex-wrap">
        <sbtn class="mb-1" title="删除当前选中元素" @click="deleteActivedObject" type="error">删除当前选中文字/图片</sbtn>
      </div>
      <div ref="timeline-wrapper" class="canvas-wrapper border rounded-sm border-gray-300">
        <canvas id="stage"></canvas>
        <canvas id="dragbar"></canvas>
      </div>
    </div>

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';

import Upload from '@/components/widget/s-upload.vue';
import sbtn from '@/components/widget/s-btn.vue';
import sInput from '@/components/widget/s-input.vue';
import LoadingRing from '@/components/widget/loading-ring.vue';

import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

import { Chrome as ColorPicker } from 'vue-color';

import { parseSrcGif, dataUrlToFile, GifGenerator, GifFrameList, GifFrame } from '@/js/gif';

import { fabric } from 'fabric';

const FrameIndex = 1;
const TextZIndex = 10;

interface GenerateOption {
  baseInterval: number;

  generateRange: [number, number];
  removeRange?: [number, number];
}

@Component({
  components: {
    'upload': Upload,
    sbtn,
    's-input': sInput,
    'loading': LoadingRing,
    slider: VueSlider,
    'color-picker': ColorPicker,
  },
})
export default class extends Vue {
  // fabric canvas对象
  public canvas!: fabric.Canvas;
  public dragBarCanvas!: fabric.Canvas;


  // 上传的Gif
  public rawFile: File = null;
  public oriImageSrc: string = '';

  // 原图片宽高
  public oriWidth: number = 0;
  public oriHeight: number = 0;

  // 表面显示图片宽高
  public showWidth: number = 0;
  public showHeight: number = 0;


  // 帧列表
  public frameList: GifFrameList = [];
  public oriFrameList: any[] = [];

  public generateOption: {[key: string]: any};

  public oriGifLoadProgress: number = 0;

  // 默认帧间隔
  public interval: number = 60;

  public isGenerating: boolean = false;
  public generateDone: boolean = false;


  // 文字操作 start
  public textContent: string = '';
  public textColorObj: {[key: string]: string} = { hex: '#fff' };
  public textStrokeObj: {[key: string]: string} = { hex: '#000' };
  public textSize: string = '42';
  public textStrokeWidth: number = 1;

  public enableTextStroke: boolean = false;
  // 文字操作 end


  // 帧区间裁剪 start
  public frameSplitRange: [number, number] = [1, 10]; // 区间裁剪起始值
  public curFrameSplitFrameImg: string = ''; // 当前帧图像
  // 帧区间裁剪 end


  // 帧区间去除 start
  public enableFrameRangeRemove: boolean = false;
  public frameRemoveRange: [number, number] = [1, 1]; // 区间去除起始值
  public curFrameRemoveFrameImg: string = ''; // 当前帧图像
  // 帧区间去除 end


  // 倒放
  public revert: boolean = false;

  // 单帧宽/高度
  public frameWidth: number = 0;
  public frameHeight: number = 0;

  // 生成进度
  public progress: number = 0;

  // 是否循环
  public repeat: boolean = true;

  // 是否抽帧
  public rs: boolean = false;

  // timeline偏移值
  public timelineLeft: number = 0;

  public clipboard: any[] = [];

  get canEdit(): boolean {
    return !!this.frameList?.length;
  }

  get textColor(): string {
    return this.textColorObj?.hex ?? '#000';
  }

  get textStrokeColor(): string {
    return this.textStrokeObj?.hex ?? '#fff';
  }

  get totalFrameCount(): number {
    return this.frameList.length;
  }

  public mounted() {
    document.getElementById('loading-ph')?.remove();

    fabric.Object.prototype.objectCaching = false;

    this.canvas = new fabric.Canvas('stage');

    this.dragBarCanvas = new fabric.Canvas('dragbar');

    this.initKeyPressEvent();
  }

  public async getImageData(file: File): Promise<GifFrame> {
    return new Promise(resolve => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const data = {
          imgFileSrc: img.src,
          width: img.width,
          height: img.height,
        };
        img.remove();
        resolve(data);
      }
      img.src = url;
    });
  }

  public async upload(e: FileList) {
    const gifFile = e[0];

    if (gifFile.type !== 'image/gif') {
      this.toast('只支持上传Gif文件', 'error');
      return;
    }

    if (!gifFile || !this.canvas) {
      return;
    }

    this.rawFile = gifFile;

    const { width, height, imgFileSrc } = await this.getImageData(gifFile);

    this.oriWidth = width;
    this.oriHeight = height;
    this.oriImageSrc = imgFileSrc;

    await this.$nextTick();

    const {width: showWidth, height: showHeight} = this.$refs?.oriImageDom as any;

    this.showWidth = showWidth;
    this.showHeight = showHeight;

    this.resetStage();

    const frameList = await parseSrcGif(gifFile, (cur, total) => {
      this.oriGifLoadProgress = cur / total;
    });
    this.oriGifLoadProgress = 1;

    this.frameList = frameList;
    this.oriFrameList = frameList;

    await this.makeTimeline(frameList);
    this.updateEditData();
  }

  public toggleRevert() {
    this.revert = !this.revert;

    // @ts-ignore
    this.$message(`已${this.revert ? '开启' : '关闭'}倒放`, {type: 'info'})
  }

  public toggleRepeat() {
    this.repeat = !this.repeat;

    // @ts-ignore
    this.$message(`已${this.repeat? '开启' : '关闭'}循环播放`, {type: 'info'})
  }

  public toggleRs() {
    this.rs = !this.rs;

    // @ts-ignore
    this.$message(`已${this.rs? '开启' : '关闭'}抽帧${this.rs? '，将抽去原Gif一半的帧数' : ''}`, {type: 'info'})
  }

  public resetStage() {
    const srcgifDOM = document.querySelector('#srcgif');

    if (srcgifDOM) {
      srcgifDOM.innerHTML = '';
    }

    if (!!this.canvas) {
      this.canvas.clear();
    }
  }

  public addTextToAllFrame(textContent?: string, textColor?: string) {
    const textArr: fabric.IText[] = [];

    this.canvas!.discardActiveObject();

    const group: fabric.Group = new fabric.Group();

    if (!textContent) {
      textContent = this.textContent;
    }

    if (!textColor) {
      textColor = this.textColor ?? '#333';
    }

    if (!textContent) {
      this.toast('请填写文字内容', 'warn');
      return;
    }

    Array.from(this.frameList.keys()).forEach(index => {
      const itext = new fabric.IText(textContent, {
        fill: textColor,
        left: index * ((this.frameWidth ?? 0) + 1),
        top: 40,
        fontSize: parseInt(this.textSize),
      });

      if (this.enableTextStroke) {
        itext.set({
          stroke: this.textStrokeColor,
          strokeWidth: this.textStrokeWidth,
        });
      }

      group.addWithUpdate(itext);
    });

    this.canvas.enableRetinaScaling = true;
    this.canvas.add(group);
    this.canvas.setActiveObject(group).renderAll();
    // group.toActiveSelection();

    this.toast('添加成功，可在下方时间轴调整文字位置', 'success');
  }

  public async addImage(imgList: FileList) {
    const img = imgList[0];

    if (!img.type.includes('image')) {
      this.toast('只支持上传图片', 'error');
      return;
    }

    const frameData = await this.getImageData(img);

    const pimgArr: Promise<fabric.Object>[] = [];

    const group = new fabric.Group()

    this.frameList.forEach((val, index)=> {
      pimgArr.push(new Promise(resolve => {
        fabric.Image.fromURL(frameData.imgFileSrc, img => {
          const nimg = img.set({
            left: index * ((this.frameWidth ?? 0) + 1),
            top: 5,
            width: frameData.width,
            height: frameData.height,
          });

          resolve(nimg);
        });
      }));
    });

    const res = await Promise.all(pimgArr);

    res.forEach(val => {
      group.addWithUpdate(val);
    })

    this.canvas.add(group).renderAll();

    this.toast('添加成功，可在下方时间轴调整图片位置', 'success');
  }

  public async makeTimeline(frameList: GifFrameList) {
    if (!this.canvas) {
      console.error('makrTimeline: canvas not ready');
      return;
    }

    if (!frameList) {
      frameList = this.oriFrameList;
    }

    this.canvas.getObjects().forEach(obj => {
      // @ts-ignore
      if (obj.frameData) {
        this.canvas.remove(obj);
      }
    })

    const firstImg = frameList[0];

    const frameWidth = this.frameWidth = this.oriWidth; // firstImg.width as number;
    const frameHeight = this.frameHeight = this.oriHeight; // firstImg.height as number;

    const canvasTotalWidth = (frameWidth + 1) * this.totalFrameCount;
    const canvasHeight = frameHeight as number;

    const timelineWrapperWidth = (this.$refs['timeline-wrapper'] as HTMLElement).offsetWidth - 2;

    const scale = 1;
    const divideWidth = 1;

    this.canvas.setWidth(timelineWrapperWidth);
    this.canvas.setHeight(canvasHeight);

    this.frameList = frameList.map((frame, index) => {
      const percent = (index + 1) / frameList.length;
      fabric.Image.fromURL(frame.imgFileSrc, img => {
        if (!img.width || !img.height) {
          return;
        }

        const curWidth = img.width * scale;
        const curHeight = img.height * scale;

        const nimg = img.set({
          left: index * (curWidth + divideWidth),
          top: 0,
          width: img.width,
          name: 'frame' + index,
          lockMovementX: true,
          lockMovementY: true,
          hasControls: false,
          selectable: false,
        }).scale(scale);

        // @ts-ignore
        nimg.frameIndex = index;
        // @ts-ignore
        nimg.frameData = frame;

        this.canvas.add(nimg);
      });

      return frame;
    });

    this.resetDragBar(timelineWrapperWidth, canvasTotalWidth);
  }

  public resetDragBar(containerWidth: number, totalFrameWidth: number) {
    this.dragBarCanvas.clear();

    if (containerWidth >= totalFrameWidth) {
      return;
    }

    this.dragBarCanvas.setWidth(containerWidth);
    this.dragBarCanvas.setHeight(30);

    const percent = (containerWidth / totalFrameWidth);

    const dragBarWidth =  percent * containerWidth;
    const dragBar = new fabric.Rect({
      name: 'dragbar',
      width: Math.max(dragBarWidth, 16),
      height: 20,

      top: 0,
      left: 0,

      fill: '#777777',
      lockMovementY: true,
      hasControls: false,
    }).on('moving', ({target}) => {
      let left = target!.left as number;

      if (left + dragBarWidth >= containerWidth) {
        left = containerWidth - dragBarWidth;
      }
      if (left < 0) {
        left = 0;
      }

      this.timelineLeft = left;

      dragBar.set({
        left,
      });

      this.canvas!.absolutePan(new fabric.Point(left / percent, 0));
    });


    this.dragBarCanvas.add(dragBar);

    dragBar.set({
      left: this.timelineLeft,
    });
    dragBar.fire('move');
    // this.dragBarCanvas.renderAll();
  }

  public async generate() {
    if (!this.canvas) {
      console.error('generate: canvas not ready');
      return;
    }

    this.generateDone = false;

    this.progress = 0;
    this.isGenerating = true;

    // const n = this.frameList.map(item => item.imgFileSrc);

    const { width, height } = { width: this.oriWidth, height: this.oriHeight };
    const totalWidth = (width + 1) * this.totalFrameCount;

    const gif = new GifGenerator({
      repeat: this.repeat ? 0 : -1,
      width: this.oriWidth,
      height: this.oriHeight,
    });

    this.canvas!.absolutePan(new fabric.Point(0, 0));

    const dataUrlArr: string[] = [];

    // 处理帧裁剪数据
    const startFrameIndex = (this.frameSplitRange[0] - 1);
    const endFrameIndex = (this.frameSplitRange[1]);

    const removeRangeStartIndex = this.frameRemoveRange[0] - 1;
    const removeRangeEndIndex = this.frameRemoveRange[1] - 1;

    for (let i = startFrameIndex; i < endFrameIndex; (this.rs ? i+=2 : i++))  {
      if (this.enableFrameRangeRemove && i >= removeRangeStartIndex && i <= removeRangeEndIndex) {
        continue;
      }

      const durl = this.canvas.toDataURL({
        width,
        height,
        left: !this.revert ? (width + 1) * i : totalWidth - (width + 1) * (i + 1),
        top: 0,
        format: 'png',
      });

      dataUrlArr.push(durl);
    }

    if (!dataUrlArr.length) {
      this.isGenerating = false;
      this.generateDone = true;

      this.toast('帧数据为空，取消生成', 'info');
      return;
    }

    gif.addDataUrl(dataUrlArr, {delay: this.interval});

    await gif.renderToElem('#dtsgif', (progress: number) => {
      this.progress = Math.ceil(progress * 100);
    });

    this.isGenerating = false;
    this.generateDone = true;
  }

  public onFrameSplitRangeDragging(value, index) {
    this.curFrameSplitFrameImg = this.frameList[value[index] - 1]?.imgFileSrc;

    const frameRemoveRange: [number, number] = [1, 1];

    frameRemoveRange[0] = Math.min(Math.max(this.frameRemoveRange[0], this.frameSplitRange[0]), this.frameSplitRange[1]);
    frameRemoveRange[1] = Math.max(Math.min(this.frameRemoveRange[1], this.frameSplitRange[1]), this.frameSplitRange[0]);

    const frameRemoveRangeSlider = this.$refs['frameRemoveRange'] as VueSlider;

    if (frameRemoveRange) {
      frameRemoveRangeSlider.setValue(frameRemoveRange);
    }
  }
  public onFrameSplitRangeDragEnd(value, index) {
    this.curFrameSplitFrameImg = '';
  }

  public onFrameRemoveRangeDragging(value, index) {
    this.curFrameRemoveFrameImg = this.frameList[value[index] - 1]?.imgFileSrc;
  }
  public onFrameRemoveRangeDragEnd(value, index) {
    this.curFrameRemoveFrameImg = '';
  }


  public initKeyPressEvent() {
    window.onkeypress = (e: KeyboardEvent) => {
      const keycode = e.keyCode;

      if (keycode === 127) { // Delete
        this.deleteActivedObject();
        return;
      }
    };

    window.onkeydown = (e: KeyboardEvent) => {
      const activedObjects = this.canvas.getActiveObjects();

      // @ts-ignore
      const allFrames = activedObjects.every(item => !!item.frameData);
      // @ts-ignore
      const objs = activedObjects.filter(item => !item.frameData);

      const keycode = e.keyCode;


      if (keycode === 67 && e.ctrlKey) { // ctrl + c
        this.onCopy();
        return;
      }

      if (keycode === 86 && e.ctrlKey) { // ctrl + v
        this.onPaste();
        return;
      }
    };
  }

  public onCopy() {
    let activedObjects = this.canvas.getActiveObjects();

    const frameList = this.frameList;

    if (!frameList || !frameList.length || !activedObjects.length) {
      return;
    }

    let frameCount = 0;
    let objCount = 0;

    activedObjects.forEach(item => {
      // @ts-ignore
      if (item.frameData) {
        frameCount++;
      } else {
        objCount++;
      }
    });

    this.clipboard.length = 0;
    this.clipboard.push(...activedObjects);

    // @ts-ignore
    this.$message(`已复制${frameCount}帧、${objCount}个对象`, { type: 'success' });
  }

  public onPaste() {
    const activedObjects = this.canvas.getActiveObjects();

    const frameList = this.frameList;

    if (!frameList || !frameList.length || !activedObjects.length) {
      return;
    }

    const copiedFrame = this.clipboard.filter(item => item.frameData);

    const copiedObj = this.clipboard.filter(item => !item.frameData);

    let activeFrame = null;

    activedObjects.forEach(item => {
      // @ts-ignore
      if (item.frameData) {
        activeFrame = item;
      }
    });

    if (activeFrame && copiedFrame.length) {
      // @ts-ignore
      const index = activeFrame.frameIndex;

      frameList.splice(index + 1, 0, ...copiedFrame.map(item => item.frameData));

      // @ts-ignore
      this.$message(`已粘贴${copiedFrame.length}帧`, { type: 'success' });

      this.makeTimeline(frameList);
    }

    if (copiedObj.length) {

      copiedObj.forEach(obj => {
        obj.clone((cloneObj: fabric.Object) => {
          cloneObj.set({
            left: ((obj.left || 0) + 16),
            top: ((obj.top || 0) + 16),
          })
          this.canvas.add(cloneObj);
          this.canvas.setActiveObject(cloneObj);
        })
      });

      this.canvas.renderAll();
      // @ts-ignore
      this.$message(`已粘贴${this.copiedObj.length}个对象`, { type: 'success' });
    }

  }

  public deleteActivedObject() {
    const activedObjects = this.canvas.getActiveObjects();

    if (!activedObjects.length) {
      this.toast('当前没有选中元素', 'error');
      return;
    }

    this.canvas.remove(...activedObjects);
  }

  // 更新可编辑内容
  public updateEditData() {
    this.frameSplitRange = [1, this.frameList.length];
    this.frameRemoveRange = [1, 1];
  }

  public toast(msg: string, type: string = 'info') {
    // @ts-ignore
    this.$message(msg, { type, })
  }
}
</script>

<style lang="scss" scoped>
  .wrapper {
    .uploader {
      max-width: calc(100vw - 2rem);
    }
  }

  .vc-chrome {
    box-shadow: none;
    & /deep/ .vc-chrome-fields-wrap {
      display: none;
    }
  }
</style>