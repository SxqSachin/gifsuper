<template>
  <main class="wrapper p-4 sm:p-4 md:p-8 lg:p-8">

    <div class="top mb-6">
      <upload class="uploader mx-auto" :before-upload="upload" hover-color="var(--color-info)">上传GIF！</upload>
    </div>

    <div class="srcgif-wrapper flex mb-4 items-center">
      <div class="src w-full flex-shrink-0">
        <label v-show="canEdit || isGenerating" for="srcgif" class="inline-block mb-4 hidden md:block">原Gif：</label>
        <label v-show="canEdit || isGenerating" for="srcgif" class="inline-block mb-4 block md:hidden">原始Gif：（调整好设置后点击下方“生成”按钮）</label>
        <div id="srcgif"> </div>
      </div>
    </div>

    <div class="edit-panel w-full p-4 md:p-8 border rounded-md border-color-2 mt-8 flex flex-col md:flex-row">

      <div class="flex-1 flex flex-col mr-0 md:mr-8 w-full">

        <fieldset class="flex items-start flex-col md:flex-row pb-4 mb-8 border-b border-gray-600 w-full" v-show="canEdit">
          <legend class="mb-4 text-lg"> 图片信息 </legend>

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

        <fieldset class="flex items-start flex-col md:flex-row pb-8 mb-8 border-b border-gray-600 w-full">
          <legend class="mb-4 text-lg"> 基础调整 </legend>

          <div class="flex items-center mb-4 pt-4 pb-8 w-full">
            <label for="interval" class="whitespace-no-wrap flex-0 inline-block">帧间隔：</label>

            <slider class="flex-1"
              v-model="interval"
              :min="15"
              :max="200"
              :lazy="true"
              :disabled="!canEdit"
              :drag-on-click="true"
              tooltip="always"
              tooltip-placement="bottom"
             ></slider>
            <!-- <s-input type="number" name="interval" id="interval" v-model="interval"></s-input> -->
          </div>

          <div class="flex flex-col md:flex-row">
            <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" :disabled="!canEdit" type="info" @click="toggleRevert">倒放：{{ revert ? '开' : '关' }}</sbtn>
            <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" :disabled="!canEdit" @click="toggleRepeat">循环：{{ repeat ? '开' : '关' }}</sbtn>
            <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" :disabled="!canEdit" @click="rs = !rs">抽帧：{{ rs ? '开' : '关' }}</sbtn>
            <sbtn class="mr-0 w-full md:w-auto md:mr-4 mb-1" :disabled="!canEdit" type="error" @click="makeTimeline">重置</sbtn>
          </div>

        </fieldset>

        <fieldset>
          <legend class="mb-2 text-lg"> 文字操作 </legend>
          <div class="mb-4 pb-2 text-color-neutral text-sm border-b border-gray-400">生成文字后可于下方“时间轴”处调整文字位置</div>
          <div class="w-full flex flex-wrap items-start flex-col md:flex-row">
            <div class="flex justify-center items-center mr-4 mb-4 w-full md:w-auto">
              <label for="" class="whitespace-no-wrap">文字内容：</label>
              <s-input class="w-full" v-model="textContent" placeholder="请输入内容，支持emoji表情"></s-input>
            </div>
            <div class="flex justify-center items-center mr-4 mb-4 w-full md:w-auto">
              <label for="" class="whitespace-no-wrap">文字颜色：</label>
              <s-input class="w-full" v-model="textColor"></s-input>
            </div>

            <!-- <div class="flex justify-center items-center mr-4 mb-4">
              <label for="" class="whitespace-no-wrap">文字边线色：</label>
              <s-input v-model="textOutline"></s-input>
            </div> -->

            <div class="flex justify-center items-center mr-4 mb-4">
              <sbtn
                class="mr-4 mb-1"
                @click="addText(textContent, textColor)"
                :disabled="!canEdit">为指定帧添加文字</sbtn>
              <s-input v-model="textRange" placeholder="如:0,1,2,(4-10)"></s-input>
            </div>
            <sbtn
              class="mb-1 w-full md:w-auto"
              @click="addTextToAllFrame(textContent, textColor)"
              :disabled="!canEdit">为所有帧添加文字</sbtn>

          </div>
        </fieldset>

        <fieldset class="mt-8 pt-8 border-t border-gray-600">
          <sbtn type="success" @click="generate" :disabled="isGenerating || !canEdit">生成</sbtn>
        </fieldset>
      </div>

      <div class="flex-0 w-full md:w-1/3 border-t md:border-t-0 mt-4 md:mt-0 pt-4 md:pt-0">
        <label for="" class="hidden md:inline" v-show="generateDone">新图像：（保存图片：右击图片->图片另存为）</label>
        <label for="" class="inline md:hidden" v-show="generateDone">新图像：（长按图片->保存图片）</label>

        <div class="flex justify-center h-full items-center">
          <div class="my-12 md:my-0" v-show="isGenerating">
            <div class="mb-12">生成中： {{progress}}%</div>

            <loading></loading>
          </div>

          <div v-show="!isGenerating">
            <div id="dtsgif" class="mt-4 md:mt-0"> </div>
          </div>
        </div>
      </div>

    </div>

    <div class="timeline mt-8 border-t">
      <label class="inline-block py-4">时间轴：（ctrl+c复制、ctrl+v粘贴、delete删除）</label>
      <div ref="timeline-wrapper" class="canvas-wrapper border rounded-sm border-gray-600">
        <canvas id="stage"></canvas>
        <canvas id="dragbar"></canvas>
      </div>
    </div>

  </main>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';

import Upload from '@/components/widget/s-upload.vue';
import sbtn from '@/components/widget/s-btn.vue';
import sInput from '@/components/widget/s-input.vue';
import LoadingRing from '@/components/widget/loading-ring.vue';

import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

import { parseSrcGif, dataUrlToFile, Gif } from '@/js/gif';

import { fabric } from 'fabric';

const FrameIndex = 1;
const TextZIndex = 10;

@Component({
  components: {
    'upload': Upload,
    sbtn,
    's-input': sInput,
    'loading': LoadingRing,
    slider: VueSlider,
  },
})
export default class extends Vue {
  public canvas!: fabric.Canvas;
  public dragBarCanvas!: fabric.Canvas;

  public frameList: any[] = [];
  public oriFrameList: any[] = [];

  public interval: number = 120;

  public isGenerating: boolean = false;
  public generateDone: boolean = false;

  public textContent: string = '';
  public textColor: string = '#fff';
  public textOutline: string = '#fff';

  public textRange: string = '';

  // 上传的Gif
  public rawFile: File = null;

  // 倒放
  public revert: boolean = false;

  // 单帧宽/高度
  public frameWidth: number = 0;
  public frameHeight: number = 0;

  // 当前选中的帧数
  public editFrameIndex: number[] = [];

  // 生成进度
  public progress: number = 0;

  // 是否循环
  public repeat: boolean = true;

  // 对象剪贴板
  public rs: boolean = false;

  // timeline偏移值
  public timelineLeft: number = 0;

  // 帧剪贴板
  public frameClipboard: any[] = [];

  // 对象剪贴板
  public objClipboard: fabric.Object[] = [];

  public clipboard: any[] = [];

  get choosenFrameIndexArray(): number[] {
    if (Array.isArray(this.editFrameIndex)) {
      return this.editFrameIndex;
    }

    let tArr: number[] = [];

    if (this.editFrameIndex === 'all') {
      tArr = Array.from(this.frameList.keys());
    } else {
      tArr = (this.editFrameIndex as string).split(',').map(item => +item);
    }

    return tArr;
  }

  get canEdit(): boolean {
    return !!this.frameList?.length;
  }

  public mounted() {
    this.canvas = new fabric.Canvas('stage');

    this.dragBarCanvas = new fabric.Canvas('dragbar');

    this.initKeyPressEvent();
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

  public resetStage() {
    const srcgifDOM = document.querySelector('#srcgif');

    if (srcgifDOM) {
      srcgifDOM.innerHTML = '';
    }

    if (!!this.canvas) {
      this.canvas.clear();
    }
  }

  public async upload(e: FileList) {
    const gifFile = e[0];

    if (!gifFile || !this.canvas) {
      return;
    }

    this.rawFile = gifFile;

    this.resetStage();

    const frameList = await parseSrcGif(gifFile);
    this.frameList = frameList;
    this.oriFrameList = frameList;

    this.makeTimeline(frameList);
  }

  public fabricFromUrl(url: string): Promise<fabric.Image> {
    const promise: Promise<fabric.Image> = new Promise(resolve => {
      fabric.Image.fromURL(url, img => {
        resolve(img);
      });
    });

    return promise;
  }

  public addText(textContent: string = '请输入内容', textColor: string = '#333') {
    const textArr: fabric.IText[] = [];

    this.canvas!.discardActiveObject();

    const group: fabric.Group = new fabric.Group();

    if (!this.choosenFrameIndexArray.length) {
      const itext = new fabric.IText(textContent, {
        fill: textColor,
        left: 0,
        top: 40,
      });

      group.addWithUpdate(itext);
    } else {
      this.choosenFrameIndexArray.forEach(index => {
        const itext = new fabric.IText(textContent, {
          fill: textColor,
          left: index * ((this.frameWidth ?? 0) + 1),
          top: 40,
        });

        group.addWithUpdate(itext);
      });
    }


    this.canvas!.add(group);
    group.bringToFront();
    group.toActiveSelection();

    // @ts-ignore
    this.$message('添加成功', {type: 'success'});
  }

  public addTextToAllFrame(textContent: string = '请输入内容', textColor: string = '#333') {
    const textArr: fabric.IText[] = [];

    this.canvas!.discardActiveObject();

    const group: fabric.Group = new fabric.Group();

    Array.from(this.frameList.keys()).forEach(index => {
      const itext = new fabric.IText(textContent, {
        fill: textColor,
        left: index * ((this.frameWidth ?? 0) + 1),
        top: 40,
      });

      group.addWithUpdate(itext);
    });

    this.canvas.enableRetinaScaling = true;
    this.canvas.add(group);
    this.canvas.setActiveObject(group).renderAll();
    group.toActiveSelection();

    // @ts-ignore
    this.$message('添加成功', {type: 'success'});
  }


  public async makeTimeline(frameList: any[]) {
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
    this.editFrameIndex = [];

    const firstImg = await this.fabricFromUrl(frameList[0].imgFileUrl);

    const frameWidth = this.frameWidth = firstImg.width as number;
    const frameHeight = this.frameHeight = firstImg.height as number;

    const canvasTotalWidth = (frameWidth + 1) * frameList.length;
    const canvasHeight = firstImg.height as number + 10;

    const timelineWrapperWidth = (this.$refs['timeline-wrapper'] as HTMLElement).offsetWidth - 2;

    const scale = 1;
    const divideWidth = 1;

    this.canvas.setWidth(timelineWrapperWidth);
    this.canvas.setHeight(canvasHeight);

    this.frameList = frameList.map((frame, index) => {
      const percent = (index + 1) / frameList.length;
      fabric.Image.fromURL(frame.imgFileUrl, img => {
        if (!img.width || !img.height) {
          return;
        }

        const curWidth = img.width * scale;
        const curHeight = img.height * scale;

        const nimg = img.set({
          left: index * (curWidth + divideWidth),
          top: 5,
          width: img.width,
          name: 'frame' + index,
          lockMovementX: true,
          lockMovementY: true,
          hasControls: false,
        }).scale(scale);

        // @ts-ignore
        nimg.frameIndex = index;
        // @ts-ignore
        nimg.frameData = frame;

        if (!nimg.width || !nimg.height) {
          return;
        }

        frame.width = img.width;
        frame.height = img.height;

        this.canvas.add(nimg);

        this.canvas.sendToBack(nimg);
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

    const n = this.frameList.map(item => item.imgFileUrl);

    const { width, height } = this.frameList[0];
    const totalWidth = (width + 1) * n.length;

    const gif = new Gif({
      repeat: this.repeat ? 0 : -1,
    });

    this.canvas!.absolutePan(new fabric.Point(0, 0));

    const dataUrlArr: string[] = [];

    for (let i = 0; i < n.length; (this.rs ? i+=2 : i++))  {
      const durl = this.canvas.toDataURL({
        width,
        height,
        left: !this.revert ? (width + 1) * i : totalWidth - (width + 1) * (i + 1),
        top: 5,
        format: 'png',
      });

      dataUrlArr.push(durl);
    }

    gif.addDataUrl(dataUrlArr, {delay: this.interval});

    await gif.renderToElem('#dtsgif', (progress: number) => {
      this.progress = Math.ceil(progress * 100);
    });

    this.isGenerating = false;
    this.generateDone = true;
  }

  public insertFrame(srcFrameIndex: number, targetFrameIndex: number) {
    if (srcFrameIndex < 0) {
      srcFrameIndex = 0;
    }
    if (srcFrameIndex > this.frameList.length) {
      srcFrameIndex = this.frameList.length - 1;
    }

    const frameList = this.frameList;

    const firstFrame = frameList[srcFrameIndex];

    frameList.push(firstFrame);

    this.makeTimeline(frameList);
  }

  public initKeyPressEvent() {
    window.onkeypress = (e: KeyboardEvent) => {
      const keycode = e.keyCode;

      if (keycode === 127) { // Delete
        this.onDeletePress();
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
      this.$message(`已粘贴${this.objClipboard.length}个对象`, { type: 'success' });
    }

  }

  public onDeletePress() {
    const activedObjects = this.canvas.getActiveObjects();

    const frameList = this.frameList;

    if (!frameList || !frameList.length || !activedObjects.length) {
      return;
    }

    activedObjects.forEach(object => {
      // @ts-ignore
      const frameIndex = object.frameIndex;

      frameList.splice(frameIndex, 1);

      this.canvas.remove(object);
    });

    this.makeTimeline(frameList);
  }
}
</script>

<style lang="scss" scoped>
  .wrapper {
    .uploader {
      max-width: calc(100vw - 2rem);
    }
  }
</style>