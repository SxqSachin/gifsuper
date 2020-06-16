import { fabric } from 'fabric';
import { GifFrameList, GifFrame, } from '@/js/gif';
import { RangedFrameObject, Toasted, TextOption } from './type';

export interface PreviewOption {
  revert?: boolean;
  repeat?: boolean;
  interval?: number;
}

const DefaultPreviewOption: PreviewOption = {
  repeat: true,
  revert: false,
}

class GifPreview {
  private previewCanvas!: fabric.Canvas;
  private frameGroup: fabric.Group = null;

  private _pause: boolean = false;

  private _curFramePointer: number = 0;
  private _frameArray: number[] = [];

  // private revert: boolean = false;
  // private repeat: boolean = true;
  private interval: number = 60;
  private gifTimer: NodeJS.Timeout = null;

  private options: PreviewOption = DefaultPreviewOption 

  private main!: Toasted;

  private showWidth: number = 0;
  private showHeight: number = 0;

  private _replay: boolean = false;

  constructor(canvasID: string, main: Toasted) {
    this.previewCanvas = new fabric.Canvas(canvasID);

    this.main = main;
  }

  public updateOptions(options: PreviewOption) {
    this.options = options;
  }

  public async initPreviewCanvas(frameList: GifFrameList, width: number, height: number) {
    const {
      previewCanvas: canvas,
    } = this;

    this.frameGroup = null;
    canvas.clear().setWidth(width).setHeight(height);

    this.showWidth = width;
    this.showHeight = height;

    const frameGroup = await this.genSrcGIFFrameGroup(frameList, width, height);

    this.frameGroup = frameGroup;

    canvas.add(frameGroup).renderAll();

    this.renderPreview(Array.from(new Array(frameList.length).keys()));
  }

   // 生成指定宽高的帧Group
  public async genSrcGIFFrameGroup(frameList: GifFrameList, frameWidth: number, frameHeight: number): Promise<fabric.Group> {
    const width = frameWidth;
    const height = frameHeight;

    const promiseGroup: Promise<fabric.Object>[] = [];

    frameList.forEach((frame, index) => {
      promiseGroup.push(new Promise(resolve => {
        fabric.Image.fromURL(frame.imgFileSrc, img => {
          if (!img.width || !img.height) {
            return;
          }

          const nimg = img.set({
            left: index * width,
            top: 0,
            name: `frame-${index}`,
            hasControls: false,
            selectable: false,
            type: 'bg',
          }).scaleToWidth(width).scaleToHeight(height);

          resolve(nimg);
        });
      }))
    });

    const res = await Promise.all(promiseGroup);

    const fgroup = new fabric.Group(res);
    fgroup.set({
      selectable: false,
      hasControls: false,
      name: 'bg-group',
      type: 'bg',
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
    } = this;

    const {
      repeat,
      revert,
    } = options;

    if (revert) {
      frameArray.sort((a, b) => b - a);
    }

    this._frameArray = frameArray;

    const startFrameIndex = frameArray[0];
    const startLeft = startFrameIndex * frameWidth;

    let left = 0;
    let frameIndex = 0;
    // let framePointer = 0;

    // this._curFramePointer = 0;
    this.interval = interval;

    if (gifTimer) {
      clearInterval(gifTimer);
    }
    this.gifTimer = setInterval(() => {
      let {
        _pause,
        _curFramePointer,
        _replay,
      } = this;

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

  public async addImage(imgList: FileList, frame?: number[]) {
    const img = imgList[0];

    if (!img.type.includes('image')) {
      this.main.toast('只支持上传图片', 'error');
      return;
    }

    const { previewCanvas: canvas, showWidth, showHeight, } = this;
    const frameData = await this.getImageData(img);

    const initImageData: Promise<fabric.Object> = new Promise(resolve => {
      fabric.Image.fromURL(frameData.imgFileSrc, img => {
        const nimg = img.set({
          left: 15,
          top: 15,
          width: frameData.width,
          height: frameData.height,
        }) as RangedFrameObject;

        nimg.set({
          type: 'nimg',

          inFrame: frame,
        });

        resolve(nimg);
      });
    });

    const imgObj = await initImageData;

    canvas.add(imgObj).renderAll();
    canvas.setActiveObject(imgObj);

    this.main.toast('添加成功', 'success', 800);
  }

  public async addText(text: string, option?: TextOption, frame?: number[]) {
    const { previewCanvas: canvas, } = this;
    let { size, color, enableStroke, strokeWidth, strokeColor, fontWeight } = option;

    if (!text) {
      return this.main.toast('请输入文字后再进行“添加文字”操作', 'warn');
    }

    size = size ?? 14;
    color = color ?? '#ffffffff';
    enableStroke = enableStroke ?? false;
    strokeWidth = strokeWidth ?? 0;
    strokeColor = strokeColor ?? '#000000ff';
    fontWeight = fontWeight ?? 600;

    const itext = new fabric.IText(text, {
      fill: color,
      left: 15,
      top: 15,
      fontWeight,
      fontSize: size,
    }) as fabric.IText & RangedFrameObject;

    if (enableStroke) {
      itext.set({
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
    }

    itext.set({
      type: 'text',

      inFrame: frame,
    });

    canvas.add(itext).renderAll();
    canvas.setActiveObject(itext);

    this.main.toast('添加成功', 'success', 800);
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

  public getObjects(includeFrame: boolean = false) {
    const allObject = this.previewCanvas.getObjects().filter(obj => includeFrame || !obj.isType('bg') && !obj.isType('bg-group'));

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

  get curFramePointer(): number {
    return this._curFramePointer;
  }

  get frameArray(): number[] {
    return this._frameArray;
  }

  get isPause(): boolean {
    return this._pause;
  }
}

export {
  GifPreview,
}