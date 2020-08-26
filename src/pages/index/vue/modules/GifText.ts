import { GifModule } from "./module";
import { fabric } from "fabric";
import { RangedFrameObject } from "../js/type";

export class GifText implements GifModule {
  // 文字操作 start
  public content: string = '';
  public colorObj: {[key: string]: string} = { hex: '#fff' };
  public strokeObj: {[key: string]: string} = { hex: '#000' };
  public size: string | number = '42';
  public strokeWidth: number = 1;

  public addRange: [number, number] = [1, 1]; // 添加文字起始值

  public enableStroke: boolean = false;

  public fontWeight: number = 600;
  // 文字操作 end

  get color(): string {
    return this.colorObj?.hex8 ?? '#fff';
  }

  get strokeColor(): string {
    return this.strokeObj?.hex8 ?? '#000';
  }

  public expandRange2Array(rangeArr: [number, number]): number[] {
    const start = Math.max(rangeArr[0] - 1, 0); // 因为slider都是从1开始的 所以这里要-1
    const end = rangeArr[1];

    const res: number[] = [];

    for (let i = start; i < end; i++) {
      res.push(i);
    }

    return res;
  }

  public async addToStage(stage: fabric.Canvas) {
    const canvas = stage;
    let {
      content,
      size,
      color,
      enableStroke,
      strokeWidth,
      strokeColor,
      fontWeight, } = this;

    size = size ?? 14;
    color = color ?? '#ffffffff';
    enableStroke = enableStroke ?? false;
    strokeWidth = strokeWidth ?? 0;
    strokeColor = strokeColor ?? '#000000ff';
    fontWeight = fontWeight ?? 600;

    const itext = new fabric.IText(content, {
      fill: color,
      left: 15,
      top: 15,
      fontWeight,
      fontSize: +size,
      cornerColor: '#66a6ff',
      cornerSize: 8,
      transparentCorners: false
    }) as fabric.IText & RangedFrameObject;

    if (enableStroke) {
      itext.set({
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      });
    }

    itext.set({
      type: 'text',

      inFrame: this.expandRange2Array(this.addRange),
    });

    canvas.add(itext).renderAll();
    canvas.setActiveObject(itext);
  }
}