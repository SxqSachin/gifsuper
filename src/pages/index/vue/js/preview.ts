import { fabric } from 'fabric';
import { GifFrameList, GifFrame, } from '@/js/gif';
import { RangedFrameObject, Toasted, TextOption } from '../../js/type';
import { Stage } from '../../js/stage';

export interface PreviewOption {
  revert?: boolean;
  repeat?: boolean;
  rloop?: boolean;
  showResize?: boolean;
  resize?: boolean;
  interval?: number;
  flipX?: boolean;
  flipY?: boolean;
}

const DefaultPreviewOption: PreviewOption = {
  repeat: true,
  revert: false,
}

class GifPreview implements Stage {
  public previewCanvas!: fabric.Canvas;
  public frameGroup: fabric.Group = null;
  public frameList: GifFrameList = null;

  private _pause: boolean = false;

  private _curFramePointer: number = 0;
  private _frameArray: number[] = [];

  private renderPreviewCallback = (i: number) => {};

  // private revert: boolean = false;
  // private repeat: boolean = true;
  private interval: number = 60;
  private gifTimer: NodeJS.Timeout = null;

  private options: PreviewOption = DefaultPreviewOption 

  private main!: Toasted;

  private showWidth: number = 0;
  private showHeight: number = 0;

  private _replay: boolean = false;

  private _resizeRect!: fabric.Rect;
  private _resizeRectBorderT!: fabric.Rect;
  private _resizeRectBorderB!: fabric.Rect;
  private _resizeRectBorderL!: fabric.Rect;
  private _resizeRectBorderR!: fabric.Rect;

  frames: fabric.Image[] = [];

  get imgs() {
    return this.frames;
  }

  constructor(canvasID: string, main: Toasted) {
    this.previewCanvas = new fabric.Canvas(canvasID);

    this.main = main;
  }

  public async updateOptions(options: PreviewOption) {
    this.options = options;

    await this.initPreviewCanvas(this.frameList, this.showWidth, this.showHeight);
  }

  public createResizeRect(width, height): fabric.Rect {
    return new fabric.Rect({
      type: 'assets',
      width: width - 64,
      height: height - 64,
      top: 32,
      left: 32,
      fill: '#00000000',
      hasBorders: false,
      hasRotatingPoint: false,
      cornerStyle: 'circle',
      opacity: 0,
      selectable: false,
      cornerColor: '#fff',
      cornerSize: 12,
      transparentCorners: false
    });
  }

  public createResizeRectBorder(): fabric.Rect {
    return new fabric.Rect({
      type: 'assets',
      fill: '#000000c7',
      opacity: 0,
      selectable: false,
      hasControls: false,
    });
  }

  public async initPreviewCanvas(frameList: GifFrameList, width: number, height: number) {
    const {
      previewCanvas: canvas,
    } = this;

    canvas.getObjects().forEach(object => {
      if (object.type === 'bg') {
        canvas.remove(object);
      }
    });
    canvas.setWidth(width).setHeight(height);

    this.frameGroup = null;

    const resizeRect = this.createResizeRect(width, height);
    const rt = this.createResizeRectBorder();
    const rb = this.createResizeRectBorder();
    const rl = this.createResizeRectBorder();
    const rr = this.createResizeRectBorder();

    const resizeBorder = () => {
      rt.set({
        width: 2000,
        height: 2000,
        top: resizeRect.top - 2000,
        left: 0,
      });
      rb.set({
        width: 2000,
        height: 2000,
        top: resizeRect.top + resizeRect.height * resizeRect.scaleY,
        left: 0,
      });
      rl.set({
        width: 2000,
        height: resizeRect.height * resizeRect.scaleY,
        top: resizeRect.top,
        left: resizeRect.left - 2000,
      });
      rr.set({
        width: 2000,
        height: resizeRect.height * resizeRect.scaleY,
        top: resizeRect.top,
        left: resizeRect.left + resizeRect.width * resizeRect.scaleX,
      });
    };

    resizeBorder();
    resizeRect.on('moving', resizeBorder).on('scaling', resizeBorder); 

    this._resizeRect = resizeRect;
    this._resizeRectBorderT = rt;
    this._resizeRectBorderB = rb;
    this._resizeRectBorderL = rl;
    this._resizeRectBorderR = rr;
    this.showWidth = width;
    this.showHeight = height;

    this.frameList = frameList;
    const frameGroup = await this.genSrcGIFFrameGroup(frameList, width, height);

    this.frameGroup = frameGroup;

    canvas.add(frameGroup).add(resizeRect).add(rt, rb, rl ,rr);
    canvas.sendToBack(frameGroup).renderAll();

    this.renderPreview(this._frameArray ?? Array.from(new Array(frameList.length).keys()), this.interval, this.renderPreviewCallback);
  }

   // 生成指定宽高的帧Group
  public async genSrcGIFFrameGroup(frameList: GifFrameList, frameWidth: number, frameHeight: number): Promise<fabric.Group> {
    const width = frameWidth;
    const height = frameHeight;

    const promiseGroup: Promise<fabric.Object>[] = [];

    const {
      flipX,
      flipY,
    } = this.options;

    let res = [];

    if (!this.frames.length) {
      frameList.forEach((frame, index) => {
        promiseGroup.push(new Promise(resolve => {
          fabric.Image.fromURL(frame.imgFileSrc, img => {
            if (!img.width || !img.height) {
              return;
            }

            const nimg = img.set({
              left: index * width,
              top: 500,
              name: `frame-${index}`,
              hasControls: false,
              selectable: false,
              type: 'bg',
              flipX,
              flipY,
            }).scaleToWidth(width).scaleToHeight(height) as fabric.Image;

            this.frames.push(nimg);

            resolve(nimg);
          });
        }))
      });

      res = await Promise.all(promiseGroup);
    } else {
      this.frames = this.frames.map(img => {
        img.set({
          flipX,
          flipY,
        }).scaleToWidth(width).scaleToHeight(height) as fabric.Image;
        return img;
      });
      res = this.frames;
    }

    const fgroup = new fabric.Group(res);
    fgroup.set({
      selectable: false,
      hasControls: false,
      name: 'bg-group',
      type: 'bg',
      top: 0,
    })

    return fgroup;
  }

  // 重置预览GIF播放间隔
  public renderPreview(frameArray: number[], interval: number = 60, callback?: (curFrameIndex: number) => void) {
    const {
      previewCanvas: canvas,
      gifTimer,
      options,
      showWidth: frameWidth,
      _resizeRect: resizeRect,
      _resizeRectBorderT: resizeRectBorderT,
      _resizeRectBorderB: resizeRectBorderB,
      _resizeRectBorderL: resizeRectBorderL,
      _resizeRectBorderR: resizeRectBorderR,
    } = this;

    const {
      repeat,
      revert,
    } = options;

    if (revert) {
      frameArray.sort((a, b) => b - a);
    }
    this._frameArray = frameArray;
    this.interval = interval;
    this.renderPreviewCallback = callback;

    const startFrameIndex = frameArray[0];
    const startLeft = startFrameIndex * frameWidth;

    let left = 0;
    let frameIndex = 0;
    // let framePointer = 0;

    // this._curFramePointer = 0;

    if (gifTimer) {
      clearInterval(gifTimer);
    }
    this.gifTimer = setInterval(() => {
      let {
        _pause,
        _curFramePointer,
        _replay,
        
      } = this;

      let {
        showResize,
      } = this.options;

      if (showResize) {
        resizeRect.set({
          opacity: 1,
          stroke: '#fff',
          selectable: true,
        });
        resizeRectBorderT.set({ opacity: 1 });
        resizeRectBorderB.set({ opacity: 1 });
        resizeRectBorderL.set({ opacity: 1 });
        resizeRectBorderR.set({ opacity: 1 });
        canvas.bringToFront(resizeRectBorderT);
        canvas.bringToFront(resizeRectBorderB);
        canvas.bringToFront(resizeRectBorderL);
        canvas.bringToFront(resizeRectBorderR);
        canvas.renderAll();
      } else {
        resizeRect.set({
          opacity: 0,
          stroke: '#777',
          selectable: false,
        });
        resizeRectBorderT.set({ opacity: 0 });
        resizeRectBorderB.set({ opacity: 0 });
        resizeRectBorderL.set({ opacity: 0 });
        resizeRectBorderR.set({ opacity: 0 });
        canvas.renderAll();
      }

      if (_pause) {
        return;
      }

      if (!repeat && _replay) {
        return;
      }

      if (_replay) {
        _replay = false;

        left = startLeft;
        _curFramePointer = 0;
      }
      frameIndex = frameArray[_curFramePointer++];

      canvas.getObjects().forEach((obj: RangedFrameObject) => {
        if (!obj.inFrame) {
          return;
        }

        if (obj.inFrame.includes(frameIndex)) {
          obj.opacity = 1;
        } else {
          obj.opacity = 0;
        }
      })

      left = -(frameWidth * frameIndex);
      this.frameGroup.set({
        left,
      });
      this._curFramePointer = _curFramePointer;

      if (typeof callback === 'function') {
        callback(_curFramePointer);
      }

      canvas.renderAll();
      if (_curFramePointer > frameArray.length - 1) {
        _replay = true;
      }

      this._replay = _replay;

    }, interval);
  }

  public setPreviewFrame(pointer: number) {
    const {
      previewCanvas: canvas,
      frameGroup,
      frameArray,
      showWidth: frameWidth,
    } = this;

    pointer = Math.min(Math.max(pointer, 0), frameArray.length - 1)

    const frameIndex = frameArray[pointer];

    canvas.getObjects().forEach((obj: RangedFrameObject) => {
      if (!obj.inFrame) {
        return;
      }

      if (obj.inFrame.includes(frameIndex)) {
        obj.opacity = 1;
      } else {
        obj.opacity = 0;
      }
    })

    const left = -(frameWidth * frameIndex);

    this.frameGroup.set({
      left,
    });
    this._curFramePointer = pointer;

    this._replay = false;

    canvas.renderAll();
  }

  public getObjects(includeFrame: boolean = false) {
    const allObject = this.previewCanvas.getObjects().filter(obj => includeFrame || !obj.isType('bg') && !obj.isType('bg-group') && !obj.isType('assets'));

    return allObject;
  }

  public removeActiveObjects() {
    const { previewCanvas: canvas } = this;

    const activeObjects = canvas.getActiveObjects();

    if (!activeObjects.length) {
      this.main.toast('当前没有选中元素', 'error', 1000);
      return;
    }

    activeObjects.forEach(obj => {
      canvas.remove(obj);
    });

    this.main.toast(`成功删除${activeObjects.length}个对象`, 'success', 1000);
  }

  public pause() {
    this._pause = true;
  }
  public play() {
    this._pause = false;
  }

  public showResizeRect() {
    this.options.showResize = true;
    this.previewCanvas.setActiveObject(this._resizeRect);
  }

  public hideResizeRect() {
    this.options.showResize = false;
    this.previewCanvas.discardActiveObject();
  }

  get resizeRect(): fabric.Rect {
    return this._resizeRect;
  }

  get curFramePointer(): number {
    return this._curFramePointer;
  }

  get frameArray(): number[] {
    return this._frameArray;
  }

  get isPause(): boolean {
    return this._pause;
  }

  get canvas() {
    return this.previewCanvas;
  }
}

export {
  GifPreview,
}