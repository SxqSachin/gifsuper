import { PreviewOption } from "./preview";

// 用来保存对GIF图片进行的操作
export class GifState implements PreviewOption {

  // 倒放
  public revert: boolean = false;

  // 循环播放
  public repeat: boolean = true;

  // 抽帧
  public rs: boolean = false;

  // 反复
  public rloop: boolean = false;

  // 镜像
  public flipX: boolean = false;
  public flipY: boolean = false;

  public resize: boolean = false;

  public toggleState(key: keyof this, name?: string, resetTimeline: boolean = false): any {
    this[key] = !this[key] as any;

    return this[key];
  }
}