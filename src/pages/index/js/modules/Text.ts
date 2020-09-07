import { StageModule } from "../module";
import { Stage } from "../stage";
import { fabric } from "fabric";
import { RangedFrameObject } from "../type";

export type TextOption = {
  fontSize?: number,
  color?: string,

  fontWeight?: 400 | 600,

  enableStroke?: boolean,
  strokeWidth?: number,
  strokeColor?: string,

  frameRange: [number, number],
}

export class Text implements StageModule {
  // 文字操作 start

  private content: string = '';
  private color: string = '#fff';
  private fontSize: number = 42;

  private fontWeight: number = 600;

  private enableStroke: boolean = false;
  private strokeColor: string = '#000';
  private strokeWidth: number = 1;

  private frameRange: [number, number] = [1, 1]; // 添加文字起始值
  // 文字操作 end

  public constructor(content: string, option: TextOption) {
    this.content = content;

    this.color = option.color;
    this.fontSize = option.fontSize;

    this.fontWeight = option.fontWeight;

    this.enableStroke = option.enableStroke;
    this.strokeColor = option.strokeColor;
    this.strokeWidth = option.strokeWidth;

    this.frameRange = option.frameRange;
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

  public async addTo(stage: Stage) {
    const canvas = stage.canvas;
    let {
      content,

      fontSize,
      color,
      fontWeight, 

      enableStroke,

      strokeWidth,
      strokeColor,
    } = this;

    const itext = new fabric.IText(content, {
      fill: color,
      left: 15,
      top: 15,
      fontWeight,
      fontSize: fontSize,
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

      inFrame: this.expandRange2Array(this.frameRange),
    });

    canvas.add(itext).renderAll();
    canvas.setActiveObject(itext);
  }

  public removeFrom(stage: Stage) {
  }
}