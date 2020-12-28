
<template>
  <div class="timeline-wrapper" ref="timeline-wrapper">

    <canvas id="timeline"></canvas>

    <canvas id="dragbar"></canvas>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, } from 'vue-property-decorator';
import { fabric } from 'fabric';

import { GifPreview, PreviewOption } from '../js/preview';
import { Toasted, } from '../../js/type';
import { GifFrameList, GifFrame } from '@/js/gif';
import { Stage } from '../../js/stage';
import { GifState } from '../js/GifState';

@Component({ })
export default class extends Vue implements Stage {
  private _canvas!: fabric.Canvas; 
  private _dragbar!: fabric.Canvas; 

  private timelineLeft: number = 0;

  // 保存每一帧的图像数据
  // 这里不包含除了帧图像之外的fabric.Object
  private frames: fabric.Image[] = [];
  
  // 传入的帧列表
  @Prop({ type: Array, default: [] })
  public frameList!: GifFrame[];
  
  // 传入的帧状态
  @Prop({ type: GifState, default: [] })
  public gifState!: GifState;

  public mounted() {
    this._canvas = new fabric.Canvas('timeline');
    this._dragbar = new fabric.Canvas('dragbar');
  }

  // 刷新帧图像信息
  public async refreshFrameImg() {
    const { frameList } = this;

    const divideWidth = 1;

    // 清空原帧图像数据
    const arr: Promise<fabric.Image>[] = [];

    let res = [];

    const rotated = Math.abs(+this.gifState.rotate) === 90 || Math.abs(+this.gifState.rotate) === 270;

    if (!this.frames.length) {
      frameList.forEach((frame, index) => {
        const imgPromise: Promise<fabric.Image> = new Promise(resolve => {

          fabric.Image.fromURL(frame.imgFileSrc, img => {
            if (!img.width || !img.height) {
              return;
            }

            const curWidth = img.width;
            const curHeight = img.height;

            const nimg = img.set({
              left: (curWidth / 2) + index * (curWidth + divideWidth),
              top: curHeight / 2,
              width: curWidth,
              height: curHeight,
              name: 'frame' + index,
              type: 'timeline-frame',
              lockMovementX: true,
              lockMovementY: true,
              hasControls: false,
              selectable: false,
              flipX: this.gifState.flipX,
              flipY: this.gifState.flipY,
            }) as fabric.Image;

            nimg.originX = 'center';
            nimg.originY = 'center';

            // @ts-ignore
            nimg.frameIndex = index;
            // @ts-ignore
            nimg.frameData = frame;

            // this.frames.push(nimg);
            resolve(img);
          });
        });
        arr.push(imgPromise);
      });

      res = await Promise.all(arr);
    } else {
      res = this.frames.map((img, index) => {
        const curWidth = rotated ? img.height : img.width;
        const leftBaseOffset = rotated ? (img.height / 2) : (img.width / 2);
        const topBaseOffset = rotated ? (img.width / 2) : (img.height/ 2);

        img.rotate(this.gifState.rotate).set({
          left: leftBaseOffset + index * (curWidth + divideWidth),
          top: topBaseOffset,
          flipX: this.gifState.flipX,
          flipY: this.gifState.flipY,
        }) as fabric.Image;

        return img;
      })
    }

    this.frames = res;
  }

  public async refresh() {
    if (!this.canvas) {
      console.error('makrTimeline: canvas not ready');
      return;
    }

    // 清理所有原始帧
    this.canvas.getObjects().forEach(obj => {
      // @ts-ignore
      if (obj.frameData) {
        this.canvas.remove(obj);
      }
    });

    const { frameList } = this;

    const firstImg = frameList[0];

    const frameWidth = firstImg.width;
    const frameHeight = firstImg.height;
    const rotated = Math.abs(+this.gifState.rotate) === 90 || Math.abs(+this.gifState.rotate) === 270;

    let canvasTotalWidth = (frameWidth + 1) * frameList.length;
    let canvasHeight = frameHeight as number;

    if (rotated) {
      canvasTotalWidth = (frameHeight + 1) * frameList.length;
      canvasHeight = frameWidth as number;
    }

    const timelineWrapperWidth = (this.$refs['timeline-wrapper'] as HTMLElement).offsetWidth - 2;

    const divideWidth = 1;

    this.canvas.setWidth(timelineWrapperWidth);
    this.canvas.setHeight(canvasHeight);

    this.frames.forEach(img => {
      this.canvas.add(img);
    });

    this.canvas.absolutePan(new fabric.Point(0, 0));

    this.resetDragBar(timelineWrapperWidth, canvasTotalWidth);
  }

  public resetDragBar(containerWidth: number, totalFrameWidth: number) {
    this.dragbar.clear();

    if (containerWidth >= totalFrameWidth) {
      return;
    }

    this.dragbar.setWidth(containerWidth);
    this.dragbar.setHeight(30);

    const percent = (containerWidth / totalFrameWidth);

    const dragBarWidth =  percent * containerWidth;
    const dragBar = new fabric.Rect({
      name: 'dragbar',
      width: Math.max(dragBarWidth, 25),
      height: 25,

      top: 0,
      left: 0,

      fill: '#777777',
      lockMovementY: true,
      hasControls: false,
    }).on('moving', (arg) => {
      let target = undefined;
      if (arg.target) {
        target = arg.target;
      } else if ((arg?.transform as any)?.target) {
        target = (arg?.transform as any)?.target;
      }

      if (!target) {
        target = {left: 0};
      }

      let left = target.left as number;

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

      this.canvas.absolutePan(new fabric.Point(left / percent, 0));
    });


    this.dragbar.add(dragBar);

    dragBar.set({
      left: this.timelineLeft,
    });
    dragBar.fire('move');
  }

  get canvas() {
    return this._canvas;
  }

  get dragbar() {
    return this._dragbar;
  }

  get imgs(): fabric.Image[] {
    return this.frames;
  }

}
</script>

<style lang="scss" scoped>

  .timeline-wrapper {
    & /deep/ .canvas-container {
      margin: 0 auto;
    }
  }
  
</style>