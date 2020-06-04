<template>
  <main class="wrapper p-4 sm:p-4 md:p-8 lg:p-8">

    <div class="top mb-12">
      <upload class="uploader mx-auto" :before-upload="upload" hover-color="var(--color-info)"></upload>
    </div>

    <div class="srcgif-wrapper flex mb-4 items-center">
      <div class="src w-1/2 flex-shrink-0">
        <label for="">原图像：</label>
        <div id="srcgif"> </div>
      </div>
    </div>

    <div class="edit-panel p-8 border rounded-md border-color-2 mt-8 flex">

      <div class="flex-1 flex flex-col mr-8">
        <div class="flex items-center pb-8 mb-8 border-b border-gray-300">
          <div class="flex justify-center items-center">
            <label for="interval">选中帧：</label>
            <s-input readonly v-model="editFrameIndex"></s-input>
          </div>
          <div class="flex justify-center items-center ml-8">
            <label for="interval">帧间隔：</label>
            <s-input type="number" name="interval" id="interval" v-model="interval"></s-input>
          </div>
        </div>

        <div class="flex pb-8 mb-8 border-b border-gray-300">
          <div class="flex justify-center items-center">
            <label for="">文字内容：</label>
            <s-input v-model="textContent" placeholder="请输入内容"></s-input>
          </div>
          <div class="flex justify-center items-center ml-8">
            <label for="">文字颜色：</label>
            <s-input v-model="textColor"></s-input>
          </div>

          <sbtn class="ml-12" @click="addText(textContent, textColor)">添加文字</sbtn>
        </div>

        <div class="flex pb-8 mb-8 border-b border-gray-300">
          <sbtn type="info" @click="revert = !revert">倒放：{{ revert ? '开' : '关' }}</sbtn>
          <sbtn class="ml-4" @click="insertFrame(0, -1)">在末尾插入第一帧</sbtn>
          <sbtn class="ml-4" @click="repeat = !repeat">循环：{{ repeat ? '开' : '关' }}</sbtn>
          <sbtn class="ml-4" @click="rs = !rs">抽帧：{{ rs ? '开' : '关' }}</sbtn>
          <sbtn class="ml-4" type="error" @click="makeTimeline">重置</sbtn>
        </div>

        <sbtn type="success" @click="generate" :disabled="isGenerating || !frameList.length">生成</sbtn>
      </div>

      <div class="flex-0 w-1/3">
        <label for="">新图像：（保存图片：右击图片->图片另存为）</label>
        <div class="flex justify-center h-full items-center">
          <div class="mb-24" v-show="isGenerating">
            <div class="mb-12">生成中： {{progress}}%</div>

            <loading></loading>
          </div>

          <div v-show="!isGenerating">
            <div id="dtsgif" > </div>
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
  },
})
export default class extends Vue {
  public canvas!: fabric.Canvas;
  public dragBarCanvas!: fabric.Canvas;

  public frameList: any[] = [];
  public oriFrameList: any[] = [];

  public interval: number = 120;

  public isGenerating: boolean = false;

  public textContent: string = '';
  public textColor: string = '#fff';

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

  public mounted() {
    this.canvas = new fabric.Canvas('stage');

    this.dragBarCanvas = new fabric.Canvas('dragbar');

    this.initKeyPressEvent();
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
        }).scale(scale).on('mousedown', (e: any) => {
          const isShiftDown = e!.e!.shiftKey;
          const frameIndex = e!.target!.frameIndex;

          if (isShiftDown) {
            this.editFrameIndex.push(frameIndex);
          } else {
            this.editFrameIndex = [frameIndex];
          }

          this.editFrameIndex.sort((a: any, b: any) => {
            return +a - +b;
          });
        });

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