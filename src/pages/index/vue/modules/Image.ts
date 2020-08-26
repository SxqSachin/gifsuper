import { GifModule } from "./module";
import { fabric } from "fabric";
import { RangedFrameObject } from "../js/type";
import { getFileInfo } from "@/js/gif";

export class Image implements GifModule {
  private imgList: FileList;
  private frameRange: [number, number];

  public constructor(imgs: FileList, frameRange: [number, number]) {
    this.imgList = imgs;
    this.frameRange = frameRange;
  }

  public async addToStage(stage: fabric.Canvas) {
    const img = this.imgList[0];

    if (!img.type.includes('image')) {
      return;
    }

    const frameData = await getFileInfo(img);

    const initImageData: Promise<fabric.Object> = new Promise(resolve => {
      fabric.Image.fromURL(frameData.imgFileSrc, img => {
        const nimg = img.set({
          left: 15,
          top: 15,
          width: frameData.width,
          height: frameData.height,
          cornerColor: '#66a6ff',
          cornerSize: 8,
          transparentCorners: false
        }) as RangedFrameObject;

        nimg.set({
          type: 'nimg',

          inFrame: this.expandRange2Array(this.frameRange),
        });

        resolve(nimg);
      });
    });

    const imgObj = await initImageData;

    stage.add(imgObj).renderAll();
    stage.setActiveObject(imgObj);
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
}