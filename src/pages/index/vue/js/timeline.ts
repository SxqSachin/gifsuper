import { Stage } from '../../js/stage';
import { GifFrameList } from '@/js/gif';
import { fabric } from 'fabric';
import { GifState } from './GifState';

export class Timeline implements Stage {
  private _canvas: fabric.Canvas;

  private _wrapper: HTMLElement;

  constructor(canvasID: string, wrapper) {
    this._canvas = new fabric.Canvas(canvasID);

    this._wrapper = wrapper;
  }

  async make(frameList: GifFrameList, oriWidth: number, oriHeight: number, gifState: GifState) {
    if (!this.canvas) {
      console.error('makrTimeline: canvas not ready');
      return;
    }

    if (!frameList) {
      return;
    }

    this.canvas.getObjects().forEach(obj => {
      // @ts-ignore
      if (obj.frameData) {
        this.canvas.remove(obj);
      }
    })

    const firstImg = frameList[0];

    const frameWidth = oriWidth; // firstImg.width as number;
    const frameHeight = oriHeight; // firstImg.height as number;

    const canvasTotalWidth = (frameWidth + 1) * frameList.length;
    const canvasHeight = frameHeight as number;

    const timelineWrapperWidth = this._wrapper.offsetWidth - 2;

    const scale = 1;
    const divideWidth = 1;

    this.canvas.setWidth(timelineWrapperWidth);
    this.canvas.setHeight(canvasHeight);

    frameList = frameList.map((frame, index) => {
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
          type: 'timeline-frame',
          lockMovementX: true,
          lockMovementY: true,
          hasControls: false,
          selectable: false,
          flipX: gifState.flipX,
          flipY: gifState.flipY,
        }).scale(scale) as fabric.Image;

        // @ts-ignore
        nimg.frameIndex = index;
        // @ts-ignore
        nimg.frameData = frame;

        this.canvas.add(nimg);
      });

      return frame;
    });
  }

  get canvas() {
    return this._canvas;
  }

  get imgs(): fabric.Image[] {
    throw new DOMException('123')
  }
}
